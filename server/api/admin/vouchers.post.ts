import { prisma } from '~/server/utils/prisma'
import { randomBytes } from 'node:crypto'
import { requireAdmin } from '~/server/utils/adminAuth'

function generateCode(prefix = 'PMB'): string {
  const rand = randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}-${rand}`
}

export default defineEventHandler(async (event) => {
  requireAdmin(event)

  const body = await readBody(event)
  const count = Number(body.count) || 1
  const quota = Number(body.quota) || 1
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
  const prefix = body.prefix || 'PMB'

  if (count < 1 || count > 100) {
    throw createError({ statusCode: 400, message: 'count harus antara 1-100.' })
  }

  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    let code: string
    let attempts = 0
    do {
      code = generateCode(prefix)
      attempts++
      if (attempts > 10) throw createError({ statusCode: 500, message: 'Gagal generate kode unik.' })
    } while (codes.includes(code))
    codes.push(code)
  }

  const vouchers = await prisma.voucher.createMany({
    data: codes.map((code) => ({
      code,
      quota,
      expiresAt,
    })),
    skipDuplicates: true,
  })

  return { created: vouchers.count, codes }
})
