import { prisma } from '~/server/utils/prisma'
import { verifyHistoryToken } from '~/server/utils/auth'
import { calculateFamilyScores, calculateFitGap } from '~/server/utils/hasabFamilyCalculator'
import { analyzeWithAi } from '~/server/utils/aiAnalyzer'
import { fallbackAnalysis } from '~/server/utils/fallbackAnalysis'
import { sendWhatsAppMessage } from '~/server/utils/whatsapp'
import { Prisma } from '@prisma/client'

export default defineEventHandler(async (event) => {
  const rawToken = getCookie(event, 'history_session')
  if (!rawToken) throw createError({ statusCode: 401, message: 'Silakan login terlebih dahulu.' })
  const phone = await verifyHistoryToken(rawToken).catch(() => {
    throw createError({ statusCode: 401, message: 'Session expired.' })
  })

  const surveyPublicId = getRouterParam(event, 'surveyId')

  const survey = await prisma.survey.findUnique({
    where: { publicId: surveyPublicId },
    include: {
      parent: { select: { phone: true } },
      result: { select: { dominantHasab: true, scoreAsyiha: true, scoreIlmi: true, scoreAmali: true, scoreWajdan: true } },
      familyAssessment: {
        include: {
          figures: {
            include: {
              answers: {
                include: { question: { select: { code: true } } },
              },
            },
          },
          result: true,
        },
      },
    },
  })

  if (!survey) throw createError({ statusCode: 404, message: 'Survey tidak ditemukan.' })
  if (survey.parent.phone !== phone) throw createError({ statusCode: 403, message: 'Akses ditolak.' })

  const assessment = survey.familyAssessment
  if (!assessment) throw createError({ statusCode: 404, message: 'Assessment belum dimulai.' })
  if (assessment.status === 'completed') {
    return { ok: true, alreadyCompleted: true, result: assessment.result }
  }

  // Cek minimal 1 figur completed
  const completedFigures = assessment.figures.filter((f) => f.completedAt !== null)
  if (completedFigures.length === 0) {
    throw createError({ statusCode: 400, message: 'Isi minimal satu figur keluarga sebelum submit.' })
  }

  // Bangun input scoring
  const figureInputs = assessment.figures.map((f) => ({
    role: f.role,
    isKnown: f.isKnown,
    answers: f.answers.map((a) => ({ questionCode: a.question.code, value: a.value })),
  }))

  const { scores, top3Hasab, figuresIncluded } = calculateFamilyScores(figureInputs)

  // Ambil urutan rumpun anak dari SurveyResult yang sudah ada
  const childResult = survey.result
  const childOrdered = childResult
    ? (['asyiha', 'ilmi', 'amali', 'wajdan'] as const)
        .map((k) => ({ k, v: childResult[`score${k.charAt(0).toUpperCase() + k.slice(1)}` as 'scoreAsyiha'] }))
        .sort((a, b) => b.v - a.v)
        .map((x) => x.k)
    : []

  const { fitGapStatus, fitGapScore, recommendation } = calculateFitGap(childOrdered, top3Hasab)

  await prisma.$transaction([
    prisma.familyResult.upsert({
      where: { assessmentId: assessment.id },
      create: {
        assessmentId: assessment.id,
        scoreIlmi: scores.ilmi,
        scoreQiyadah: scores.qiyadah,
        scoreAmali: scores.amali,
        scoreWajdan: scores.wajdan,
        scoreTarbiyah: scores.tarbiyah,
        top3Hasab,
        fitGapStatus,
        fitGapScore,
        recommendation,
        figuresIncluded,
      },
      update: {
        scoreIlmi: scores.ilmi,
        scoreQiyadah: scores.qiyadah,
        scoreAmali: scores.amali,
        scoreWajdan: scores.wajdan,
        scoreTarbiyah: scores.tarbiyah,
        top3Hasab,
        fitGapStatus,
        fitGapScore,
        recommendation,
        figuresIncluded,
      },
    }),
    prisma.familyAssessment.update({
      where: { id: assessment.id },
      data: { status: 'completed', completedAt: new Date() },
    }),
  ])

  const skippedFigures = assessment.figures
    .filter((f) => f.isKnown === false)
    .map((f) => f.role)

  // ── Phase 4: Re-enrichment AI async ─────────────────────────────────────────
  enrichSurveyResultWithFamily({
    surveyId: survey.id,
    fitGapStatus,
    fitGapScore: Number(fitGapScore),
    top3Hasab,
    figuresIncluded,
    recommendation,
    skippedFigures,
  }).catch((err) => console.error('[family-enrichment] failed:', err))

  return {
    ok: true,
    scores,
    top3Hasab,
    figuresIncluded,
    fitGapStatus,
    fitGapScore,
    recommendation,
  }
})

