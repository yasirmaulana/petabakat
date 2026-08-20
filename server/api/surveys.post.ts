import { Prisma } from '@prisma/client'
import { prisma } from '~/server/utils/prisma'
import { calculateHasabScores, calculatePercentages } from '~/server/utils/hasabCalculator'
import { analyzeWithAi } from '~/server/utils/aiAnalyzer'
import { fallbackAnalysis } from '~/server/utils/fallbackAnalysis'
import { checkRateLimit } from '~/server/utils/rateLimiter'
import { sendWhatsAppMessage } from '~/server/utils/whatsapp'

export default defineEventHandler(async (event) => {
  // ponytail: per-IP limit 5 submissions per minute. Tune after real traffic analysis.
  checkRateLimit(event, { max: 5, windowMs: 60_000, keyPrefix: 'survey-submit' })

  const body = await readBody(event)

  const { survey, scores, percentages, orderedHasab, childAgeYears } = await prisma.$transaction(async (tx) => {
    const parent = await tx.parent.upsert({
      where: { phone: body.parentPhone },
      update: { name: body.parentName },
      create: { name: body.parentName, phone: body.parentPhone },
    })

    const child = await tx.child.create({
      data: {
        parentId: parent.id,
        name: body.childName,
        birthDate: new Date(body.childBirthDate),
        gender: body.childGender,
      },
    })

    const scores = calculateHasabScores(body.hasabAnswers)
    const percentages = calculatePercentages(scores)
    const orderedHasab = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([code]) => code)

    const birthDate = new Date(body.childBirthDate)
    const ageMs = Date.now() - birthDate.getTime()
    const childAgeYears = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25))

    const survey = await tx.survey.create({
      data: {
        childId: child.id,
        parentId: parent.id,
        status: 'processing',
        completedAt: new Date(),
        answers: {
          create: Object.entries(body.hasabAnswers).map(([questionId, value]) => ({
            questionId: Number(questionId),
            value: Number(value),
          })),
        },
        responses: {
          create: body.naturalResponses.map((option: string) => ({
            responseOption: option,
          })),
        },
      },
    })

    return { survey, scores, percentages, orderedHasab, childAgeYears }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000,
    timeout: 15000,
  })

  // AI analysis runs outside the DB transaction to avoid holding connections
  // while waiting for a slow external service. If it fails we still save a
  // fallback result so the user always has a report.
  processAnalysisAsync(survey.id, body.parentPhone, {
    scores,
    percentages,
    orderedHasab,
    naturalResponses: body.naturalResponses,
    nasabAnswers: body.nasabAnswers,
    childName: body.childName,
    childAgeYears,
    childGender: body.childGender,
  })

  return { surveyId: survey.publicId }
})

async function processAnalysisAsync(
  surveyId: number,
  parentPhone: string,
  input: {
    scores: { asyiha: number; ilmi: number; amali: number; wajdan: number }
    percentages: { asyiha: number; ilmi: number; amali: number; wajdan: number }
    orderedHasab: string[]
    naturalResponses: string[]
    nasabAnswers: Record<number, number>
    childName: string
    childAgeYears: number
    childGender: string
  },
) {
  const safeScores = {
    asyiha: input.scores.asyiha ?? 0,
    ilmi: input.scores.ilmi ?? 0,
    amali: input.scores.amali ?? 0,
    wajdan: input.scores.wajdan ?? 0,
  }
  const safePercentages = {
    asyiha: input.percentages.asyiha ?? 0,
    ilmi: input.percentages.ilmi ?? 0,
    amali: input.percentages.amali ?? 0,
    wajdan: input.percentages.wajdan ?? 0,
  }

  let analysis: any
  let source = 'ai'
  let usedModel: string | null = null

  try {
    analysis = await analyzeWithAi({
      scores: safeScores,
      percentages: safePercentages,
      orderedHasab: input.orderedHasab,
      naturalResponses: input.naturalResponses,
      nasabAnswers: input.nasabAnswers,
      childName: input.childName,
      childAgeYears: input.childAgeYears,
      childGender: input.childGender,
    })
    usedModel = analysis._model || null
  } catch (err) {
    console.error('AI analysis failed (all models exhausted), using fallback', err)
    analysis = fallbackAnalysis(safeScores, input.orderedHasab, input.naturalResponses)
    source = 'fallback'
  }

  try {
    await prisma.surveyResult.create({
      data: {
        surveyId,
        scoreAsyiha: safeScores.asyiha,
        scoreIlmi: safeScores.ilmi,
        scoreAmali: safeScores.amali,
        scoreWajdan: safeScores.wajdan,
        pctAsyiha: safePercentages.asyiha,
        pctIlmi: safePercentages.ilmi,
        pctAmali: safePercentages.amali,
        pctWajdan: safePercentages.wajdan,
        dominantHasab: input.orderedHasab[0] ?? '',
        source,
        personaLabel: analysis.personaLabel,
        personaDescription: analysis.personaDescription,
        scoreNarrative: analysis.scoreNarrative,
        parentNotes: analysis.parentNotes,
        microdosingPlan: analysis.microdosingPlan as Prisma.InputJsonValue,
        aiRawResponse: source === 'ai' ? (analysis as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        aiModel: usedModel,
      },
    })

    await prisma.survey.update({
      where: { id: surveyId },
      data: { status: 'completed' },
    })

    // Notify parent via WhatsApp after successful analysis.
    // This is fire-and-forget: failures are logged but do not fail the request.
    notifyParentAsync(surveyId, parentPhone, input.childName).catch((err) => {
      console.error('WhatsApp notification failed (background)', { surveyId, err })
    })
  } catch (err) {
    console.error('Failed to persist survey result', { surveyId, err })
    // Status remains 'processing' so monitoring/retries can pick it up.
    // In production this should alert Sentry/PagerDuty.
  }
}

async function notifyParentAsync(surveyId: number, parentPhone: string, childName: string) {
  const existing = await prisma.notificationLog.findUnique({ where: { surveyId } })
  if (existing) return

  const config = useRuntimeConfig()
  const baseUrl = config.public?.siteUrl || process.env.NUXT_PUBLIC_SITE_URL || 'https://petabakat.id'
  const historyUrl = `${baseUrl}/history`

  const message = `Assalamu'alaikum,\n\nHasil analisis Peta Bakat untuk ${childName} sudah selesai.\n\nSilakan lihat di Riwayat: ${historyUrl}\n\nTerima kasih.`

  const response = await sendWhatsAppMessage({ target: parentPhone, message })

  await prisma.notificationLog.create({
    data: {
      surveyId,
      channel: 'whatsapp',
      status: 'sent',
      response: response as Prisma.InputJsonValue,
    },
  })
}
