import { prisma } from '~/server/utils/prisma'
import { verifyHistoryToken } from '~/server/utils/auth'

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
  if (survey.parent.phone !== phone) throw createError({ statusCode: 403, message: 'Akses ditolak.' })

  if (!survey.familyAssessment) {
    return { exists: false }
  }

  return { exists: true, assessment: survey.familyAssessment }
})