async function enrichSurveyResultWithFamily(params: {
  surveyId: number
  fitGapStatus: string
  fitGapScore: number
  top3Hasab: string[]
  figuresIncluded: number
  recommendation: string
  skippedFigures: string[]
}) {
  const existing = await prisma.surveyResult.findUnique({
    where: { surveyId: params.surveyId },
    include: {
      survey: {
        include: {
          parent: { select: { phone: true } },
          child: { select: { name: true, birthDate: true, gender: true } },
          responses: { select: { responseOption: true } },
          answers: { select: { questionId: true, value: true } },
        },
      },
    },
  })
  if (!existing) return

  const child = existing.survey.child
  const childAgeYears = Math.floor(
    (Date.now() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  )

  const scores = {
    asyiha: Number(existing.scoreAsyiha),
    ilmi: Number(existing.scoreIlmi),
    amali: Number(existing.scoreAmali),
    wajdan: Number(existing.scoreWajdan),
  }
  const percentages = {
    asyiha: Number(existing.pctAsyiha),
    ilmi: Number(existing.pctIlmi),
    amali: Number(existing.pctAmali),
    wajdan: Number(existing.pctWajdan),
  }
  const orderedHasab = (['asyiha', 'ilmi', 'amali', 'wajdan'] as const)
    .map((k) => ({ k, v: scores[k] }))
    .sort((a, b) => b.v - a.v)
    .map((x) => x.k as string)

  const nasabAnswers: Record<number, number> = {}
  for (const ans of existing.survey.answers) {
    nasabAnswers[ans.questionId] = ans.value
  }

  let analysis: Awaited<ReturnType<typeof analyzeWithAi>> | ReturnType<typeof fallbackAnalysis>
  try {
    analysis = await analyzeWithAi({
      scores,
      percentages,
      orderedHasab,
      naturalResponses: existing.survey.responses.map((r) => r.responseOption),
      nasabAnswers,
      childName: child.name,
      childAgeYears,
      childGender: child.gender,
      familyFitGap: {
        fitGapStatus: params.fitGapStatus as 'OPTIMAL' | 'GAP',
        fitGapScore: params.fitGapScore,
        top3Hasab: params.top3Hasab,
        figuresIncluded: params.figuresIncluded,
        recommendation: params.recommendation,
        skippedFigures: params.skippedFigures,
      },
    })
  } catch {
    analysis = fallbackAnalysis(scores, orderedHasab, existing.survey.responses.map((r) => r.responseOption))
  }

  const isAi = !('_fallback' in analysis)
  await prisma.surveyResult.update({
    where: { surveyId: params.surveyId },
    data: {
      source: isAi ? 'ai' : 'fallback',
      personaLabel: analysis.personaLabel,
      personaDescription: analysis.personaDescription,
      scoreNarrative: analysis.scoreNarrative,
      fitGapNarrative: analysis.fitGapNarrative ?? '',
      parentNotes: analysis.parentNotes,
      microdosingPlan: analysis.microdosingPlan as Prisma.InputJsonValue,
      bridgingActions: (analysis.bridgingActions?.length ?? 0) > 0
        ? (analysis.bridgingActions as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
      lesRecommendations: analysis.lesRecommendations
        ? (analysis.lesRecommendations as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    },
  })

  await prisma.survey.update({
    where: { id: params.surveyId },
    data: { status: 'completed' },
  })

  // Kirim notifikasi WA ke orang tua
  await sendFamilyResultNotification({
    phone: existing.survey.parent.phone,
    childName: child.name,
    fitGapStatus: params.fitGapStatus,
    fitGapScore: params.fitGapScore,
    surveyPublicId: existing.survey.publicId,
  })
}

async function sendFamilyResultNotification(params: {
  phone: string
  childName: string
  fitGapStatus: string
  fitGapScore: number
  surveyPublicId: string
}) {
  try {
    const config = useRuntimeConfig()
    const baseUrl = (config.public as { siteUrl?: string })?.siteUrl
      || process.env.NUXT_PUBLIC_SITE_URL
      || 'https://petaminatbakat.id'
    const resultsUrl = `${baseUrl}/results/${params.surveyPublicId}#fit-gap`
    const pct = Math.round(params.fitGapScore * 100)
    const isOptimal = params.fitGapStatus === 'OPTIMAL'

    const message = isOptimal
      ? `Assalamu'alaikum,\n\nAnalisis *Hasab Keluarga* untuk ${params.childName} sudah selesai! 🎉\n\n✅ *Ekosistem Keluarga OPTIMAL* (${pct}% keselarasan)\n\nEkosistem keluarga Anda sangat mendukung potensi anak. Lihat detail Fit-Gap Ratio dan rekomendasi lengkap di:\n${resultsUrl}\n\nJazakallahu khairan.`
      : `Assalamu'alaikum,\n\nAnalisis *Hasab Keluarga* untuk ${params.childName} sudah selesai.\n\n⚡ *Fit-Gap Score: ${pct}%* — Ada celah yang bisa dioptimalkan.\n\nLihat detail dan rekomendasi bridging-nya di:\n${resultsUrl}\n\nJazakallahu khairan.`

    await sendWhatsAppMessage({ target: params.phone, message })
  } catch (err) {
    // Non-blocking — WA gagal tidak boleh crash enrichment
    console.error('[family-wa-notify] failed:', err)
  }
}
