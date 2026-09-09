import { prisma } from '~/server/utils/prisma'
import { hashPassword } from '~/server/utils/auth'
import { requireAdmin } from '~/server/utils/adminAuth'
import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const school = await prisma.school.findUnique({ where: { id } })
  if (!school) throw createError({ statusCode: 404, message: 'Sekolah tidak ditemukan.' })

  const rawPassword = body.password || randomBytes(6).toString('base64url')
  const passwordHash = await hashPassword(rawPassword)
  const plan = body.plan || 'starter'
  const studentCap = body.studentCap || (plan === 'growth' ? 100 : plan === 'pesantren' ? 300 : 30)

  await prisma.school.update({
    where: { id },
    data: { billingStatus: 'active', plan, studentCap },
  })

  // Buat akun admin sekolah
  const adminUser = await prisma.schoolUser.create({
    data: {
      schoolId: id,
      email: school.adminEmail,
      name: `Admin ${school.name}`,
      role: 'admin',
      passwordHash,
    },
  })

  try {
    const { sendWhatsAppMessage } = await import('~/server/utils/whatsapp')
    const appUrl = process.env.APP_URL || 'http://localhost:3000'
    await sendWhatsAppMessage({
      target: school.adminPhone,
      message: `✅ *Dashboard Sekolah PetaMinatBakat Aktif*\n\nHalo ${school.name}!\n\nAkun dashboard sekolah kamu sudah aktif.\n\nLogin di: ${appUrl}/sekolah/login\nEmail: ${school.adminEmail}\nPassword: ${rawPassword}\nKode Sekolah: ${school.code}\n\nBagikan kode sekolah ke orang tua agar data siswa terhubung ke dashboard kamu.`,
    })
  } catch { /* opsional */ }

  return { ok: true, school: { id, name: school.name, code: school.code, plan }, temporaryPassword: rawPassword }
})
