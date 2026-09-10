import { prisma } from '~/server/utils/prisma'
import { requireOwnerSession } from '~/server/utils/ownerAuth'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [
    totalSurveys,
    thisMonthSurveys,
    completedSurveys,
    totalVouchers,
    activeVouchers,
    totalMitra,
    pendingMitra,
    pendingCommissions,
    totalSekolah,
    activeSekolah,
    totalFamilyAssessments,
    completedFamilyAssessments,
    optimalFitGap,
  ] = await Promise.all([
    prisma.survey.count(),
    prisma.survey.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.survey.count({ where: { status: 'completed' } }),
    prisma.voucher.count(),
    prisma.voucher.count({ where: { status: 'active' } }),
    prisma.partner.count(),
    prisma.partner.count({ where: { status: 'pending' } }),
    prisma.commission.aggregate({
      where: { status: 'pending' },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.school.count(),
    prisma.school.count({ where: { billingStatus: 'active' } }),
    prisma.familyAssessment.count(),
    prisma.familyAssessment.count({ where: { status: 'completed' } }),
    prisma.familyResult.count({ where: { fitGapStatus: 'OPTIMAL' } }),
  ])

  // 30-day daily survey trend
  const dailyRaw = await prisma.survey.groupBy({
    by: ['createdAt'],
    where: { createdAt: { gte: thirtyDaysAgo } },
    _count: { id: true },
  })

  // Bucket by day string YYYY-MM-DD
  const dayMap: Record<string, number> = {}
  for (const row of dailyRaw) {
    const day = row.createdAt.toISOString().slice(0, 10)
    dayMap[day] = (dayMap[day] ?? 0) + row._count.id
  }
  const trend = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(thirtyDaysAgo.getTime() + i * 24 * 60 * 60 * 1000)
    const key = d.toISOString().slice(0, 10)
    return { date: key, count: dayMap[key] ?? 0 }
  })

  const estimatedRevenue = completedSurveys * 99000

  return {
    surveys: { total: totalSurveys, thisMonth: thisMonthSurveys, completed: completedSurveys },
    vouchers: { total: totalVouchers, active: activeVouchers },
    mitra: { total: totalMitra, pending: pendingMitra },
    commissions: {
      pendingCount: pendingCommissions._count,
      pendingTotal: pendingCommissions._sum.amount ?? 0,
    },
    sekolah: { total: totalSekolah, active: activeSekolah },
    familyAssessments: {
      total: totalFamilyAssessments,
      completed: completedFamilyAssessments,
      optimal: optimalFitGap,
      gap: completedFamilyAssessments - optimalFitGap,
    },
    estimatedRevenue,
    trend,
  }
})
