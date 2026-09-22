import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const surveyPublicId = getRouterParam(event, 'surveyId')

  const survey = await prisma.survey.findUnique({
    where: { publicId: surveyPublicId },
    include: {
      familyAssessment: {
        include: {
          result: true,
        },
      },
    },
  })

  if (!survey) throw createError({ statusCode: 404, message: 'Survey tidak ditemukan.' })

  if (!survey.familyAssessment) {
    return { exists: false }
  }

  return { exists: true, assessment: survey.familyAssessment }
})
