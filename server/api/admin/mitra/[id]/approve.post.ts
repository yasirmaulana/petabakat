import { prisma } from '~/server/utils/prisma'
import { hashPassword } from '~/server/utils/auth'
import { requireAdmin } from '~/server/utils/adminAuth'
import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const id = Number(getRouterParam(event, 'id'))
  const body = await readBody(event)

  const rawPassword = body.password || randomBytes(6).toString('base64url')
  const passwordHash = await hashPassword(rawPassword)

  const partner = await prisma.partner.update({
    where: { id },
    data: { status: 'active', passwordHash },
    select: { id: true, name: true, email: true, phone: true, type: true },
  })

  // Kirim kredensial via WA
  try {
    const { sendWhatsAppMessage } = await import('~/server/utils/whatsapp')
    const message = `✅ *Akun Mitra PetaMinatBakat Aktif*\n\nHalo ${partner.name}!\n\nAkun mitra kamu sudah aktif.\n\nLogin di: ${process.env.APP_URL || 'http://localhost:3000'}/mitra/login\nEmail: ${partner.email}\nPassword: ${rawPassword}\n\nSilakan ganti password setelah login pertama.`
    await sendWhatsAppMessage({ target: partner.phone, message })
  } catch {
    // Notif WA opsional
  }

  return { ok: true, partner, temporaryPassword: rawPassword }
})
