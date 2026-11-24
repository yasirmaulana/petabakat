import type { H3Event } from 'h3'
import { requireMitraAuth, verifyHistoryToken, verifySurveyToken } from './auth'
import { requireOwnerSession } from './ownerAuth'
import { requireSchoolAuth } from './schoolAuth'

/** Prisma `select` untuk field yang dibutuhkan pengecekan akses survey. */
export const surveyAccessSelect = {
  publicId: true,
  parent: { select: { phone: true } },
  voucher: { select: { partnerId: true } },
  schoolStudent: { select: { consentGiven: true, schoolClass: { select: { schoolId: true } } } },
} as const

export interface SurveyAccessInfo {
  publicId: string
  parent: { phone: string }
  voucher?: { partnerId: number | null } | null
  schoolStudent?: { consentGiven: boolean; schoolClass: { schoolId: number } } | null
}

async function attempt<T>(fn: () => Promise<T>): Promise<T | null> {
  try {
    return await fn()
  } catch {
    return null
  }
}

/** Orang tua pemilik: login OTP dengan nomor yang sama, atau baru mengisi survey ini di browser ini. */
export async function isSurveyOwner(event: H3Event, survey: SurveyAccessInfo): Promise<boolean> {
  const history = getCookie(event, 'history_session')
  if (history && (await attempt(() => verifyHistoryToken(history))) === survey.parent.phone) return true
  const scoped = getCookie(event, 'survey_session')
  if (scoped && (await attempt(() => verifySurveyToken(scoped)))?.includes(survey.publicId)) return true
  return false
}

/** Boleh melihat hasil: pemilik, owner, mitra pemilik voucher, atau sekolah tempat siswa terdaftar (dengan consent). */
export async function canViewSurvey(event: H3Event, survey: SurveyAccessInfo): Promise<boolean> {
  const demoId = process.env.DEMO_RESULT_ID
  if (demoId && survey.publicId === demoId) return true
  if (await isSurveyOwner(event, survey)) return true
  if ((await attempt(() => requireOwnerSession(event).then(() => true))) === true) return true

  const partnerId = survey.voucher?.partnerId
  if (partnerId != null) {
    const mitra = await attempt(() => requireMitraAuth(event))
    if (mitra?.partnerId === partnerId) return true
  }

  const student = survey.schoolStudent
  if (student?.consentGiven) {
    const school = await attempt(() => requireSchoolAuth(event))
    if (school?.schoolId === student.schoolClass.schoolId) return true
  }
  return false
}

const DENIED = { statusCode: 403, message: 'Akses ditolak. Silakan login terlebih dahulu.' }

export async function requireSurveyOwner(event: H3Event, survey: SurveyAccessInfo): Promise<void> {
  if (!(await isSurveyOwner(event, survey))) throw createError(DENIED)
}

export async function requireSurveyView(event: H3Event, survey: SurveyAccessInfo): Promise<void> {
  if (!(await canViewSurvey(event, survey))) throw createError(DENIED)
}
