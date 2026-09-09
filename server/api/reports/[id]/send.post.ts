import { prisma } from '~/server/utils/prisma'
import { verifyHistoryToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  // Auth: harus login sebagai pemilik survei
  const raw = getCookie(event, 'history_session')
  if (!raw) throw createError({ statusCode: 401, message: 'Login diperlukan.' })

  let callerPhone: string
  try { callerPhone = await verifyHistoryToken(raw) }
  catch { throw createError({ statusCode: 401, message: 'Sesi tidak valid.' }) }

  const publicId = getRouterParam(event, 'id')

  const result = await prisma.surveyResult.findFirst({
    where: { survey: { publicId } },
    include: {
      survey: {
        include: {
          parent: true,
          child: true,
        },
      },
    },
  })

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Result not found' })
  }

  if (result.survey.parent.phone !== callerPhone) {
    throw createError({ statusCode: 403, message: 'Akses ditolak.' })
  }

  const config = useRuntimeConfig()
  const phone = result.survey.parent.phone
  const childName = result.survey.child?.name || 'anak Anda'
  const parentName = result.survey.parent.name || ''
  const internalSurveyId = result.survey.id
  const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://petaminatbakat.com'
  const reportUrl = `${siteUrl}/api/reports/${publicId}/pdf`

  const message = `Assalamu'alaikum ${parentName},\n\nBerikut laporan PetaMinatBakat untuk ${childName}:\n${reportUrl}\n\nSemoga bermanfaat untuk memetakan potensi anak.`

  try {
    const response = await $fetch(config.whatsappApiUrl, {
      method: 'POST',
      headers: { Authorization: config.whatsappFonnteToken },
      body: { target: phone, message },
    })

    const existing = await prisma.pdfReport.findFirst({ where: { surveyId: internalSurveyId } })
    if (existing) {
      await prisma.pdfReport.update({ where: { id: existing.id }, data: { sentViaWa: true, sentAt: new Date() } })
    } else {
      await prisma.pdfReport.create({
        data: { surveyId: internalSurveyId, filePath: `/reports/petaminatbakat-report-${publicId}.pdf`, sentViaWa: true, sentAt: new Date() },
      })
    }

    return { success: true }
  } catch (err) {
    console.error('WhatsApp send failed', err)
    throw createError({ statusCode: 502, statusMessage: 'Failed to send WhatsApp message' })
  }
})
