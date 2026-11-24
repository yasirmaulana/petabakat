import { prisma } from '~/server/utils/prisma'
import { requireSurveyOwner } from '~/server/utils/surveyAccess'

export default defineEventHandler(async (event) => {
  const surveyPublicId = getRouterParam(event, 'surveyId')

  const survey = await prisma.survey.findUnique({
    where: { publicId: surveyPublicId },
    include: {
      parent: { select: { phone: true } },
      familyAssessment: {
        include: {
          figures: {
            orderBy: { id: 'asc' },
            include: {
              answers: {
                include: { question: { select: { id: true, code: true, dimension: true, order: true, text: true } } },
              },
            },
          },
          result: true,
        },
      },
    },
  })

  if (!survey) throw createError({ statusCode: 404, message: 'Survey tidak ditemukan.' })
  await requireSurveyOwner(event, survey)

  if (!survey.familyAssessment) {
    return { exists: false }
  }

  return { exists: true, assessment: survey.familyAssessment }
})
