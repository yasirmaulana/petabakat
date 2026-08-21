/**
 * Kirim WA ke survey ID tertentu yang sudah completed tapi belum dapat notifikasi.
 * Jalankan: env $(grep -v '^#' .env | xargs) npx tsx scripts/notify-specific.ts
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const envPath = resolve(process.cwd(), '.env')
for (const line of readFileSync(envPath, 'utf-8').split('\n')) {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) continue
  const eq = trimmed.indexOf('=')
  if (eq === -1) continue
  const key = trimmed.slice(0, eq).trim()
  const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
  if (!process.env[key]) process.env[key] = val
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) })

const TARGET_IDS = [38, 40, 41, 42, 43, 44, 46]

async function sendWhatsApp(phone: string, message: string) {
  const apiUrl = process.env.WHATSAPP_API_URL
  const token = process.env.WHATSAPP_API_TOKEN_FONNTE
  if (!apiUrl || !token) throw new Error('WHATSAPP_API_URL atau WHATSAPP_API_TOKEN_FONNTE tidak ada di env')

  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: { Authorization: token, 'Content-Type': 'application/json' },
    body: JSON.stringify({ target: phone, message }),
  })

  if (!res.ok) throw new Error(`WhatsApp API error: ${res.status} ${await res.text()}`)
  return res.json()
}

async function main() {
  const surveys = await prisma.survey.findMany({
    where: { id: { in: TARGET_IDS } },
    include: { child: true, parent: true, notifications: true },
  })

  console.log(`Ditemukan ${surveys.length} survey dari ${TARGET_IDS.length} yang dicari.\n`)

  for (const survey of surveys) {
    const alreadySent = survey.notifications.length > 0
    if (alreadySent) {
      console.log(`Survey ${survey.id} (${survey.child.name}) - WA sudah terkirim sebelumnya, skip.`)
      continue
    }

    const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://petabakat.otomatisin.web.id'
    const message = `Assalamu'alaikum,\n\nHasil analisis Peta Bakat untuk ${survey.child.name} sudah selesai.\n\nSilakan lihat di Riwayat: ${baseUrl}/history\n\nTerima kasih.`

    try {
      const response = await sendWhatsApp(survey.parent.phone, message)

      await prisma.notificationLog.create({
        data: {
          surveyId: survey.id,
          channel: 'whatsapp',
          status: 'sent',
          response: response as any,
        },
      })

      console.log(`Survey ${survey.id} (${survey.child.name}) - WA terkirim ke ${survey.parent.phone}`)
    } catch (err: any) {
      console.error(`Survey ${survey.id} (${survey.child.name}) - GAGAL: ${err.message}`)
    }
  }

  console.log('\nSelesai.')
}

main()
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
