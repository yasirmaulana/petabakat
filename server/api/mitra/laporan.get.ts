import { prisma } from '~/server/utils/prisma'
import { requireMitraAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { partnerId } = await requireMitraAuth(event)

  const surveys = await prisma.survey.findMany({
    where: { voucher: { partnerId } },
    orderBy: { createdAt: 'desc' },
    select: {
      publicId: true,
      createdAt: true,
      child: { select: { name: true, birthDate: true, gender: true } },
      voucher: { select: { code: true } },
      result: {
        select: {
          personaLabel: true,
          pctAsyiha: true,
          pctIlmi: true,
          pctAmali: true,
          pctWajdan: true,
        },
      },
    },
  })

  return surveys
})
