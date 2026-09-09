import { prisma } from '~/server/utils/prisma'
import { verifyPassword, signMitraToken } from '~/server/utils/auth'
import { checkRateLimit } from '~/server/utils/rateLimiter'

export default defineEventHandler(async (event) => {
  checkRateLimit(event, { max: 5, windowMs: 60_000, keyPrefix: 'login-mitra' })

  const { email, password } = await readBody(event)

  if (!email || !password) {
    throw createError({ statusCode: 400, message: 'Email dan password wajib diisi.' })
  }

  const partner = await prisma.partner.findUnique({ where: { email } })
  if (!partner) throw createError({ statusCode: 401, message: 'Email atau password salah.' })
  if (partner.status !== 'active') throw createError({ statusCode: 403, message: 'Akun mitra belum aktif atau ditangguhkan.' })

  const ok = await verifyPassword(password, partner.passwordHash)
  if (!ok) throw createError({ statusCode: 401, message: 'Email atau password salah.' })

  const token = await signMitraToken(partner.id, partner.type)

  setCookie(event, 'mitra_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 hari
    path: '/',
  })

  return {
    id: partner.id,
    name: partner.name,
    type: partner.type,
    institution: partner.institution,
    referralCode: partner.referralCode,
  }
})
