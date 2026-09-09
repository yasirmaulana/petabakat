import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const { code } = await readBody(event)

  if (!code || typeof code !== 'string') {
    throw createError({ statusCode: 400, message: 'Kode voucher wajib diisi.' })
  }

  const voucher = await prisma.voucher.findUnique({
    where: { code: code.trim().toUpperCase() },
  })

  if (!voucher) {
    throw createError({ statusCode: 404, message: 'Kode voucher tidak ditemukan.' })
  }

  if (voucher.status !== 'active') {
    throw createError({ statusCode: 400, message: 'Voucher sudah tidak aktif.' })
  }

  if (voucher.expiresAt && voucher.expiresAt < new Date()) {
    throw createError({ statusCode: 400, message: 'Voucher sudah kadaluarsa.' })
  }

  if (voucher.usedCount >= voucher.quota) {
    throw createError({ statusCode: 400, message: 'Kuota voucher sudah habis.' })
  }

  return { valid: true, voucherId: voucher.id }
})
