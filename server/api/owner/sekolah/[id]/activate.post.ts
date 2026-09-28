import { prisma } from '~/server/utils/prisma'
import { hashPassword } from '~/server/utils/auth'
import { requireOwnerSession } from '~/server/utils/ownerAuth'
import { randomBytes } from 'node:crypto'

export default defineEventHandler(async (event) => {
  await requireOwnerSession(event)
  const id = Number(getRouterParam(event, 'id'))
  if (!id) throw createError({ statusCode: 400, message: 'Invalid id.' })

  const { billingStatus, plan } = await readBody(event)
  const school = await prisma.school.update({
    where: { id },
    data: {
      ...(billingStatus ? { billingStatus } : {}),
      ...(plan ? { plan } : {}),
    },
    select: { name: true, code: true, adminEmail: true, adminPhone: true, billingStatus: true },
  })

  if (school.billingStatus !== 'active') return { ok: true }

  const existingUser = await prisma.schoolUser.findUnique({ where: { email: school.adminEmail } })
  let rawPassword: string | null = null
  if (!existingUser) {
    rawPassword = randomBytes(6).toString('base64url')
    await prisma.schoolUser.create({
      data: {
        schoolId: id,
        email: school.adminEmail,
        name: `Admin ${school.name}`,
        role: 'admin',
        passwordHash: await hashPassword(rawPassword),
      },
    })
  }

  try {
    const { sendWhatsAppMessage } = await import('~/server/utils/whatsapp')
    const config = useRuntimeConfig()
    const baseUrl = (config.public as { siteUrl?: string })?.siteUrl || 'https://petabakat.otomatisin.web.id'
    const message = rawPassword
      ? `✅ *Akun Sekolah PetaMinatBakat Aktif*\n\nHalo Admin ${school.name}!\n\nPendaftaran sekolah kamu sudah diaktifkan.\n\nLogin di: ${baseUrl}/sekolah/login\nEmail: ${school.adminEmail}\nPassword: ${rawPassword}\nKode Sekolah: ${school.code}\n\nSilakan ganti password setelah login pertama.`
      : `✅ *Akun Sekolah PetaMinatBakat Aktif*\n\nHalo Admin ${school.name}!\n\nPendaftaran sekolah kamu sudah diaktifkan.\n\nLogin di: ${baseUrl}/sekolah/login`
    await sendWhatsAppMessage({ target: school.adminPhone, message })
  } catch {
    // Notif WA opsional
  }

  return { ok: true, temporaryPassword: rawPassword }
})
