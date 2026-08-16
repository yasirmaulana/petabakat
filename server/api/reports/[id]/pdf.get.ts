import { prisma } from '~/server/utils/prisma'
import { buildPdfBuffer } from '~/server/utils/pdfBuilder'

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

  const pdfBuffer = buildPdfBuffer(result)

  const internalSurveyId = result.survey.id
  const fileName = `petabakat-report-${publicId}.pdf`
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
