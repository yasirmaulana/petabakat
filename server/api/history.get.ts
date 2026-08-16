import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const phone = String(query.phone || '').trim()

  if (!phone) {
    throw createError({ statusCode: 400, statusMessage: 'phone is required' })
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
    return { found: false, surveys: [] }
  }

  return {
    found: true,
    parent: { name: parent.name, phone: parent.phone },
    surveys: parent.surveys.map((s) => ({
      surveyId: s.publicId,
      childName: s.child.name,
      completedAt: s.completedAt,
      result: s.result,
    })),
  }
})
