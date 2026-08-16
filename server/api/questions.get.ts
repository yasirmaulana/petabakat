import { prisma } from '~/server/utils/prisma'

export default defineEventHandler(async () => {
  const categories = await prisma.hasabCategory.findMany({
    include: {
      questions: {
        where: { type: 'hasab' },
        orderBy: { order: 'asc' },
      },
    },
    orderBy: { id: 'asc' },
  })

  const nasabQuestions = await prisma.question.findMany({
    where: { type: 'nasab' },
    orderBy: { order: 'asc' },
  })

  return { categories, nasabQuestions }
})
