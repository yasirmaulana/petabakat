import { prisma } from '~/server/utils/prisma'
import { requireOwnerSession } from '~/server/utils/ownerAuth'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id.' })

  const { billingStatus, plan } = await readBody(event)
  await prisma.school.update({
    where: { id },
    data: {
      ...(billingStatus ? { billingStatus } : {}),
      ...(plan ? { plan } : {}),
    },
  })
  return { ok: true }
})
