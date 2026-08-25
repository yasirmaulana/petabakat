import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  // ponytail: limit hardcoded to 20; bump if you want longer rotation pool
  const results = await prisma.surveyResult.findMany({
    take: 20,
    orderBy: { createdAt: 'desc' },
    select: {
      personaLabel: true,
      survey: {
        select: {
          child: { select: { name: true } },
        },
      },
    },
  })

  return results
    .filter((r) => r.survey?.child?.name && r.personaLabel)
    .map((r) => ({
      childName: r.survey.child.name,
      personaLabel: r.personaLabel,
    }))
})
