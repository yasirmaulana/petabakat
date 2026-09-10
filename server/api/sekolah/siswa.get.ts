import { prisma } from '~/server/utils/prisma'
import { requireSchoolAuth } from '~/server/utils/schoolAuth'

export default defineEventHandler(async (event) => {
  const { schoolId, role } = await requireSchoolAuth(event)
  const query = getQuery(event)

  const kelasFilter = query.kelasId ? { schoolClassId: Number(query.kelasId) } : {}
  const rumpunFilter = query.rumpun
    ? { survey: { result: { dominantCategory: query.rumpun as string } } }
    : {}

  const students = await prisma.surveyStudent.findMany({
    where: {
      consentGiven: true,
      schoolClass: { schoolId },
      ...kelasFilter,
      ...rumpunFilter,
    },
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
    orderBy: { survey: { createdAt: 'desc' } },
  })

  return students
})
