import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const publicId = getRouterParam(event, 'id')

  const survey = await prisma.survey.findUnique({
    where: { publicId },
    select: {
      id: true,
      status: true,
      publicId: true,
      completedAt: true,
    },
  })

  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' })
  }

  if (survey.status === 'processing') {
    return {
      status: 'processing',
      surveyId: survey.publicId,
      message: 'Analisis masih diprosses, silakan tunggu sebentar.',
    }
  }

  const result = await prisma.surveyResult.findUnique({
    where: { surveyId: survey.id },
    include: {
      survey: {
        include: {
          child: true,
          parent: true,
          responses: true,
        },
      },
    },
  })

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Result not found' })
  }

  return {
    status: 'completed',
    ...result,
    microdosingPlan: result.microdosingPlan as Record<string, unknown>,
  }
})
