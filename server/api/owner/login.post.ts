import { verifyAdminPassword, signOwnerToken } from '~/server/utils/ownerAuth'
import { checkRateLimit } from '~/server/utils/rateLimiter'

export default defineEventHandler(async (event) => {
  checkRateLimit(event, { max: 5, windowMs: 60_000, keyPrefix: 'owner-login' })

  const { password } = await readBody(event)
  if (!password || !verifyAdminPassword(String(password))) {
    throw createError({ statusCode: 401, message: 'Password salah.' })
  }

  const token = await signOwnerToken()
  setCookie(event, 'owner_session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60,
    path: '/',
  })

  return { ok: true }
})
