import { prisma } from '~/server/utils/prisma'
import { requireOwnerSession } from '~/server/utils/ownerAuth'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id.' })

  const { amount } = await readBody(event)
  if (!amount || typeof amount !== 'number' || amount < 1 || amount > 1000) {
    throw createError({ statusCode: 400, message: 'Jumlah kredit harus antara 1–1000.' })
  }

  const partner = await prisma.partner.update({
    where: { id },
    data: { creditBalance: { increment: amount } },
    select: { id: true, name: true, creditBalance: true },
  })

  return { ok: true, partner }
})
