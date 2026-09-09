import { prisma } from '~/server/utils/prisma'
import { requireOwnerSession } from '~/server/utils/ownerAuth'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id.' })

  await prisma.commission.update({
    where: { id },
    data: { status: 'paid', paidAt: new Date() },
  })
  return { ok: true }
})
