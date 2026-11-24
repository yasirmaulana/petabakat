import { prisma } from '~/server/utils/prisma'
import { checkRateLimit } from '~/server/utils/rateLimiter'
import { randomInt } from 'node:crypto'

const RESEND_COOLDOWN_MS = 60_000

export default defineEventHandler(async (event) => {
  checkRateLimit(event, { max: 3, windowMs: 5 * 60_000, keyPrefix: 'otp-send' })

  const { phone: rawPhone } = await readBody(event)
  if (typeof rawPhone !== 'string' || !rawPhone.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'phone required' })
  }
  const phone = rawPhone.trim()

  // Respons sama untuk nomor terdaftar maupun tidak — mencegah enumerasi nomor orang tua.
  const parent = await prisma.parent.findUnique({ where: { phone }, select: { id: true } })
  if (!parent) return { sent: true }

  // Cooldown per nomor (berbasis DB, berlaku lintas instance) — mencegah spam WA dan reset kuota tebakan.
  const last = await prisma.otpCode.findFirst({ where: { phone }, orderBy: { createdAt: 'desc' }, select: { createdAt: true } })
  if (last && Date.now() - last.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    throw createError({ statusCode: 429, statusMessage: 'Tunggu 1 menit sebelum meminta kode baru.' })
  }

  // Hapus OTP lama yang belum dipakai untuk nomor ini
  await prisma.otpCode.deleteMany({ where: { phone, used: false } })

  const code = String(randomInt(100000, 1000000))
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 menit

  await prisma.otpCode.create({ data: { phone, code, expiresAt } })

  const config = useRuntimeConfig()
  const message = `Kode verifikasi PetaMinatBakat Anda: *${code}*\n\nBerlaku 5 menit. Jangan bagikan ke siapapun.`

  await $fetch(config.whatsappApiUrl, {
    method: 'POST',
    headers: { Authorization: config.whatsappFonnteToken },
    body: { target: phone, message },
  })

  return { sent: true }
})
