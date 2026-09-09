import { prisma } from '~/server/utils/prisma'
import { buildPdfBuffer } from '~/server/utils/pdfBuilder'
import { verifyHistoryToken, getMitraTokenFromEvent, verifyMitraToken } from '~/server/utils/auth'
import { getSchoolTokenFromEvent, verifySchoolToken } from '~/server/utils/schoolAuth'

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

  // Auth check
  let allowed = false
  const raw = getCookie(event, 'history_session')
  if (raw) {
    try {
      const phone = await verifyHistoryToken(raw)
      if (phone === result.survey.parent.phone) allowed = true
    } catch {}
  }
  if (!allowed) {
    const mt = getMitraTokenFromEvent(event)
    if (mt) { try { await verifyMitraToken(mt); allowed = true } catch {} }
  }
  if (!allowed) {
    const st = getSchoolTokenFromEvent(event)
    if (st) { try { await verifySchoolToken(st); allowed = true } catch {} }
  }
  if (!allowed) {
    throw createError({ statusCode: 403, message: 'Akses ditolak. Silakan login terlebih dahulu.' })
  }

  const pdfBuffer = buildPdfBuffer(result)

  const internalSurveyId = result.survey.id
  const fileName = `petaminatbakat-report-${publicId}.pdf`
  const filePath = `/reports/${fileName}`

  const existing = await prisma.pdfReport.findFirst({ where: { surveyId: internalSurveyId } })
  if (existing) {
    await prisma.pdfReport.update({ where: { id: existing.id }, data: { filePath } })
  } else {
    await prisma.pdfReport.create({ data: { surveyId: internalSurveyId, filePath } })
  }

  setResponseHeader(event, 'Content-Type', 'application/pdf')
  setResponseHeader(event, 'Content-Disposition', `inline; filename="${fileName}"`)
  return pdfBuffer
})
