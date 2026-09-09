import { prisma } from '~/server/utils/prisma'
import { requireMitraAuth } from '~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const { partnerId, type } = await requireMitraAuth(event)

  if (type !== 'affiliate') {
    throw createError({ statusCode: 403, message: 'Hanya mitra affiliate.' })
  }

  const { bankName, accountNumber, accountName } = await readBody(event)
  if (!bankName || !accountNumber || !accountName) {
    throw createError({ statusCode: 400, message: 'Data rekening wajib diisi.' })
  }

  const pending = await prisma.commission.findMany({
    where: { partnerId, status: 'pending' },
    select: { amount: true },
  })
  const totalPending = pending.reduce((s, c) => s + c.amount, 0)
  if (totalPending === 0) {
    throw createError({ statusCode: 400, message: 'Tidak ada komisi pending untuk dicairkan.' })
  }

  // Kirim notif WA ke admin — manual review
  const partner = await prisma.partner.findUnique({ where: { id: partnerId }, select: { name: true, phone: true } })
  const message = `🔔 *Request Pencairan Komisi*\n\nMitra: ${partner?.name}\nWA: ${partner?.phone}\nJumlah: Rp ${totalPending.toLocaleString('id-ID')}\nBank: ${bankName}\nNo. Rek: ${accountNumber}\nA/N: ${accountName}\n\nApprove manual dan update status di DB.`

  try {
    const { sendWhatsAppMessage } = await import('~/server/utils/whatsapp')
    const adminPhone = process.env.ADMIN_PHONE
    await sendWhatsAppMessage({ target: adminPhone, message })
  } catch {
    // Notif WA gagal tidak block request
  }

  return { ok: true, totalPending, message: 'Request pencairan terkirim. Admin akan menghubungi kamu dalam 1–3 hari kerja.' }
})
