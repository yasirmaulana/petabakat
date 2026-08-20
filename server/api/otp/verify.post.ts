import { prisma } from '~/server/utils/prisma'

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 // 24 hours

export default defineEventHandler(async (event) => {
  const { phone, code } = await readBody(event)
  if (!phone?.trim() || !code?.trim()) throw createError({ statusCode: 400, statusMessage: 'phone and code required' })

  const normalizedPhone = phone.trim()

  const otp = await prisma.otpCode.findFirst({
    where: { phone: normalizedPhone, code: code.trim(), used: false },
    orderBy: { createdAt: 'desc' },
  })

  if (!otp) throw createError({ statusCode: 401, statusMessage: 'Kode OTP salah' })
  if (otp.expiresAt < new Date()) throw createError({ statusCode: 401, statusMessage: 'Kode OTP sudah kadaluarsa' })

  await prisma.otpCode.update({ where: { id: otp.id }, data: { used: true } })

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
              scoreAsyiha: true,
              scoreIlmi: true,
              scoreAmali: true,
              scoreWajdan: true,
              createdAt: true,
            },
          },
        },
      },
    },
  })

  if (!parent) throw createError({ statusCode: 404, statusMessage: 'Data tidak ditemukan' })

  setCookie(event, 'history_session', normalizedPhone, {
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
