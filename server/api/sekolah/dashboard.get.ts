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
          familyAssessment: {
            select: { status: true, result: { select: { fitGapStatus: true, fitGapScore: true } } },
          },
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

  // Agregat Fit-Gap per kelas
  const fitGapByKelas: Record<string, { kelasId: number; kelasName: string; optimal: number; gap: number; total: number }> = {}
  for (const s of students) {
    const fg = s.survey.familyAssessment?.result
    if (!fg) continue
    const kId = s.schoolClass.id
    if (!fitGapByKelas[kId]) {
      fitGapByKelas[kId] = { kelasId: kId, kelasName: s.schoolClass.name, optimal: 0, gap: 0, total: 0 }
    }
    fitGapByKelas[kId].total++
    if (fg.fitGapStatus === 'OPTIMAL') fitGapByKelas[kId].optimal++
    else fitGapByKelas[kId].gap++
  }

  // Ringkasan Fit-Gap sekolah keseluruhan
  const allCompleted = students.filter(s => s.survey.familyAssessment?.result)
  const fitGapSummary = {
    total: allCompleted.length,
    optimal: allCompleted.filter(s => s.survey.familyAssessment?.result?.fitGapStatus === 'OPTIMAL').length,
    gap: allCompleted.filter(s => s.survey.familyAssessment?.result?.fitGapStatus === 'GAP').length,
    perKelas: Object.values(fitGapByKelas).sort((a, b) => a.kelasName.localeCompare(b.kelasName)),
  }

  return {
    school,
    totalSiswa,
    sudahSurvei,
    belumSurvei: totalSiswa - sudahSurvei,
    sebaranRumpun,
    recentSiswa,
    fitGapSummary,
  }
})
