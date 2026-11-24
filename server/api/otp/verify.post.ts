import { prisma } from '~/server/utils/prisma'
import { signHistoryToken } from '~/server/utils/auth'
import { checkRateLimit } from '~/server/utils/rateLimiter'

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 hours
/** Percobaan maksimal per kode OTP — disimpan di DB agar berlaku lintas instance serverless. */
const MAX_OTP_ATTEMPTS = 5

export default defineEventHandler(async (event) => {
  checkRateLimit(event, { max: 10, windowMs: 5 * 60_000, keyPrefix: 'otp-verify' })

  const { phone, code } = await readBody(event)
  if (typeof phone !== 'string' || typeof code !== 'string' || !phone.trim() || !code.trim()) {
    throw createError({ statusCode: 400, statusMessage: 'phone and code required' })
  }

  const normalizedPhone = phone.trim()

  const otp = await prisma.otpCode.findFirst({
    where: { phone: normalizedPhone, used: false },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp || otp.expiresAt < new Date()) {
    throw createError({ statusCode: 401, statusMessage: 'Kode OTP salah atau sudah kadaluarsa' })
  }

  // Hitung percobaan secara atomik SEBELUM membandingkan kode, sehingga tebakan paralel tetap terbatas.
  const counted = await prisma.otpCode.updateMany({
    where: { id: otp.id, used: false, attempts: { lt: MAX_OTP_ATTEMPTS } },
    data: { attempts: { increment: 1 } },
  })
  if (counted.count === 0) {
    throw createError({ statusCode: 429, statusMessage: 'Terlalu banyak percobaan. Silakan minta kode baru.' })
  }

  if (otp.code !== code.trim()) {
    throw createError({ statusCode: 401, statusMessage: 'Kode OTP salah' })
  }

  const consumed = await prisma.otpCode.updateMany({ where: { id: otp.id, used: false }, data: { used: true } })
  if (consumed.count === 0) throw createError({ statusCode: 401, statusMessage: 'Kode OTP sudah digunakan' })

  const parent = await prisma.parent.findUnique({
    where: { phone: normalizedPhone },
    include: {
      surveys: {
        orderBy: { createdAt: 'desc' },
        include: {
          child: true,
          result: {
            select: {
              personaLabel: true,
              dominantHasab: true,
              scoreQiyadah: true,
              scoreIlmi: true,
              scoreAmali: true,
              scoreKaram: true,
              createdAt: true,
            },
          },
        },
      },
    },
  })

  if (!parent) throw createError({ statusCode: 404, statusMessage: 'Data tidak ditemukan' })

  const sessionToken = await signHistoryToken(normalizedPhone)
  setCookie(event, 'history_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: '/',
  })

  return {
    found: true,
    parent: { name: parent.name, phone: parent.phone },
    surveys: parent.surveys.map((s) => ({
      surveyId: s.publicId,
      childName: s.child.name,
      completedAt: s.completedAt,
      status: s.status,
      result: s.result,
    })),
  }
})
