import { prisma } from '~/server/utils/prisma'
import { requireSchoolAuth } from '~/server/utils/schoolAuth'

export default defineEventHandler(async (event) => {
  const { schoolId, role } = await requireSchoolAuth(event)
  if (role !== 'admin') throw createError({ statusCode: 403, message: 'Hanya admin sekolah yang bisa tambah kelas.' })

  const { name, grade, year } = await readBody(event)
  if (!name || !grade || !year) throw createError({ statusCode: 400, message: 'Nama, tingkat, dan tahun ajaran wajib diisi.' })

  const kelas = await prisma.schoolClass.create({
    data: { schoolId, name, grade: Number(grade), year },
  })

  return kelas
})
