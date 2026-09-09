import { prisma } from '~/server/utils/prisma'
import { verifyHistoryToken, getMitraTokenFromEvent, verifyMitraToken } from '~/server/utils/auth'
import { getSchoolTokenFromEvent, verifySchoolToken } from '~/server/utils/schoolAuth'

async function getCallerPhone(event: Parameters<typeof getCookie>[0]): Promise<string | null> {
  const raw = getCookie(event, 'history_session')
  if (!raw) return null
  try { return await verifyHistoryToken(raw) } catch { return null }
}

async function isPrivilegedCaller(event: Parameters<typeof getHeader>[0]): Promise<boolean> {
  const mt = getMitraTokenFromEvent(event)
  if (mt) { try { await verifyMitraToken(mt); return true } catch {} }
  const st = getSchoolTokenFromEvent(event)
  if (st) { try { await verifySchoolToken(st); return true } catch {} }
  return false
}

export default defineEventHandler(async (event) => {
  const publicId = getRouterParam(event, 'id')

  const survey = await prisma.survey.findUnique({
    where: { publicId },
    select: {
      id: true,
      status: true,
      publicId: true,
      completedAt: true,
    },
  })

  if (!survey) {
    throw createError({ statusCode: 404, statusMessage: 'Survey not found' })
  }

  if (survey.status === 'processing') {
    return {
      status: 'processing',
      surveyId: survey.publicId,
      message: 'Analisis masih diprosses, silakan tunggu sebentar.',
    }
  }

  const result = await prisma.surveyResult.findUnique({
    where: { surveyId: survey.id },
    include: {
      survey: {
        include: {
          child: true,
          parent: true,
          responses: true,
        },
      },
    },
  })

  if (!result) {
    throw createError({ statusCode: 404, statusMessage: 'Result not found' })
  }

  // Demo result — akses publik tanpa login
  const demoId = process.env.DEMO_RESULT_ID
  if (publicId !== demoId) {
    // Auth check: harus pemilik (phone match) atau mitra/sekolah login
    const [callerPhone, privileged] = await Promise.all([
      getCallerPhone(event),
      isPrivilegedCaller(event),
    ])
    const ownerPhone = result.survey.parent.phone
    if (!privileged && callerPhone !== ownerPhone) {
      throw createError({ statusCode: 403, message: 'Akses ditolak. Silakan login terlebih dahulu.' })
    }
  }

  return {
    status: 'completed',
    ...result,
    microdosingPlan: result.microdosingPlan as Record<string, unknown>,
  }
})
