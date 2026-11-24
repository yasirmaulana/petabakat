import { Prisma } from '@prisma/client'
import { prisma } from '~/server/utils/prisma'
import { calculateNaturalResponseScores, calculatePercentages } from '~/server/utils/hasabCalculator'
import { signSurveyToken, verifySurveyToken } from '~/server/utils/auth'
import { parseSurveyInput } from '~/server/utils/surveyInput'
import { checkRateLimit } from '~/server/utils/rateLimiter'
import { verifyRecaptcha } from '~/server/utils/verifyRecaptcha'

export default defineEventHandler(async (event) => {
  // ponytail: per-IP limit 5 submissions per minute. Tune after real traffic analysis.
  checkRateLimit(event, { max: 5, windowMs: 60_000, keyPrefix: 'survey-submit' })

  const rawBody = await readBody(event)
  await verifyRecaptcha(rawBody?.recaptchaToken, 'survey_submit')
  const body = parseSurveyInput(rawBody)

  const { survey, scores, percentages, orderedHasab } = await prisma.$transaction(async (tx) => {
    // Voucher wajib (sama dengan validasi di form survey), dicari berdasarkan KODE dan dipakai secara atomik
    const voucher = await tx.voucher.findUnique({ where: { code: body.voucherCode } })
    if (!voucher || voucher.status !== 'active') {
      throw createError({ statusCode: 400, message: 'Voucher tidak valid atau sudah tidak aktif.' })
    }
    if (voucher.expiresAt && voucher.expiresAt < new Date()) {
      throw createError({ statusCode: 400, message: 'Voucher sudah kadaluarsa.' })
    }
    const used = await tx.voucher.updateMany({
      where: { id: voucher.id, status: 'active', usedCount: { lt: voucher.quota } },
      data: { usedCount: { increment: 1 } },
    })
    if (used.count === 0) throw createError({ statusCode: 400, message: 'Kuota voucher sudah habis.' })
    const voucherId = voucher.id
    const voucherPartnerId = voucher.partnerId

    // Sekolah: dicari berdasarkan KODE dan divalidasi ulang di server (langganan & kapasitas)
    let schoolId: number | null = null
    if (body.schoolId && body.schoolCode) {
      const school = await tx.school.findUnique({
        where: { code: body.schoolCode },
        select: { id: true, billingStatus: true, studentCap: true, _count: { select: { surveys: true } } },
      })
      if (!school || school.id !== body.schoolId) throw createError({ statusCode: 400, message: 'Kode sekolah tidak valid.' })
      if (school.billingStatus === 'expired') throw createError({ statusCode: 400, message: 'Langganan sekolah sudah habis.' })
      if (school._count.surveys >= school.studentCap) throw createError({ statusCode: 400, message: 'Kapasitas siswa sekolah sudah penuh.' })
      schoolId = school.id
    }

    const parent = await tx.parent.upsert({
      where: { phone: body.parentPhone },
      // Nomor belum diverifikasi — jangan menimpa data orang tua yang sudah ada
      update: {},
      create: { name: body.parentName, phone: body.parentPhone, email: body.parentEmail },
    })

    const child = await tx.child.create({
      data: {
        parentId: parent.id,
        name: body.childName,
        birthDate: body.childBirthDate,
        gender: body.childGender,
      },
    })

    const scores = calculateNaturalResponseScores(body.naturalResponses)
    const percentages = calculatePercentages(scores)
    const orderedHasab = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([code]) => code)

    const survey = await tx.survey.create({
      data: {
        childId: child.id,
        parentId: parent.id,
        voucherId,
        schoolId,
        schoolCode: schoolId ? body.schoolCode : null,
        status: 'processing',
        completedAt: new Date(),
        responses: {
          create: body.naturalResponses.map((option: string) => ({
            responseOption: option,
          })),
        },
      },
    })

    if (voucherPartnerId) {
      const partner = await tx.partner.findUnique({ where: { id: voucherPartnerId }, select: { type: true, commissionRate: true } })
      if (partner?.type === 'affiliate') {
        await tx.commission.create({
          data: { partnerId: voucherPartnerId, surveyId: survey.id, amount: partner.commissionRate, status: 'pending' },
        })
      }
    }

    // Hubungkan ke kelas sekolah (consent wajib) — di dalam transaksi agar konsisten dengan cek kapasitas
    if (schoolId && body.schoolConsent && body.schoolClassId) {
      const schoolClass = await tx.schoolClass.findFirst({ where: { id: body.schoolClassId, schoolId } })
      if (schoolClass) {
        await tx.surveyStudent.create({ data: { surveyId: survey.id, schoolClassId: schoolClass.id, consentGiven: true } })
      }
    }

    return { survey, scores, percentages, orderedHasab }
  }, {
    isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    maxWait: 5000,
    timeout: 15000,
  })

  // Simpan skor ke SurveyResult tanpa AI — konten AI (parentNotes, microdosingPlan, dll)
  // akan diisi oleh enrichSurveyResultWithFamily setelah family assessment selesai.
  await prisma.surveyResult.create({
    data: {
      surveyId: survey.id,
      scoreQiyadah: scores.qiyadah,
      scoreIlmi: scores.ilmi,
      scoreAmali: scores.amali,
      scoreKaram: scores.karam,
      pctQiyadah: percentages.qiyadah,
      pctIlmi: percentages.ilmi,
      pctAmali: percentages.amali,
      pctKaram: percentages.karam,
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

  // Sesi khusus survey ini saja, agar user langsung lanjut ke family assessment & hasil.
  // Bukan history_session: nomor WA belum diverifikasi, jadi tidak boleh membuka survey lain milik nomor itu.
  const previous = getCookie(event, 'survey_session')
  const previousIds = previous ? await verifySurveyToken(previous).catch(() => []) : []
  const sessionToken = await signSurveyToken([...previousIds, survey.publicId])
  setCookie(event, 'survey_session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 12 * 60 * 60,
    path: '/',
  })

  return { surveyId: survey.publicId }
})

