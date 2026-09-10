import { prisma } from '~/server/utils/prisma'
import { verifyHistoryToken } from '~/server/utils/auth'

const ROLES = ['kakek_ayah', 'nenek_ayah', 'kakek_ibu', 'nenek_ibu', 'ayah', 'ibu'] as const

export default defineEventHandler(async (event) => {
  // Harus login sebagai orang tua
  const rawToken = getCookie(event, 'history_session')
  if (!rawToken) throw createError({ statusCode: 401, message: 'Silakan login terlebih dahulu.' })
  const phone = await verifyHistoryToken(rawToken).catch(() => {
    throw createError({ statusCode: 401, message: 'Session expired.' })
  })

  const surveyPublicId = getRouterParam(event, 'surveyId')

  // Verifikasi survey milik pengguna dan sudah selesai
  const survey = await prisma.survey.findUnique({
    where: { publicId: surveyPublicId },
    include: { parent: true, familyAssessment: true },
  })
  if (!survey) throw createError({ statusCode: 404, message: 'Survey tidak ditemukan.' })
  if (survey.parent.phone !== phone) throw createError({ statusCode: 403, message: 'Akses ditolak.' })
  if (survey.status !== 'completed') throw createError({ statusCode: 400, message: 'Laporan anak belum selesai.' })

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
