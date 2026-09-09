import { requireOwnerSession } from '~/server/utils/ownerAuth'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)
  return { ok: true }
})
