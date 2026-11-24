import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { prisma } from './prisma'

const SALT_ROUNDS = 10

function getSecret(key = 'JWT_SECRET'): Uint8Array {
  const secret = process.env[key] || process.env.JWT_SECRET
  if (!secret) throw new Error(`${key} env var not set`)
  return new TextEncoder().encode(secret)
}

function getMitraSecret() { return getSecret('MITRA_JWT_SECRET') }
function getHistorySecret() { return getSecret('HISTORY_JWT_SECRET') }
function getSurveySecret() { return getSecret('SURVEY_JWT_SECRET') }

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export async function signMitraToken(partnerId: number, type: string): Promise<string> {
  return new SignJWT({ sub: String(partnerId), type, aud: 'mitra' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getMitraSecret())
}

export async function verifyMitraToken(token: string): Promise<{ partnerId: number; type: string }> {
  const { payload } = await jwtVerify(token, getMitraSecret(), { audience: 'mitra' })
  return { partnerId: Number(payload.sub), type: payload.type as string }
}

export function getMitraTokenFromEvent(event: Parameters<typeof getHeader>[0]): string | null {
  const cookie = getCookie(event, 'mitra_token')
  if (cookie) return cookie
  const auth = getHeader(event, 'authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export async function requireMitraAuth(event: Parameters<typeof getHeader>[0]) {
  const token = getMitraTokenFromEvent(event)
  if (!token) throw createError({ statusCode: 401, message: 'Login diperlukan.' })
  let session: { partnerId: number; type: string }
  try {
    session = await verifyMitraToken(token)
  } catch {
    throw createError({ statusCode: 401, message: 'Sesi tidak valid atau sudah habis.' })
  }
  // Token berlaku 7 hari — mitra yang disuspend harus langsung kehilangan akses.
  const partner = await prisma.partner.findUnique({ where: { id: session.partnerId }, select: { status: true } })
  if (partner?.status !== 'active') {
    throw createError({ statusCode: 403, message: 'Akun mitra belum aktif atau ditangguhkan.' })
  }
  return session
}

export async function signHistoryToken(phone: string): Promise<string> {
  return new SignJWT({ sub: phone, aud: 'history' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .sign(getHistorySecret())
}

export async function verifyHistoryToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, getHistorySecret(), { audience: 'history' })
  if (!payload.sub) throw new Error('invalid token')
  return payload.sub
}

const MAX_SURVEYS_PER_TOKEN = 5

/**
 * Token sesi yang hanya berlaku untuk survey yang diisi di browser ini (nomor WA belum diverifikasi).
 * Menyimpan beberapa id terakhir agar orang tua dengan beberapa anak tidak terkunci dari survey sebelumnya.
 */
export async function signSurveyToken(surveyPublicIds: string[]): Promise<string> {
  const sids = [...new Set(surveyPublicIds)].slice(-MAX_SURVEYS_PER_TOKEN)
  return new SignJWT({ sids, aud: 'survey' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(getSurveySecret())
}

export async function verifySurveyToken(token: string): Promise<string[]> {
  const { payload } = await jwtVerify(token, getSurveySecret(), { audience: 'survey' })
  const sids = payload.sids
  if (!Array.isArray(sids) || !sids.every((s) => typeof s === 'string')) throw new Error('invalid token')
  return sids
}
