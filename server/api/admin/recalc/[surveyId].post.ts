import { prisma } from '~/server/utils/prisma'
import { calculateFamilyScores, calculateFitGap } from '~/server/utils/hasabFamilyCalculator'

// Admin-only: hitung ulang family scores dengan normalisasi terbaru
export default defineEventHandler(async (event) => {
  const publicId = getRouterParam(event, 'surveyId')

  const survey = await prisma.survey.findUnique({
    where: { publicId },
    include: {
      result: { select: { dominantHasab: true, scoreQiyadah: true, scoreIlmi: true, scoreAmali: true, scoreKaram: true } },
      familyAssessment: {
        include: {
          figures: {
            include: { answers: { include: { question: { select: { code: true } } } } },
          },
        },
      },
    },
  })

  if (!survey) throw createError({ statusCode: 404, message: 'Survey tidak ditemukan.' })
  if (!survey.familyAssessment) throw createError({ statusCode: 404, message: 'Belum ada family assessment.' })

  const figureInputs = survey.familyAssessment.figures.map((f) => ({
    role: f.role,
    isKnown: f.isKnown,
    answers: f.answers.map((a) => ({ questionCode: a.question.code, value: a.value })),
  }))

  const { scores, top3Hasab, figuresIncluded } = calculateFamilyScores(figureInputs)

  const childResult = survey.result
  const childOrdered = childResult
    ? (['qiyadah', 'ilmi', 'amali', 'karam'] as const)
        .map((k) => ({ k, v: childResult[`score${k.charAt(0).toUpperCase() + k.slice(1)}` as 'scoreQiyadah'] }))
        .sort((a, b) => b.v - a.v)
        .map((x) => x.k)
    : []

  const { fitGapStatus, fitGapScore, recommendation } = calculateFitGap(childOrdered, top3Hasab)

  await prisma.familyResult.update({
    where: { assessmentId: survey.familyAssessment.id },
    data: {
      scoreIlmi: scores.ilmi,
      scoreQiyadah: scores.qiyadah,
      scoreAmali: scores.amali,
      scoreKaram: scores.karam,
      scoreTarbiyah: scores.tarbiyah,
      top3Hasab,
      fitGapStatus,
      fitGapScore,
      recommendation,
      figuresIncluded,
    },
  })

  return { ok: true, scores, top3Hasab, fitGapStatus, fitGapScore }
})
