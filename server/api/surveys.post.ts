import { Prisma } from '@prisma/client'
import { prisma } from '~/server/utils/prisma'
import { calculateNaturalResponseScores, calculatePercentages } from '~/server/utils/hasabCalculator'
import { signHistoryToken } from '~/server/utils/auth'
import { checkRateLimit } from '~/server/utils/rateLimiter'

export default defineEventHandler(async (event) => {
  // ponytail: per-IP limit 5 submissions per minute. Tune after real traffic analysis.
  checkRateLimit(event, { max: 5, windowMs: 60_000, keyPrefix: 'survey-submit' })

  const body = await readBody(event)

  const { survey, scores, percentages, orderedHasab } = await prisma.$transaction(async (tx) => {
    // Validate and consume voucher atomically
    let voucherId: number | null = null
    if (body.voucherId) {
      const voucher = await tx.voucher.findUnique({ where: { id: body.voucherId } })
      if (!voucher || voucher.status !== 'active') {
        throw createError({ statusCode: 400, message: 'Voucher tidak valid atau sudah tidak aktif.' })
      }
      if (voucher.expiresAt && voucher.expiresAt < new Date()) {
        throw createError({ statusCode: 400, message: 'Voucher sudah kadaluarsa.' })
      }
      if (voucher.usedCount >= voucher.quota) {
        throw createError({ statusCode: 400, message: 'Kuota voucher sudah habis.' })
      }
      await tx.voucher.update({
        where: { id: voucher.id },
        data: { usedCount: { increment: 1 } },
      })
      voucherId = voucher.id
    }

    const parent = await tx.parent.upsert({
      where: { phone: body.parentPhone },
      update: { name: body.parentName, ...(body.parentEmail ? { email: body.parentEmail } : {}) },
      create: { name: body.parentName, phone: body.parentPhone, email: body.parentEmail || null },
    })

    const child = await tx.child.create({
      data: {
        parentId: parent.id,
        name: body.childName,
        birthDate: new Date(body.childBirthDate),
        gender: body.childGender,
      },
    })

    const scores = calculateNaturalResponseScores(body.naturalResponses ?? [])
    const percentages = calculatePercentages(scores)
    const orderedHasab = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([code]) => code)

    const survey = await tx.survey.create({
      data: {
        childId: child.id,
        parentId: parent.id,
        voucherId,
        schoolId: body.schoolId || null,
        schoolCode: body.schoolCode || null,
        status: 'processing',
        completedAt: new Date(),
        responses: {
          create: body.naturalResponses.map((option: string) => ({
            responseOption: option,
          })),
        },
      },
    })

    return { survey, scores, percentages, orderedHasab }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000,
    timeout: 15000,
  })

  // Link survey ke dashboard sekolah jika kode valid dan consent diberikan
  if (body.schoolId && body.schoolConsent) {
    // Cari kelas default (kelas pertama di sekolah, atau buat placeholder)
    const schoolClass = await prisma.schoolClass.findFirst({
      where: { schoolId: body.schoolId },
      orderBy: { grade: 'asc' },
    })
    if (schoolClass) {
      await prisma.surveyStudent.create({
        data: { surveyId: survey.id, schoolClassId: schoolClass.id, consentGiven: true },
      }).catch(() => { /* ignore duplicate */ })
    }
  }

  // Simpan skor ke SurveyResult tanpa AI — konten AI (parentNotes, microdosingPlan, dll)
  // akan diisi oleh enrichSurveyResultWithFamily setelah family assessment selesai.
  await prisma.surveyResult.create({
    data: {
      surveyId: survey.id,
      scoreAsyiha: scores.asyiha,
      scoreIlmi: scores.ilmi,
      scoreAmali: scores.amali,
      scoreWajdan: scores.wajdan,
      pctAsyiha: percentages.asyiha,
      pctIlmi: percentages.ilmi,
      pctAmali: percentages.amali,
      pctWajdan: percentages.wajdan,
      dominantHasab: orderedHasab[0] ?? '',
      source: 'pending',
      personaLabel: '',
      personaDescription: '',
      scoreNarrative: '',
      parentNotes: '',
      microdosingPlan: Prisma.JsonNull,
      lesRecommendations: Prisma.JsonNull,
    },
  })

  // Set history_session otomatis agar user langsung bisa akses family assessment
  // tanpa perlu OTP lagi — nomor WA sudah terverifikasi saat pembelian voucher
  const sessionToken = await signHistoryToken(body.parentPhone)
  setCookie(event, 'history_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60,
    path: '/',
  })

  return { surveyId: survey.publicId }
})

