import { prisma } from '~/server/utils/prisma'

function makeSchoolCode(name: string, year: number): string {
  const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, '-').replace(/-+/g, '-').slice(0, 15).replace(/-$/, '')
  return `${slug}-${year}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, npsn, city, estimatedStudents, adminEmail, adminPhone } = body

  if (!name || !adminEmail || !adminPhone) {
    throw createError({ statusCode: 400, message: 'Nama sekolah, email, dan nomor WA admin wajib diisi.' })
  }

  const year = new Date().getFullYear()
  let code = makeSchoolCode(name, year)

  // pastikan unik
  const existing = await prisma.school.findUnique({ where: { code } })
  if (existing) code = `${code}-${Math.floor(Math.random() * 90 + 10)}`

  const school = await prisma.school.create({
    data: { name, npsn: npsn || null, city: city || null, code, adminEmail, adminPhone, billingStatus: 'trial' },
    select: { id: true, name: true, code: true },
  })

  // Notif admin
  try {
    const { sendWhatsAppMessage } = await import('~/server/utils/whatsapp')
    const adminWa = process.env.ADMIN_PHONE
    await sendWhatsAppMessage({
      target: adminWa,
      message: `🏫 *Pendaftaran Sekolah Baru*\n\nNama: ${name}\nNPSN: ${npsn || '-'}\nKota: ${city || '-'}\nEstimasi siswa: ${estimatedStudents || '-'}\nEmail: ${adminEmail}\nWA: ${adminPhone}\n\nAktifkan:\nPOST /api/admin/sekolah/${school.id}/activate`,
    })
  } catch { /* opsional */ }

  return { ok: true, message: 'Pendaftaran diterima. Admin akan menghubungi dalam 1–2 hari kerja.' }
})
