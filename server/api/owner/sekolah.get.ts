import { prisma } from '~/server/utils/prisma'
import { requireOwnerSession } from '~/server/utils/ownerAuth'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)

  const q = getQuery(event)
  const search = String(q.q || '').trim()
  const page = Math.max(1, Number(q.page) || 1)
  const limit = 50
  const skip = (page - 1) * limit

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { code: { contains: search, mode: 'insensitive' as const } },
          { city: { contains: search, mode: 'insensitive' as const } },
          { npsn: { contains: search, mode: 'insensitive' as const } },
        ],
      }
    : undefined

  const [schools, total] = await Promise.all([
    prisma.school.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { surveys: true, users: true, classes: true } },
      },
    }),
    prisma.school.count({ where }),
  ])

  return { schools, total, page, pages: Math.ceil(total / limit) }
})
