import { prisma } from '~/server/utils/prisma'
import { requireMitraAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { partnerId } = await requireMitraAuth(event)
  const partner = await prisma.partner.findUnique({
    where: { id: partnerId },
    select: { id: true, name: true, email: true, type: true, institution: true, referralCode: true, status: true, creditBalance: true, commissionRate: true },
  })
  if (!partner) throw createError({ statusCode: 404, message: 'Mitra tidak ditemukan.' })
  return partner
})
