import { prisma } from '~/server/utils/prisma'
import { requireSurveyOwner } from '~/server/utils/surveyAccess'

const ROLES = ['kakek_ayah', 'nenek_ayah', 'kakek_ibu', 'nenek_ibu', 'ayah', 'ibu'] as const

export default defineEventHandler(async (event) => {
  const surveyPublicId = getRouterParam(event, 'surveyId')

  // Verifikasi survey milik pengguna dan sudah selesai
  const survey = await prisma.survey.findUnique({
    where: { publicId: surveyPublicId },
    include: { parent: true, familyAssessment: true },
  })
  if (!survey) throw createError({ statusCode: 404, message: 'Survey tidak ditemukan.' })
  await requireSurveyOwner(event, survey)

  // Cegah duplikasi
  if (survey.familyAssessment) {
    return { assessmentPublicId: survey.familyAssessment.publicId, alreadyExists: true }
  }

  // Buat assessment + 6 figur sekaligus
  const assessment = await prisma.familyAssessment.create({
    data: {
      surveyId: survey.id,
      figures: {
        create: ROLES.map((role) => ({ role, isKnown: true })),
      },
    },
    include: { figures: { select: { id: true, role: true } } },
  })

  return { assessmentPublicId: assessment.publicId, figures: assessment.figures }
})
