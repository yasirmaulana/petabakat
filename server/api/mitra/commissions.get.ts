import { prisma } from '~/server/utils/prisma'
import { requireMitraAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { partnerId, type } = await requireMitraAuth(event)

  if (type !== 'affiliate') {
    throw createError({ statusCode: 403, message: 'Hanya mitra affiliate yang punya komisi.' })
  }

  const commissions = await prisma.commission.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' },
    select: { id: true, amount: true, status: true, paidAt: true, createdAt: true, surveyId: true },
  })

  const total = commissions.reduce((s, c) => s + c.amount, 0)
  const pending = commissions.filter(c => c.status === 'pending').reduce((s, c) => s + c.amount, 0)
  const paid = total - pending

  return { total, pending, paid, items: commissions }
})
