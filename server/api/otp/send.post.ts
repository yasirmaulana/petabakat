import { prisma } from '~/server/utils/prisma'
import { checkRateLimit } from '~/server/utils/rateLimiter'
import { randomInt } from 'node:crypto'

export default defineEventHandler(async (event) => {
  checkRateLimit(event, { max: 3, windowMs: 5 * 60_000, keyPrefix: 'otp-send' })

  const { phone } = await readBody(event)
  if (!phone?.trim()) throw createError({ statusCode: 400, statusMessage: 'phone required' })

  const parent = await prisma.parent.findUnique({ where: { phone: phone.trim() } })
  if (!parent) throw createError({ statusCode: 404, statusMessage: 'Nomor tidak ditemukan' })

  // Hapus OTP lama yang belum expired untuk nomor ini
  await prisma.otpCode.deleteMany({ where: { phone: phone.trim(), used: false } })

  const code = String(randomInt(100000, 1000000))
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 menit

  await prisma.otpCode.create({ data: { phone: phone.trim(), code, expiresAt } })

  const config = useRuntimeConfig()
  const message = `Kode verifikasi PetaMinatBakat Anda: *${code}*\n\nBerlaku 5 menit. Jangan bagikan ke siapapun.`

  await $fetch(config.whatsappApiUrl, {
    method: 'POST',
    headers: { Authorization: config.whatsappFonnteToken },
    body: { target: phone.trim(), message },
  })

  return { sent: true }
})
