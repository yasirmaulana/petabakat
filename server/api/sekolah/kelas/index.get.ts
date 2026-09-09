import { prisma } from '~/server/utils/prisma'
import { requireSchoolAuth } from '~/server/utils/schoolAuth'

export default defineEventHandler(async (event) => {
  const { schoolId, role } = await requireSchoolAuth(event)
  const query = getQuery(event)
  const year = (query.year as string) || new Date().getFullYear().toString()

  const classes = await prisma.schoolClass.findMany({
    where: { schoolId, year: { contains: year } },
    orderBy: [{ grade: 'asc' }, { name: 'asc' }],
    include: {
      _count: { select: { students: { where: { consentGiven: true } } } },
    },
  })

  return classes.map(c => ({ ...c, totalSiswa: c._count.students }))
})
