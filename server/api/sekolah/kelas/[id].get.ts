import { prisma } from '~/server/utils/prisma'
import { requireSchoolAuth } from '~/server/utils/schoolAuth'

export default defineEventHandler(async (event) => {
  const { schoolId } = await requireSchoolAuth(event)
  const id = Number(getRouterParam(event, 'id'))

  const kelas = await prisma.schoolClass.findFirst({
    where: { id, schoolId },
    include: {
      students: {
        where: { consentGiven: true },
        include: {
          survey: {
            select: {
              publicId: true,
              createdAt: true,
              child: { select: { name: true, gender: true, birthDate: true } },
              result: { select: { personaLabel: true, dominantCategory: true, pctQiyadah: true, pctIlmi: true, pctAmali: true, pctKaram: true } },
            },
          },
        },
      },
    },
  })

  if (!kelas) throw createError({ statusCode: 404, message: 'Kelas tidak ditemukan.' })

  // Rata-rata skor kelas
  const withResult = kelas.students.filter(s => s.survey.result)
  const avgScores = withResult.length > 0 ? {
    qiyadah: withResult.reduce((s, r) => s + (r.survey.result!.pctQiyadah ?? 0), 0) / withResult.length,
    ilmi: withResult.reduce((s, r) => s + (r.survey.result!.pctIlmi ?? 0), 0) / withResult.length,
    amali: withResult.reduce((s, r) => s + (r.survey.result!.pctAmali ?? 0), 0) / withResult.length,
    karam: withResult.reduce((s, r) => s + (r.survey.result!.pctKaram ?? 0), 0) / withResult.length,
  } : null

  return { ...kelas, avgScores }
})
