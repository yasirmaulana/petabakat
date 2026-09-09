import { prisma } from '~/server/utils/prisma'
import { requireOwnerSession } from '~/server/utils/ownerAuth'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)

  const q = getQuery(event)
  const status = q.status as string | undefined
  const search = String(q.q || '').trim()
  const page = Math.max(1, Number(q.page) || 1)
  const limit = 50
  const skip = (page - 1) * limit

  const searchFilter = search
    ? {
        OR: [
          { partner: { name: { contains: search, mode: 'insensitive' as const } } },
          { partner: { phone: { contains: search } } },
          { partner: { email: { contains: search, mode: 'insensitive' as const } } },
        ],
      }
    : {}

  const where = status ? { status, ...searchFilter } : (Object.keys(searchFilter).length ? searchFilter : undefined)

  const [commissions, total, summary] = await Promise.all([
    prisma.commission.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        partner: { select: { name: true, email: true, phone: true } },
      },
    }),
    prisma.commission.count({ where }),
    prisma.commission.aggregate({
      where: { status: 'pending' },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  return {
    commissions,
    total,
    page,
    pages: Math.ceil(total / limit),
    pendingTotal: summary._sum.amount ?? 0,
    pendingCount: summary._count,
  }
})
