import { prisma } from '~/server/utils/prisma'
import { buildPdfBuffer } from '~/server/utils/pdfBuilder'
import { requireSurveyView } from '~/server/utils/surveyAccess'

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
          voucher: { select: { partnerId: true } },
          schoolStudent: { select: { consentGiven: true, schoolClass: { select: { schoolId: true } } } },
        },
      },
    },
  })

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Result not found' })
  }

  await requireSurveyView(event, result.survey)

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
