import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const publicId = getRouterParam(event, 'id')

  const result = await prisma.surveyResult.findFirst({
    where: { survey: { publicId } },
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
    ...result,
    microdosingPlan: result.microdosingPlan as Record<string, unknown>,
  }
})
