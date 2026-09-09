import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { code } = await readBody(event)
  if (!code) throw createError({ statusCode: 400, message: 'Kode sekolah wajib diisi.' })

  const school = await prisma.school.findUnique({
    where: { code: code.trim().toUpperCase() },
    select: { id: true, name: true, billingStatus: true, studentCap: true, _count: { select: { surveys: true } } },
  })

  if (!school) throw createError({ statusCode: 404, message: 'Kode sekolah tidak ditemukan.' })
  if (school.billingStatus === 'expired') throw createError({ statusCode: 400, message: 'Langganan sekolah sudah habis.' })
  if (school._count.surveys >= school.studentCap) throw createError({ statusCode: 400, message: 'Kapasitas siswa sekolah sudah penuh.' })

  return { schoolId: school.id, schoolName: school.name }
})
