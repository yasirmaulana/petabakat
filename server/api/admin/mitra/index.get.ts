import { prisma } from '~/server/utils/prisma'
import { requireAdmin } from '~/server/utils/adminAuth'

export default defineEventHandler(async (event) => {
  requireAdmin(event)
  const query = getQuery(event)
  const status = query.status as string | undefined

  const partners = await prisma.partner.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, institution: true, type: true,
      email: true, phone: true, referralCode: true,
      status: true, creditBalance: true, createdAt: true,
    },
  })

  return partners
})
