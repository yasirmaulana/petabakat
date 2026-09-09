import { SignJWT, jwtVerify } from 'jose'

function getSecret(): Uint8Array {
  const secret = process.env.SCHOOL_JWT_SECRET || process.env.JWT_SECRET
  if (!secret) throw new Error('SCHOOL_JWT_SECRET env var not set')
  return new TextEncoder().encode(secret)
}

export async function signSchoolToken(userId: number, schoolId: number, role: string): Promise<string> {
  return new SignJWT({ sub: String(userId), schoolId, role, aud: 'school' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getSecret())
}

export async function verifySchoolToken(token: string): Promise<{ userId: number; schoolId: number; role: string }> {
  const { payload } = await jwtVerify(token, getSecret(), { audience: 'school' })
  return {
    userId: Number(payload.sub),
    schoolId: payload.schoolId as number,
    role: payload.role as string,
  }
}

export function getSchoolTokenFromEvent(event: Parameters<typeof getHeader>[0]): string | null {
  const cookie = getCookie(event, 'school_token')
  if (cookie) return cookie
  const auth = getHeader(event, 'authorization')
  if (auth?.startsWith('Bearer ')) return auth.slice(7)
  return null
}

export async function requireSchoolAuth(event: Parameters<typeof getHeader>[0]) {
  const token = getSchoolTokenFromEvent(event)
  if (!token) throw createError({ statusCode: 401, message: 'Login diperlukan.' })
  try {
    return await verifySchoolToken(token)
  } catch {
    throw createError({ statusCode: 401, message: 'Sesi tidak valid atau sudah habis.' })
  }
}
