import { prisma } from '~/server/utils/prisma'
import { analyzeWithAi } from '~/server/utils/aiAnalyzer'
import { fallbackAnalysis } from '~/server/utils/fallbackAnalysis'
import { Prisma } from '@prisma/client'

// Admin-only: re-run AI enrichment untuk survey yang source-nya 'fallback'
export default defineEventHandler(async (event) => {
  const publicId = getRouterParam(event, 'surveyId')

  const existing = await prisma.surveyResult.findFirst({
    where: { survey: { publicId } },
    include: {
      survey: {
        include: {
          child: true,
          responses: { select: { responseOption: true } },
          answers: { select: { questionId: true, value: true } },
          familyAssessment: {
            include: {
              result: true,
              figures: { select: { role: true, isKnown: true } },
            },
          },
        },
      },
    },
  })

  if (!existing) throw createError({ statusCode: 404, message: 'Survey tidak ditemukan.' })

  const child = existing.survey.child
  const childAgeYears = Math.floor(
    (Date.now() - new Date(child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25),
  )
  const scores = {
    qiyadah: Number(existing.scoreQiyadah),
    ilmi: Number(existing.scoreIlmi),
    amali: Number(existing.scoreAmali),
    karam: Number(existing.scoreKaram),
  }
  const percentages = {
    qiyadah: Number(existing.pctQiyadah),
    ilmi: Number(existing.pctIlmi),
    amali: Number(existing.pctAmali),
    karam: Number(existing.pctKaram),
  }
  const orderedHasab = (Object.entries(scores) as [string, number][])
    .sort((a, b) => b[1] - a[1])
    .map(([k]) => k)
  const nasabAnswers: Record<number, number> = {}
  for (const ans of existing.survey.answers) nasabAnswers[ans.questionId] = ans.value

  const fr = existing.survey.familyAssessment?.result
  const skipped = (existing.survey.familyAssessment?.figures ?? [])
    .filter((f) => f.isKnown === false)
    .map((f) => f.role)

  const familyFitGap = fr
    ? {
        fitGapStatus: fr.fitGapStatus as 'OPTIMAL' | 'GAP',
        fitGapScore: Number(fr.fitGapScore),
        top3Hasab: fr.top3Hasab as string[],
        figuresIncluded: fr.figuresIncluded,
        recommendation: fr.recommendation,
        skippedFigures: skipped,
      }
    : undefined

  let analysis: Awaited<ReturnType<typeof analyzeWithAi>> | ReturnType<typeof fallbackAnalysis>
  let aiError: string | null = null
  try {
    analysis = await analyzeWithAi({
      scores, percentages, orderedHasab,
      naturalResponses: existing.survey.responses.map((r) => r.responseOption),
      nasabAnswers,
      childName: child.name,
      childAgeYears,
      childGender: child.gender,
      familyFitGap,
    })
  } catch (e: unknown) {
    aiError = String(e)
    analysis = fallbackAnalysis(scores, orderedHasab, existing.survey.responses.map((r) => r.responseOption))
  }

  const isAi = !('_fallback' in analysis)
  await prisma.surveyResult.update({
    where: { surveyId: existing.surveyId },
    data: {
      source: isAi ? 'ai' : 'fallback',
      personaLabel: analysis.personaLabel,
      personaDescription: analysis.personaDescription,
      scoreNarrative: analysis.scoreNarrative,
      fitGapNarrative: analysis.fitGapNarrative ?? '',
      parentNotes: analysis.parentNotes,
      microdosingPlan: analysis.microdosingPlan as Prisma.InputJsonValue,
      bridgingActions:
        (analysis.bridgingActions?.length ?? 0) > 0
          ? (analysis.bridgingActions as unknown as Prisma.InputJsonValue)
          : Prisma.JsonNull,
      lesRecommendations: analysis.lesRecommendations
        ? (analysis.lesRecommendations as unknown as Prisma.InputJsonValue)
        : Prisma.JsonNull,
    },
  })

  return { ok: true, source: isAi ? 'ai' : 'fallback', aiError }
})
