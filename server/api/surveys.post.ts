import { Prisma } from '@prisma/client'
import { prisma } from '~/server/utils/prisma'
import { calculateHasabScores, calculatePercentages } from '~/server/utils/hasabCalculator'
import { analyzeWithAi } from '~/server/utils/aiAnalyzer'
import { fallbackAnalysis } from '~/server/utils/fallbackAnalysis'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const parent = await prisma.parent.upsert({
    where: { phone: body.parentPhone },
    update: { name: body.parentName },
    create: { name: body.parentName, phone: body.parentPhone },
  })

  const child = await prisma.child.create({
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

  const survey = await prisma.survey.create({
    data: {
      childId: child.id,
      parentId: parent.id,
      status: 'completed',
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

  const birthDate = new Date(body.childBirthDate)
  const ageMs = Date.now() - birthDate.getTime()
  const childAgeYears = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25))

  let analysis: any
  let source = 'ai'
  let usedModel: string | null = null

  try {
    analysis = await analyzeWithAi({
      scores: {
        asyiha: scores.asyiha ?? 0,
        ilmi: scores.ilmi ?? 0,
        amali: scores.amali ?? 0,
        wajdan: scores.wajdan ?? 0,
      },
      percentages: {
        asyiha: percentages.asyiha ?? 0,
        ilmi: percentages.ilmi ?? 0,
        amali: percentages.amali ?? 0,
        wajdan: percentages.wajdan ?? 0,
      },
      orderedHasab,
      naturalResponses: body.naturalResponses,
      nasabAnswers: body.nasabAnswers,
      childName: body.childName,
      childAgeYears,
      childGender: body.childGender,
    })
    usedModel = analysis._model || null
  } catch (err) {
    console.error('AI analysis failed (all models exhausted), using fallback', err)
    analysis = fallbackAnalysis(
      { asyiha: scores.asyiha ?? 0, ilmi: scores.ilmi ?? 0, amali: scores.amali ?? 0, wajdan: scores.wajdan ?? 0 },
      orderedHasab,
      body.naturalResponses,
    )
    source = 'fallback'
  }

  await prisma.surveyResult.create({
    data: {
      surveyId: survey.id,
      scoreAsyiha: scores.asyiha ?? 0,
      scoreIlmi: scores.ilmi ?? 0,
      scoreAmali: scores.amali ?? 0,
      scoreWajdan: scores.wajdan ?? 0,
      pctAsyiha: percentages.asyiha ?? 0,
      pctIlmi: percentages.ilmi ?? 0,
      pctAmali: percentages.amali ?? 0,
      pctWajdan: percentages.wajdan ?? 0,
      dominantHasab: orderedHasab[0] ?? '',
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

  return { surveyId: survey.publicId }
})
