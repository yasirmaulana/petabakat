import { prisma } from '~/server/utils/prisma'
import { hashPassword } from '~/server/utils/auth'
import { requireOwnerSession } from '~/server/utils/ownerAuth'
import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id.' })

  const body = await readBody(event).catch(() => ({}))
  const rawPassword = body?.password || randomBytes(6).toString('base64url')
  const passwordHash = await hashPassword(rawPassword)

  const partner = await prisma.partner.update({
    where: { id },
    data: { status: 'active', passwordHash },
    select: { id: true, name: true, email: true, phone: true },
  })

  // Kirim kredensial via WA
  try {
    const { sendWhatsAppMessage } = await import('~/server/utils/whatsapp')
    const config = useRuntimeConfig()
    const baseUrl = (config.public as { siteUrl?: string })?.siteUrl || 'https://petabakat.otomatisin.web.id'
    const message = `✅ *Akun Mitra PetaMinatBakat Aktif*\n\nHalo ${partner.name}!\n\nAkun mitra kamu sudah aktif.\n\nLogin di: ${baseUrl}/mitra/login\nEmail: ${partner.email}\nPassword: ${rawPassword}\n\nSilakan ganti password setelah login pertama.`
    await sendWhatsAppMessage({ target: partner.phone, message })
  } catch {
    // Notif WA opsional
  }

  return { ok: true, partner, temporaryPassword: rawPassword }
})
