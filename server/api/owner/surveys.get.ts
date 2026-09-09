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
          { child: { name: { contains: search, mode: 'insensitive' as const } } },
          { parent: { name: { contains: search, mode: 'insensitive' as const } } },
          { parent: { phone: { contains: search } } },
          { voucher: { code: { contains: search, mode: 'insensitive' as const } } },
        ],
      }
    : {}

  const where = status ? { status, ...searchFilter } : searchFilter

  const [surveys, total] = await Promise.all([
    prisma.survey.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        publicId: true,
        status: true,
        createdAt: true,
        completedAt: true,
        child: { select: { name: true, birthDate: true } },
        parent: { select: { name: true, phone: true } },
        voucher: { select: { code: true } },
        school: { select: { name: true } },
        result: { select: { personaLabel: true } },
      },
    }),
    prisma.survey.count({ where }),
  ])

  return { surveys, total, page, pages: Math.ceil(total / limit) }
})
