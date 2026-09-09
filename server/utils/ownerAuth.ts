import { SignJWT, jwtVerify } from 'jose'
import { timingSafeEqual } from 'node:crypto'

function getSecret(): Uint8Array {
  const s = process.env.ADMIN_SECRET
  if (!s) throw new Error('ADMIN_SECRET env var not set')
  return new TextEncoder().encode(s + '-owner-session')
}

export async function signOwnerToken(): Promise<string> {
  return new SignJWT({ sub: 'owner', aud: 'owner' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('12h')
    .sign(getSecret())
}

export async function verifyOwnerToken(token: string): Promise<void> {
  await jwtVerify(token, getSecret(), { audience: 'owner' })
}

export function getOwnerTokenFromEvent(event: Parameters<typeof getCookie>[0]): string | null {
  return getCookie(event, 'owner_session') ?? null

}

export function requireOwnerSession(event: Parameters<typeof getCookie>[0]): Promise<void> {
  const token = getOwnerTokenFromEvent(event)
  if (!token) throw createError({ statusCode: 401, message: 'Unauthorized.' })
  return verifyOwnerToken(token).catch(() => {
    throw createError({ statusCode: 401, message: 'Session expired.' })
  })
}

/** Verify the raw ADMIN_SECRET password (for the login form) */
export function verifyAdminPassword(input: string): boolean {
  const secret = process.env.ADMIN_SECRET
  if (!secret) return false
  const aBuf = Buffer.from(input.padEnd(secret.length, '\0'))
  const bBuf = Buffer.from(secret.padEnd(input.length, '\0'))
  const lenOk = input.length === secret.length
  const contentsOk = timingSafeEqual(
    aBuf.subarray(0, Math.max(input.length, secret.length)),
    bBuf.subarray(0, Math.max(input.length, secret.length)),
  )
  return lenOk && contentsOk
}
