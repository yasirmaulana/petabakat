import { prisma } from '~/server/utils/prisma'
import { hashPassword } from '~/server/utils/auth'
import { randomBytes } from 'node:crypto'

function makeReferralCode(name: string, type: string): string {
  const prefix = type === 'institutional' ? 'INST' : 'REF'
  const slug = name.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  const rand = randomBytes(2).toString('hex').toUpperCase()
  return `${prefix}-${slug}-${rand}`
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { name, institution, type, email, phone } = body

  if (!name || !type || !email || !phone) {
    throw createError({ statusCode: 400, message: 'Nama, jenis mitra, email, dan nomor WA wajib diisi.' })
  }
  if (!['institutional', 'affiliate'].includes(type)) {
    throw createError({ statusCode: 400, message: 'Jenis mitra tidak valid.' })
  }

  const exists = await prisma.partner.findUnique({ where: { email } })
  if (exists) throw createError({ statusCode: 409, message: 'Email sudah terdaftar.' })

  const referralCode = makeReferralCode(name, type)
  // Password placeholder — akan di-set oleh admin saat approve
  const passwordHash = await hashPassword(randomBytes(16).toString('hex'))

  const partner = await prisma.partner.create({
    data: { name, institution: institution || null, type, email, phone, passwordHash, referralCode, status: 'pending' },
    select: { id: true, name: true, email: true, referralCode: true },
  })

  // Notif ke admin WA
  try {
    const { sendWhatsAppMessage } = await import('~/server/utils/whatsapp')
    const adminPhone = process.env.ADMIN_PHONE
    const typeLabel = type === 'institutional' ? 'Institusi (Bimbel)' : 'Personal (Affiliate)'
    const message = `🆕 *Pendaftaran Mitra Baru*\n\nNama: ${name}\nInstansi: ${institution || '-'}\nJenis: ${typeLabel}\nEmail: ${email}\nWA: ${phone}\n\nApprove:\nPOST /api/admin/mitra/${partner.id}/approve\nAuthorization: Bearer $ADMIN_SECRET`
    await sendWhatsAppMessage({ target: adminPhone, message })
  } catch {
    // Notif opsional
  }

  return { ok: true, message: 'Pendaftaran diterima. Admin akan menghubungi kamu dalam 1–2 hari kerja.' }
})
