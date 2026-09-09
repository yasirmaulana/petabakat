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
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { phone: { contains: search, mode: 'insensitive' as const } },
          { referralCode: { contains: search, mode: 'insensitive' as const } },
          { institution: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : {}

  const where = status ? { status, ...searchFilter } : searchFilter

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, institution: true, type: true,
        email: true, phone: true, referralCode: true, status: true,
        creditBalance: true, commissionRate: true, createdAt: true,
        _count: { select: { vouchers: true, commissions: true } },
      },
    }),
    prisma.partner.count({ where }),
  ])

  return { partners, total, page, pages: Math.ceil(total / limit) }
})
