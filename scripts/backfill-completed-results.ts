/**
 * Backfill survey yang status=completed tapi tidak punya SurveyResult.
 * Jalankan: npx tsx scripts/backfill-completed-results.ts
 *
 * Butuh env vars: DATABASE_URL, ANTHROPIC_AUTH_TOKEN (atau ANTHROPIC_API_KEY), ANTHROPIC_BASE_URL
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'
import Anthropic from '@anthropic-ai/sdk'
import { Prisma } from '@prisma/client'

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

function categoryCodeByQuestionId(questionId: number): string | null {
  const index = (questionId - 1) % 20
  if (index >= 0 && index <= 4) return 'qiyadah'
  if (index >= 5 && index <= 9) return 'ilmi'
  if (index >= 10 && index <= 14) return 'amali'
  if (index >= 15 && index <= 19) return 'karam'
  return null
}

function calculateHasabScores(answers: { questionId: number; value: number }[]) {
  const scores: Record<string, number> = { qiyadah: 0, ilmi: 0, amali: 0, karam: 0 }
  for (const a of answers) {
    const code = categoryCodeByQuestionId(a.questionId)
    if (code) scores[code] += a.value
  }
  return scores
}

function calculatePercentages(scores: Record<string, number>) {
  const total = Object.values(scores).reduce((sum, v) => sum + v, 0)
  if (total === 0) return { qiyadah: 0, ilmi: 0, amali: 0, karam: 0 }
  return {
    qiyadah: Number(((scores.qiyadah / total) * 100).toFixed(2)),
    ilmi: Number(((scores.ilmi / total) * 100).toFixed(2)),
    amali: Number(((scores.amali / total) * 100).toFixed(2)),
    karam: Number(((scores.karam / total) * 100).toFixed(2)),
  }
}

async function callAi(input: {
  childName: string
  childAgeYears: number
  childGender: string
  scores: { qiyadah: number; ilmi: number; amali: number; karam: number }
  percentages: { qiyadah: number; ilmi: number; amali: number; karam: number }
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

  const systemPrompt = `Kamu adalah asesor potensi anak berbasis framework Nasab & Hasab dalam perspektif Islam.
Framework 4 rumpun:
1. Al-Qiyadah: kepemimpinan, komunikasi, integritas, dan pengayoman.
2. Ilmi: kecerdasan intelektual, analitis, literasi, dan kedalaman ilmu.
3. Amali: eksekusi, keterampilan praktis, kewirausahaan, dan pembangunan karya nyata.
4. Al-Karam: kedermawanan, empati sosial, filantropi, dan kerelaan berkorban.

Output HARUS berupa JSON valid dengan struktur:
{
  "personaLabel": "label persona",
  "personaDescription": "paragraf deskripsi",
  "scoreNarrative": "narasi skor tiap rumpun",
  "parentNotes": "saran pola asuh",
  "microdosingPlan": { "title": "...", "schedule": [{ "day": "...", "activity": "...", "durationMinutes": 30, "figureInvolved": null }] },
  "bridgingActions": [{ "target": "ayah", "action": "...", "frequency": "...", "rationale": "..." }],
  "lesRecommendations": { "kekuatanUtama": ["..."], "potensiProfesi": [{ "nama": "...", "alasan": "..." }], "karakterMenonjol": ["..."], "jalurUtama": [{ "nama": "...", "deskripsi": "..." }], "jalurPendukung": [{ "nama": "...", "deskripsi": "..." }], "belumPrioritas": ["..."] }
}`

  const userPrompt = `Data anak:
- Nama: ${input.childName}
- Usia: ${input.childAgeYears} tahun
- Jenis kelamin: ${input.childGender === 'L' ? 'Laki-laki' : 'Perempuan'}

Skor Hasab (0-25 per rumpun):
- Al-Qiyadah: ${input.scores.qiyadah} (${input.percentages.qiyadah}%)
- Ilmi: ${input.scores.ilmi} (${input.percentages.ilmi}%)
- Amali: ${input.scores.amali} (${input.percentages.amali}%)
- Al-Karam: ${input.scores.karam} (${input.percentages.karam}%)

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

function fallback(scores: { qiyadah: number; ilmi: number; amali: number; karam: number }, orderedHasab: string[], naturalResponses: string[]) {
  const dominant = orderedHasab[0] ?? 'qiyadah'
  const labels: Record<string, string> = {
    qiyadah: 'The Natural Leader',
    ilmi: 'The Deep Thinker',
    amali: 'The Skilled Maker',
    karam: 'The Compassionate Helper',
  }
  return {
    personaLabel: labels[dominant] ?? 'The Balanced Child',
    personaDescription: `Anak ini menunjukkan kecenderungan dominan di rumpun ${dominant} dengan skor ${scores[dominant as keyof typeof scores]}. Minat alami: ${naturalResponses.join(', ') || '-'}.`,
    scoreNarrative: `Al-Qiyadah: ${scores.qiyadah}, Ilmi: ${scores.ilmi}, Amali: ${scores.amali}, Al-Karam: ${scores.karam}. Analisis ini dibuat secara otomatis karena AI tidak tersedia.`,
    parentNotes: 'Dukung kegiatan yang sesuai dengan kecenderungan dominan anak. Konsultasikan dengan ahli untuk analisis lebih mendalam.',
    microdosingPlan: { title: 'Stimulasi Dasar', schedule: [] },
    bridgingActions: [],
    lesRecommendations: {
      kekuatanUtama: ['Bermain peran sesuai minat', 'Observasi perilaku harian', 'Dukungan positif orang tua'],
      potensiProfesi: [{ nama: 'Eksplorasi usia dini', alasan: 'Potensi masih berkembang, perlu stimulasi variatif.' }],
      karakterMenonjol: ['Penasaran', 'Aktif', 'Responsif'],
      jalurUtama: [{ nama: 'Aktivitas sesuai minat', deskripsi: 'Coba berbagai aktivitas bermain dan belajar sesuai kecenderungan dominan.' }],
      jalurPendukung: [],
      belumPrioritas: ['Les formal intensif'],
    },
  }
}

async function main() {
  console.log('Mencari survey completed tanpa SurveyResult...\n')

  const missing = await prisma.survey.findMany({
    where: { status: 'completed', result: null },
    include: { child: true, parent: true, answers: true, responses: true },
    orderBy: { id: 'desc' },
  })

  if (missing.length === 0) {
    console.log('Tidak ada yang perlu di-backfill. Selesai.')
    return
  }

  console.log(`Ditemukan ${missing.length} survey:\n`)
  for (const s of missing) {
    console.log(`  - ID ${s.id} | ${s.child.name} | ${s.parent.name}`)
  }
  console.log()

  for (const survey of missing) {
    console.log(`--- Memproses ID ${survey.id} (${survey.child.name}) ---`)
    try {
      const scores = calculateHasabScores(survey.answers)
      const percentages = calculatePercentages(scores)
      const orderedHasab = Object.entries(scores).sort((a, b) => b[1] - a[1]).map(([k]) => k)
      const childAgeYears = Math.floor((Date.now() - new Date(survey.child.birthDate).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
      const naturalResponses = survey.responses.map((r) => r.responseOption)

      let analysis: any
      let source = 'ai'
      try {
        analysis = await callAi({
          childName: survey.child.name,
          childAgeYears,
          childGender: survey.child.gender,
          scores,
          percentages,
          orderedHasab,
          naturalResponses,
        })
      } catch (e: any) {
        console.log(`  AI gagal: ${e.message}. Pakai fallback.`)
        analysis = fallback(scores, orderedHasab, naturalResponses)
        source = 'fallback'
      }

      await prisma.surveyResult.create({
        data: {
          surveyId: survey.id,
          scoreQiyadah: scores.qiyadah,
          scoreIlmi: scores.ilmi,
          scoreAmali: scores.amali,
          scoreKaram: scores.karam,
          pctQiyadah: percentages.qiyadah,
          pctIlmi: percentages.ilmi,
          pctAmali: percentages.amali,
          pctKaram: percentages.karam,
          dominantHasab: orderedHasab[0] ?? '',
          source,
          personaLabel: analysis.personaLabel,
          personaDescription: analysis.personaDescription,
          scoreNarrative: analysis.scoreNarrative,
          parentNotes: analysis.parentNotes,
          microdosingPlan: analysis.microdosingPlan as Prisma.InputJsonValue,
          bridgingActions: analysis.bridgingActions?.length ? (analysis.bridgingActions as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
          lesRecommendations: analysis.lesRecommendations ? (analysis.lesRecommendations as unknown as Prisma.InputJsonValue) : Prisma.JsonNull,
        },
      })

      console.log(`  ✅ Selesai (source: ${source})\n`)
    } catch (e: any) {
      console.error(`  ❌ GAGAL: ${e.message}\n`)
    }
  }
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
}).finally(() => prisma.$disconnect())
