import { prisma } from '~/server/utils/prisma'
import { requireSchoolAuth } from '~/server/utils/schoolAuth'

export default defineEventHandler(async (event) => {
  const { schoolId } = await requireSchoolAuth(event)

  const classes = await prisma.schoolClass.findMany({
    where: { schoolId },
    orderBy: [{ grade: 'asc' }, { name: 'asc' }],
    include: {
      students: {
        where: { consentGiven: true },
        include: {
          survey: {
            select: {
              result: { select: { dominantCategory: true, personaLabel: true, pctAsyiha: true, pctIlmi: true, pctAmali: true, pctWajdan: true } },
            },
          },
        },
      },
    },
  })

  // Per-kelas aggregate untuk bar chart
  const perKelas = classes.map(kelas => {
    const withResult = kelas.students.filter(s => s.survey.result)
    const count = withResult.length
    return {
      kelasId: kelas.id,
      kelasName: kelas.name,
      grade: kelas.grade,
      totalSiswa: count,
      avgQiyadah: count ? withResult.reduce((s, r) => s + (r.survey.result!.pctAsyiha ?? 0), 0) / count : 0,
      avgIlmi: count ? withResult.reduce((s, r) => s + (r.survey.result!.pctIlmi ?? 0), 0) / count : 0,
      avgAmali: count ? withResult.reduce((s, r) => s + (r.survey.result!.pctAmali ?? 0), 0) / count : 0,
      avgWajdan: count ? withResult.reduce((s, r) => s + (r.survey.result!.pctWajdan ?? 0), 0) / count : 0,
    }
  })

  // Top personas
  const allPersonas: Record<string, number> = {}
  for (const kelas of classes) {
    for (const s of kelas.students) {
      const label = s.survey.result?.personaLabel
      if (label) allPersonas[label] = (allPersonas[label] || 0) + 1
    }
  }
  const topPersonas = Object.entries(allPersonas)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, count]) => ({ label, count }))

  return { perKelas, topPersonas }
})
