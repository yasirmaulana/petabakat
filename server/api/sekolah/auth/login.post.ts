import { prisma } from '~/server/utils/prisma'
import { verifyPassword } from '~/server/utils/auth'
import { signSchoolToken } from '~/server/utils/schoolAuth'
import { checkRateLimit } from '~/server/utils/rateLimiter'

export default defineEventHandler(async (event) => {
  checkRateLimit(event, { max: 5, windowMs: 60_000, keyPrefix: 'login-sekolah' })

  const { email, password } = await readBody(event)
  if (!email || !password) throw createError({ statusCode: 400, message: 'Email dan password wajib diisi.' })

  const user = await prisma.schoolUser.findUnique({
    where: { email },
    include: { school: { select: { id: true, name: true, billingStatus: true } } },
  })
  if (!user) throw createError({ statusCode: 401, message: 'Email atau password salah.' })
  if (user.school.billingStatus === 'expired') throw createError({ statusCode: 403, message: 'Langganan sekolah sudah habis.' })

  const ok = await verifyPassword(password, user.passwordHash)
  if (!ok) throw createError({ statusCode: 401, message: 'Email atau password salah.' })

  const token = await signSchoolToken(user.id, user.schoolId, user.role)
  setCookie(event, 'school_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return { id: user.id, name: user.name, role: user.role, school: user.school }
})
