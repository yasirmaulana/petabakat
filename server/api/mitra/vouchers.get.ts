import { prisma } from '~/server/utils/prisma'
import { requireMitraAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { partnerId } = await requireMitraAuth(event)

  const vouchers = await prisma.voucher.findMany({
    where: { partnerId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      code: true,
      status: true,
      quota: true,
      usedCount: true,
      expiresAt: true,
      createdAt: true,
    },
  })

  return vouchers
})
