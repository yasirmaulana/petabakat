/**
 * Retry semua survey yang stuck di status 'processing' tanpa SurveyResult.
 * Jalankan: npx tsx scripts/retry-processing.ts
 *
 * Butuh env vars: DATABASE_URL, ANTHROPIC_AUTH_TOKEN (atau ANTHROPIC_API_KEY), ANTHROPIC_BASE_URL
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import Anthropic from '@anthropic-ai/sdk'

// load .env manual karena tsx tidak auto-load
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

// --- Scoring (copy dari hasabCalculator.ts, hindari import Nuxt context) ---

function categoryCodeByQuestionId(questionId: number): string | null {
  const index = (questionId - 1) % 20
  if (index >= 0 && index <= 4) return 'asyiha'
  if (index >= 5 && index <= 9) return 'ilmi'
  if (index >= 10 && index <= 14) return 'amali'
  if (index >= 15 && index <= 19) return 'wajdan'
  return null
}

function calculateHasabScores(answers: { questionId: number; value: number }[]) {
  const total = answers.reduce((sum, a) => sum + a.value, 0)
  if (total === 0) return { asyiha: 0, ilmi: 0, amali: 0, wajdan: 0 }

  const scores: Record<string, number> = { asyiha: 0, ilmi: 0, amali: 0, wajdan: 0 }
  for (const a of answers) {
    const code = categoryCodeByQuestionId(a.questionId)
    if (code) scores[code] += a.value
  }
  return { asyiha: scores.asyiha, ilmi: scores.ilmi, amali: scores.amali, wajdan: scores.wajdan }
}

function calculatePercentages(scores: Record<string, number>) {
  const total = Object.values(scores).reduce((sum, v) => sum + v, 0)
  if (total === 0) return { asyiha: 0, ilmi: 0, amali: 0, wajdan: 0 }
  return {
    asyiha: Number(((scores.asyiha / total) * 100).toFixed(2)),
    ilmi: Number(((scores.ilmi / total) * 100).toFixed(2)),
    amali: Number(((scores.amali / total) * 100).toFixed(2)),
    wajdan: Number(((scores.wajdan / total) * 100).toFixed(2)),
  }
}

// --- AI call langsung (tanpa useRuntimeConfig) ---

const systemPrompt = `Kamu adalah asesor potensi anak yang berbasis framework Nasab & Hasab dalam perspektif Islam. Kamu mengintegrasikan keahlian multidisiplin sebagai pakar Neuroscience, pakar Pendidikan Islam (Tarbiyah Islamiyah), serta ahli Al-Qur'an dan Hadis.

Framework:
- Nasab = garis keturunan sah yang menjaga identitas, silaturahim, dan hak waris.
- Hasab = rekam jejak kemuliaan keluarga yang terdiri dari 4 rumpun:
  1. Asyiha: kepemimpinan, komunikasi, empati sosial, pengaruh positif.
  2. Ilmi: intelektual, analitis, ingin tahu, pencinta ilmu.
  3. Amali: teknis, praktis, bisnis, eksekusi, keterampilan tangan.
  4. Wajdan: estetika, rasa, intuisi, spiritual, ekspresi diri.

Tugas:
Berdasarkan skor 4 rumpun Hasab, respon alami anak, dan data nasab, berikan analisis dalam bahasa Indonesia yang hangat, memberdayakan orang tua, berbasis nilai Islam, dan praktis.

Output HARUS berupa JSON valid dengan struktur:
{
  "personaLabel": "label persona kontekstual (contoh: The Innovator Leader)",
  "personaDescription": "paragraf deskripsi persona anak ini, personal dan spesifik",
  "scoreNarrative": "narasi penjelasan skor tiap rumpun dan hubungannya",
  "parentNotes": "saran pola asuh spesifik, hal yang didorong dan dihindari",
  "microdosingPlan": {
    "title": "Judul rencana stimulasi",
    "schedule": [
      { "day": "Sabtu Pagi", "activity": "aktivitas konkret", "durationMinutes": 60 }
    ]
  }
}

Pastikan JSON valid tanpa komentar dan tanpa teks di luar JSON.`

async function callAi(input: {
  childName: string
  childAgeYears: number
  childGender: string
  scores: { asyiha: number; ilmi: number; amali: number; wajdan: number }
  percentages: { asyiha: number; ilmi: number; amali: number; wajdan: number }
  orderedHasab: string[]
  naturalResponses: string[]
}) {
  const apiKey = process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('Tidak ada ANTHROPIC_AUTH_TOKEN atau ANTHROPIC_API_KEY di env')

  const anthropic = new Anthropic({
    apiKey,
    baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
    defaultHeaders: { 'User-Agent': 'anthropic-typescript/0.36.0' },
  })

  const model = process.env.ANTHROPIC_DEFAULT_SONNET_MODEL || 'cc/claude-sonnet-4-6'

  const userPrompt = `Data anak:
- Nama: ${input.childName}
- Usia: ${input.childAgeYears} tahun
- Jenis kelamin: ${input.childGender === 'L' ? 'Laki-laki' : 'Perempuan'}

Skor Hasab (0-25 per rumpun):
- Asyiha: ${input.scores.asyiha} (${input.percentages.asyiha}%)
- Ilmi: ${input.scores.ilmi} (${input.percentages.ilmi}%)
- Amali: ${input.scores.amali} (${input.percentages.amali}%)
- Wajdan: ${input.scores.wajdan} (${input.percentages.wajdan}%)

Urutan rumpun dari dominan ke lemah: ${input.orderedHasab.join(' > ')}

Respon alami / minat dominan anak saat ini: ${input.naturalResponses.join(', ') || 'tidak ada'}

Jawaban nasab: tidak tersedia (data lama)

Buatkan analisis dalam format JSON sesuai instruksi.`

  const response = await anthropic.messages.create({
    model,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const raw = response.content.find((c) => c.type === 'text')?.text || '{}'
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  return { ...JSON.parse(cleaned), _model: model }
}

function fallback(
  scores: { asyiha: number; ilmi: number; amali: number; wajdan: number },
  orderedHasab: string[],
  naturalResponses: string[],
) {
  const dominant = orderedHasab[0] ?? 'asyiha'
  const labels: Record<string, string> = {
    asyiha: 'The Natural Leader',
    ilmi: 'The Deep Thinker',
    amali: 'The Skilled Maker',
    wajdan: 'The Creative Soul',
  }
  return {
    personaLabel: labels[dominant] ?? 'The Balanced Child',
    personaDescription: `Anak ini menunjukkan kecenderungan dominan di rumpun ${dominant} dengan skor ${scores[dominant as keyof typeof scores]}. Minat alami: ${naturalResponses.join(', ') || '-'}.`,
    scoreNarrative: `Asyiha: ${scores.asyiha}, Ilmi: ${scores.ilmi}, Amali: ${scores.amali}, Wajdan: ${scores.wajdan}. Analisis ini dibuat secara otomatis karena AI tidak tersedia.`,
    parentNotes: 'Dukung kegiatan yang sesuai dengan kecenderungan dominan anak. Konsultasikan dengan ahli untuk analisis lebih mendalam.',
    microdosingPlan: {
      title: 'Stimulasi Dasar',
      schedule: [
        { day: 'Sabtu Pagi', activity: 'Eksplorasi minat dominan anak', durationMinutes: 60 },
        { day: 'Minggu Sore', activity: 'Aktivitas kreatif bersama keluarga', durationMinutes: 45 },
      ],
    },
    _model: null,
  }
}

// --- WhatsApp ---

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

async function notifyParent(surveyId: number, phone: string, childName: string) {
  const existing = await prisma.notificationLog.findUnique({ where: { surveyId } })
  if (existing) {
    console.log(`  WA sudah pernah dikirim sebelumnya, skip.`)
    return
  }

  const baseUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://petabakat.otomatisin.web.id'
  const message = `Assalamu'alaikum,\n\nHasil analisis Peta Bakat untuk ${childName} sudah selesai.\n\nSilakan lihat di Riwayat: ${baseUrl}/history\n\nTerima kasih.`

  const response = await sendWhatsApp(phone, message)

  await prisma.notificationLog.create({
    data: {
      surveyId,
      channel: 'whatsapp',
      status: 'sent',
      response: response as any,
    },
  })
}

// --- Main ---

async function main() {
  console.log('Mencari survey stuck (status=processing, belum ada result)...\n')

  const stuckSurveys = await prisma.survey.findMany({
    where: {
      status: 'processing',
      result: null,
    },
    include: {
      child: true,
      parent: true,
      answers: true,
      responses: true,
    },
  })

  if (stuckSurveys.length === 0) {
    console.log('Tidak ada survey yang stuck. Selesai.')
    return
  }

  console.log(`Ditemukan ${stuckSurveys.length} survey stuck:\n`)
  for (const s of stuckSurveys) {
    console.log(`  - ID ${s.id} | anak: ${s.child.name} | orang tua: ${s.parent.name} | dibuat: ${s.createdAt.toISOString()}`)
  }
  console.log()

  let successCount = 0
  let failCount = 0

  for (const survey of stuckSurveys) {
    console.log(`--- Memproses survey ID ${survey.id} (${survey.child.name}) ---`)

    const scores = calculateHasabScores(survey.answers)
    const percentages = calculatePercentages(scores)
    const orderedHasab = Object.entries(scores)
      .sort((a, b) => b[1] - a[1])
      .map(([code]) => code)

    const birthDate = new Date(survey.child.birthDate)
    const ageMs = Date.now() - birthDate.getTime()
    const childAgeYears = Math.floor(ageMs / (1000 * 60 * 60 * 24 * 365.25))

    const naturalResponses = survey.responses.map((r) => r.responseOption)

    let analysis: any
    let source = 'ai'
    let usedModel: string | null = null

    try {
      console.log('  Memanggil AI...')
      analysis = await callAi({
        childName: survey.child.name,
        childAgeYears,
        childGender: survey.child.gender,
        scores,
        percentages,
        orderedHasab,
        naturalResponses,
      })
      usedModel = analysis._model || null
      console.log(`  AI berhasil (model: ${usedModel})`)
    } catch (err: any) {
      console.warn(`  AI gagal: ${err.message}. Menggunakan fallback.`)
      analysis = fallback(scores, orderedHasab, naturalResponses)
      source = 'fallback'
    }

    try {
      await prisma.surveyResult.create({
        data: {
          surveyId: survey.id,
          scoreAsyiha: scores.asyiha,
          scoreIlmi: scores.ilmi,
          scoreAmali: scores.amali,
          scoreWajdan: scores.wajdan,
          pctAsyiha: percentages.asyiha,
          pctIlmi: percentages.ilmi,
          pctAmali: percentages.amali,
          pctWajdan: percentages.wajdan,
          dominantHasab: orderedHasab[0] ?? '',
          source,
          personaLabel: analysis.personaLabel,
          personaDescription: analysis.personaDescription,
          scoreNarrative: analysis.scoreNarrative,
          parentNotes: analysis.parentNotes,
          microdosingPlan: analysis.microdosingPlan,
          aiRawResponse: source === 'ai' ? analysis : null,
          aiModel: usedModel,
        },
      })

      await prisma.survey.update({
        where: { id: survey.id },
        data: { status: 'completed' },
      })

      console.log(`  Selesai (source: ${source})`)

      try {
        await notifyParent(survey.id, survey.parent.phone, survey.child.name)
        console.log(`  WA terkirim ke ${survey.parent.phone}\n`)
      } catch (err: any) {
        console.warn(`  WA gagal: ${err.message}\n`)
      }

      successCount++
    } catch (err: any) {
      console.error(`  GAGAL simpan result: ${err.message}\n`)
      failCount++
    }
  }

  console.log(`\nSelesai. Berhasil: ${successCount} | Gagal: ${failCount}`)
}

main()
  .catch((err) => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
