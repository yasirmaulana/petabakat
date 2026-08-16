import puppeteer from 'puppeteer'
import { prisma } from '~/server/utils/prisma'
import { buildPdfHtml } from '~/server/utils/pdfTemplate'

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

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  })

  const page = await browser.newPage()
  const html = buildPdfHtml(result)
  await page.setContent(html, { waitUntil: 'load' })

  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  })

  await browser.close()

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
