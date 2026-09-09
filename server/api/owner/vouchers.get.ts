import { prisma } from '~/server/utils/prisma'
import { requireOwnerSession } from '~/server/utils/ownerAuth'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)

  const q = getQuery(event)
  const page = Math.max(1, Number(q.page) || 1)
  const search = String(q.q || '').trim()
  const limit = 50
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { code: { contains: search, mode: 'insensitive' as const } },
          { partner: { name: { contains: search, mode: 'insensitive' as const } } },
        ],
      }
    : undefined

  const [vouchers, total] = await Promise.all([
    prisma.voucher.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { partner: { select: { name: true } } },
    }),
    prisma.voucher.count({ where }),
  ])

  return { vouchers, total, page, pages: Math.ceil(total / limit) }
})
