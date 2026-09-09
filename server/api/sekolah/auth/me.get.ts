import { prisma } from '~/server/utils/prisma'
import { requireSchoolAuth } from '~/server/utils/schoolAuth'

export default defineEventHandler(async (event) => {
  const { userId, schoolId, role } = await requireSchoolAuth(event)
  const user = await prisma.schoolUser.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  })
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    select: { id: true, name: true, code: true, plan: true, studentCap: true, billingStatus: true, city: true },
  })
  if (!user || !school) throw createError({ statusCode: 404, message: 'User tidak ditemukan.' })
  return { ...user, school }
})
