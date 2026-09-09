import { prisma } from '~/server/utils/prisma'
import { randomBytes } from 'node:crypto'
import { requireOwnerSession } from '~/server/utils/ownerAuth'

function generateCode(prefix = 'PMB'): string {
  return `${prefix}-${randomBytes(4).toString('hex').toUpperCase()}`
}

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)

  const body = await readBody(event)
  const count = Math.min(100, Math.max(1, Number(body.count) || 1))
  const quota = Math.max(1, Number(body.quota) || 1)
  const prefix = String(body.prefix || 'PMB').toUpperCase().slice(0, 10)
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    let code: string
    let attempts = 0
    do {
      code = generateCode(prefix)
      attempts++
      if (attempts > 20) throw createError({ statusCode: 500, message: 'Gagal generate kode unik.' })
    } while (codes.includes(code))
    codes.push(code)
  }

  const result = await prisma.voucher.createMany({
    data: codes.map((code) => ({ code, quota, expiresAt })),
    skipDuplicates: true,
  })

  return { created: result.count, codes }
})
