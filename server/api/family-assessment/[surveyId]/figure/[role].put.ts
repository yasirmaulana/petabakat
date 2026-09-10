import { prisma } from '~/server/utils/prisma'
import { verifyHistoryToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const rawToken = getCookie(event, 'history_session')
  if (!rawToken) throw createError({ statusCode: 401, message: 'Silakan login terlebih dahulu.' })
  const phone = await verifyHistoryToken(rawToken).catch(() => {
    throw createError({ statusCode: 401, message: 'Session expired.' })
  })

  const surveyPublicId = getRouterParam(event, 'surveyId')
  const role = getRouterParam(event, 'role')

  const survey = await prisma.survey.findUnique({
    where: { publicId: surveyPublicId },
    include: {
      parent: { select: { phone: true } },
      familyAssessment: {
        include: { figures: { where: { role } } },
      },
    },
  })
  if (!survey) throw createError({ statusCode: 404, message: 'Survey tidak ditemukan.' })
  if (survey.parent.phone !== phone) throw createError({ statusCode: 403, message: 'Akses ditolak.' })

  const assessment = survey.familyAssessment
  if (!assessment) throw createError({ statusCode: 404, message: 'Assessment belum dimulai.' })
  if (assessment.status === 'completed') throw createError({ statusCode: 400, message: 'Assessment sudah selesai.' })

  const figure = assessment.figures[0]
  if (!figure) throw createError({ statusCode: 404, message: `Figur ${role} tidak ditemukan.` })

  const body = await readBody(event)
  // body.isKnown: boolean — tandai figur tidak dikenal/meninggal
  // body.answers: { questionId: number; value: number }[]

  if (typeof body.isKnown === 'boolean' && !body.isKnown) {
    // Figur di-skip — hapus jawaban yang ada, tandai tidak dikenal
    await prisma.$transaction([
      prisma.familyAnswer.deleteMany({ where: { figureId: figure.id } }),
      prisma.familyFigure.update({
        where: { id: figure.id },
        data: { isKnown: false, completedAt: new Date() },
      }),
    ])
    return { ok: true, skipped: true }
  }

  const answers: { questionId: number; value: number }[] = body.answers ?? []
  if (!answers.length) throw createError({ statusCode: 400, message: 'Tidak ada jawaban dikirim.' })

  // Validasi nilai Likert
  for (const a of answers) {
    if (a.value < 1 || a.value > 5) throw createError({ statusCode: 400, message: 'Nilai harus antara 1–5.' })
  }

  await prisma.$transaction([
    // Upsert jawaban (idempoten — bisa dipanggil berkali-kali untuk auto-save)
    ...answers.map((a) =>
      prisma.familyAnswer.upsert({
        where: { figureId_questionId: { figureId: figure.id, questionId: a.questionId } },
        create: { figureId: figure.id, questionId: a.questionId, value: a.value },
        update: { value: a.value },
      }),
    ),
    prisma.familyFigure.update({
      where: { id: figure.id },
      data: { isKnown: true, completedAt: new Date() },
    }),
  ])

  return { ok: true, saved: answers.length }
})
