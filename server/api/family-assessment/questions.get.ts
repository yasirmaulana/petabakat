import { prisma } from '~/server/utils/prisma'

// Publik — tidak butuh auth; soal tidak mengandung data sensitif
export default defineEventHandler(async () => {
  const questions = await prisma.familyQuestion.findMany({
    orderBy: [{ dimension: 'asc' }, { order: 'asc' }],
  })
  return questions
})
