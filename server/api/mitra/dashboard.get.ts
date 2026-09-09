import { prisma } from '~/server/utils/prisma'
import { requireMitraAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { partnerId, type } = await requireMitraAuth(event)

  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: { creditBalance: true, commissionRate: true, referralCode: true },
  })
  if (!partner) throw createError({ statusCode: 404, message: 'Mitra tidak ditemukan.' })

  // Laporan yang di-generate via voucher mitra ini
  const vouchersWithSurveys = await prisma.voucher.findMany({
    where: { partnerId },
    select: {
      id: true,
      code: true,
      usedCount: true,
      quota: true,
      surveys: {
        select: {
          id: true,
          publicId: true,
          createdAt: true,
          child: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  })

  const totalLaporan = vouchersWithSurveys.reduce((sum, v) => sum + v.usedCount, 0)

  // Komisi (hanya affiliate)
  let totalKomisi = 0
  let komisiPending = 0
  if (type === 'affiliate') {
    const commissions = await prisma.commission.findMany({
      where: { partnerId },
      select: { amount: true, status: true },
    })
    totalKomisi = commissions.reduce((sum, c) => sum + c.amount, 0)
    komisiPending = commissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.amount, 0)
  }

  const recentLaporan = vouchersWithSurveys
    .flatMap(v => v.surveys.map(s => ({ ...s, voucherCode: v.code })))
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 10)

  return {
    creditBalance: partner.creditBalance,
    commissionRate: partner.commissionRate,
    referralCode: partner.referralCode,
    totalLaporan,
    totalKomisi,
    komisiPending,
    recentLaporan,
  }
})
