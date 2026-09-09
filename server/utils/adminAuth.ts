import { timingSafeEqual } from 'node:crypto'

export function requireAdmin(event: Parameters<typeof getHeader>[0]): void {
  const secret = process.env.ADMIN_SECRET
  if (!secret) throw createError({ statusCode: 500, message: 'Server misconfigured.' })

  const auth = getHeader(event, 'authorization') ?? ''
  const expected = `Bearer ${secret}`

  // Panjang harus sama dulu sebelum timingSafeEqual
  const authBuf = Buffer.from(auth.padEnd(expected.length, '\0'))
  const expBuf = Buffer.from(expected.padEnd(auth.length, '\0'))
  const lenOk = auth.length === expected.length
  const contentsOk = timingSafeEqual(
    authBuf.subarray(0, Math.max(auth.length, expected.length)),
    expBuf.subarray(0, Math.max(auth.length, expected.length)),
  )

  if (!lenOk || !contentsOk) {
    throw createError({ statusCode: 401, message: 'Unauthorized.' })
  }
}
