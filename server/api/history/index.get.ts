import { prisma } from '~/server/utils/prisma'
import { verifyHistoryToken } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const rawToken = getCookie(event, 'history_session')
  if (!rawToken) return { authenticated: false, found: false, surveys: [] }

  let phone: string
  try {
    phone = await verifyHistoryToken(rawToken)
  } catch {
    deleteCookie(event, 'history_session', { path: '/' })
    return { authenticated: false, found: false, surveys: [] }
  }

  const parent = await prisma.parent.findUnique({
    where: { phone },
    include: {
      surveys: {
        orderBy: { createdAt: 'desc' },
        include: {
          child: true,
          result: {
            select: {
              personaLabel: true,
              dominantHasab: true,
              scoreAsyiha: true,
              scoreIlmi: true,
              scoreAmali: true,
              scoreWajdan: true,
              createdAt: true,
            },
          },
        },
      },
    },
  })

  if (!parent) {
    deleteCookie(event, 'history_session', { path: '/' })
    return { authenticated: false, found: false, surveys: [] }
  }

  return {
    authenticated: true,
    found: true,
    parent: { name: parent.name, phone: parent.phone },
    surveys: parent.surveys.map((s) => ({
      surveyId: s.publicId,
      childName: s.child.name,
      completedAt: s.completedAt,
      status: s.status,
      result: s.result,
    })),
  }
})
