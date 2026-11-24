import { prisma } from '~/server/utils/prisma'
import { requireMitraAuth } from '~/server/utils/auth'
import { randomBytes } from 'node:crypto'

function generateCode(prefix: string): string {
  const rand = randomBytes(4).toString('hex').toUpperCase()
  return `${prefix}-${rand}`
}

export default defineEventHandler(async (event) => {
  const { partnerId, type } = await requireMitraAuth(event)

  const body = await readBody(event)
  const count = Number(body.count) || 1
  const expiresAt = body.expiresAt ? new Date(body.expiresAt) : null

  if (count < 1 || count > 50) {
    throw createError({ statusCode: 400, message: 'count harus antara 1–50.' })
  }

  const partner = await prisma.partner.findUnique({ where: { id: partnerId }, select: { creditBalance: true, referralCode: true } })
  if (!partner) throw createError({ statusCode: 404, message: 'Mitra tidak ditemukan.' })

  // Institusi: voucher langsung aktif, dipotong dari kredit prabayar.
  // Affiliate: voucher dibuat berstatus pending_payment — baru aktif setelah admin konfirmasi pembayaran orang tua.
  if (type === 'institutional' && partner.creditBalance < count) {
    throw createError({ statusCode: 400, message: `Kredit tidak cukup. Sisa: ${partner.creditBalance}, diminta: ${count}.` })
  }

  const prefix = partner.referralCode.split('-')[0] || 'MX'
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

  const status = type === 'institutional' ? 'active' : 'pending_payment'
  const createdCount = await prisma.$transaction(async (tx) => {
    if (type === 'institutional') {
      // Potong kredit hanya jika saldo masih cukup — atomik, mencegah saldo minus saat request bersamaan
      const debited = await tx.partner.updateMany({
        where: { id: partnerId, creditBalance: { gte: count } },
        data: { creditBalance: { decrement: count } },
      })
      if (debited.count === 0) throw createError({ statusCode: 400, message: 'Kredit tidak cukup.' })
    }
    // Tanpa skipDuplicates: bila ada kode bentrok, seluruh transaksi (termasuk potong kredit) dibatalkan
    const created = await tx.voucher.createMany({
      data: codes.map(code => ({ code, quota: 1, partnerId, expiresAt, status })),
    })
    return created.count
  })

  return { created: createdCount, codes, status }
})
