import { prisma } from '~/server/utils/prisma'
import { requireSchoolAuth } from '~/server/utils/schoolAuth'

export default defineEventHandler(async (event) => {
  const { schoolId } = await requireSchoolAuth(event)

  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { name: true, plan: true, studentCap: true, billingStatus: true },
  })
  if (!school) throw createError({ statusCode: 404, message: 'Sekolah tidak ditemukan.' })

  // Semua survey yang terhubung ke sekolah ini dan consent diberikan
  const students = await prisma.surveyStudent.findMany({
    where: { schoolClass: { schoolId }, consentGiven: true },
    include: {
      survey: {
        select: {
          publicId: true,
          createdAt: true,
          child: { select: { name: true, gender: true, birthDate: true } },
          result: { select: { personaLabel: true, dominantCategory: true, pctAsyiha: true, pctIlmi: true, pctAmali: true, pctWajdan: true } },
        },
      },
      schoolClass: { select: { id: true, name: true, grade: true } },
    },
  })

  const totalSiswa = students.length
  const sudahSurvei = students.filter(s => s.survey.result).length

  // Sebaran rumpun dominan
  const sebaranRumpun: Record<string, number> = { qiyadah: 0, ilmi: 0, amali: 0, wajdan: 0, seimbang: 0 }
  for (const s of students) {
    const cat = s.survey.result?.dominantCategory?.toLowerCase()
    if (cat && cat in sebaranRumpun) sebaranRumpun[cat]++
    else if (cat) sebaranRumpun.seimbang++
  }

  // Laporan terbaru (10)
  const recentSiswa = students
    .filter(s => s.survey.result)
    .sort((a, b) => b.survey.createdAt.getTime() - a.survey.createdAt.getTime())
    .slice(0, 10)
    .map(s => ({ ...s.survey, kelas: s.schoolClass.name }))

  return {
    school,
    totalSiswa,
    sudahSurvei,
    belumSurvei: totalSiswa - sudahSurvei,
    sebaranRumpun,
    recentSiswa,
  }
})
