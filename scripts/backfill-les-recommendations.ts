/**
 * Backfill lesRecommendations untuk survey_results yang belum punya data ini.
 *
 * Jalankan: env $(grep -v '^#' .env | xargs) npx tsx scripts/backfill-les-recommendations.ts
 *
 * Opsional — proses satu public_id saja:
 *   env $(grep -v '^#' .env | xargs) npx tsx scripts/backfill-les-recommendations.ts fbc027f8-fa48-4d18-8fc6-be7a0675c57b
 */

import { readFileSync } from 'fs'
import { resolve } from 'path'
import { PrismaClient, Prisma } from '@prisma/client'
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
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) as any })

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_AUTH_TOKEN || process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || undefined,
  defaultHeaders: { 'User-Agent': 'anthropic-typescript/0.36.0' },
})

const MODEL = process.env.ANTHROPIC_SONNET_MODEL || 'cc/claude-sonnet-4-6'

const systemPrompt = `Kamu adalah asesor potensi anak berbasis framework Nasab & Hasab dalam perspektif Islam.

Output HARUS berupa JSON valid dengan HANYA field berikut:
{
  "jalurUtama": [
    { "nama": "Nama les/aktivitas spesifik yang nyata dan bisa langsung dicari", "deskripsi": "1-2 kalimat kenapa cocok untuk anak ini, sesuai usia dan minat alaminya" },
    { "nama": "...", "deskripsi": "..." },
    { "nama": "...", "deskripsi": "..." }
  ],
  "jalurPendukung": [
    { "nama": "1 aktivitas dari rumpun ke-2", "deskripsi": "..." }
  ],
  "belumPrioritas": ["nama aktivitas 1", "nama aktivitas 2", "nama aktivitas 3"]
}

Aturan:
- jalurUtama: 3 rekomendasi berdasarkan rumpun DOMINAN. Nama harus spesifik dan konkret (contoh: "Kelas Robotik Lego Education", "Sanggar Kaligrafi", "Les Piano Yamaha") — bukan generik.
- Sesuaikan dengan usia anak dan minat alami yang disebutkan.
- jalurPendukung: 1 rekomendasi dari rumpun ke-2.
- belumPrioritas: 3 aktivitas yang tidak cocok sekarang (sesuai skor terendah), nama konkret.
- Semua dalam Bahasa Indonesia.
- JSON valid tanpa komentar, tanpa teks di luar JSON.`

async function generateLesRecs(row: {
  childName: string
  ageYears: number
  gender: string
  scoreAsyiha: number
  scoreIlmi: number
  scoreAmali: number
  scoreWajdan: number
  pctAsyiha: number
  pctIlmi: number
  pctAmali: number
  pctWajdan: number
  dominantHasab: string
  naturalResponses: string[]
}) {
  const ordered = [
    { code: 'Asyiha', score: row.scoreAsyiha },
    { code: 'Ilmi',   score: row.scoreIlmi   },
    { code: 'Amali',  score: row.scoreAmali  },
    { code: 'Wajdan', score: row.scoreWajdan },
  ].sort((a, b) => b.score - a.score)

  const prompt = `Data anak:
- Nama: ${row.childName}
- Usia: ${row.ageYears} tahun
- Jenis kelamin: ${row.gender === 'L' ? 'Laki-laki' : 'Perempuan'}

Skor Hasab (0-25):
- Asyiha: ${row.scoreAsyiha} (${row.pctAsyiha}%)
- Ilmi: ${row.scoreIlmi} (${row.pctIlmi}%)
- Amali: ${row.scoreAmali} (${row.pctAmali}%)
- Wajdan: ${row.scoreWajdan} (${row.pctWajdan}%)

Urutan dominan: ${ordered.map(x => x.code).join(' > ')}
Minat alami anak: ${row.naturalResponses.join(', ') || 'tidak disebutkan'}

Generate lesRecommendations JSON sesuai instruksi.`

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = res.content[0]?.type === 'text' ? res.content[0].text : ''
  const match = raw.match(/\{[\s\S]*\}/)
  if (!match) throw new Error(`No JSON in response: ${raw.slice(0, 200)}`)
  return JSON.parse(match[0])
}

async function main() {
  const targetPublicId = process.argv[2] || null

  const allResults = await prisma.surveyResult.findMany({
    where: targetPublicId ? { survey: { publicId: targetPublicId } } : {},
    include: {
      survey: {
        include: {
          child: true,
          responses: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  const results = allResults.filter(r => (r as any).lesRecommendations === null)

  console.log(`Found ${results.length} result(s) to backfill.`)
  if (!results.length) {
    console.log('Nothing to do.')
    await prisma.$disconnect()
    await pool.end()
    return
  }

  let ok = 0
  let fail = 0

  for (const r of results) {
    const child = r.survey.child
    const birthDate = child.birthDate ? new Date(child.birthDate) : null
    const ageYears = birthDate
      ? Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 3600 * 1000))
      : 7

    const naturalResponses = r.survey.responses.map((x: any) => x.responseOption || x.freeText || '').filter(Boolean)

    console.log(`  → ${child.name} (id=${r.id}, survey=${r.survey.publicId})`)

    try {
      const les = await generateLesRecs({
        childName: child.name,
        ageYears,
        gender: child.gender,
        scoreAsyiha: r.scoreAsyiha,
        scoreIlmi: r.scoreIlmi,
        scoreAmali: r.scoreAmali,
        scoreWajdan: r.scoreWajdan,
        pctAsyiha: parseFloat(String(r.pctAsyiha)),
        pctIlmi: parseFloat(String(r.pctIlmi)),
        pctAmali: parseFloat(String(r.pctAmali)),
        pctWajdan: parseFloat(String(r.pctWajdan)),
        dominantHasab: r.dominantHasab,
        naturalResponses,
      })

      await prisma.surveyResult.update({
        where: { id: r.id },
        data: { lesRecommendations: les },
      })

      console.log(`    ✓ done — jalurUtama: ${les.jalurUtama?.map((x: any) => x.nama).join(', ')}`)
      ok++
    } catch (err: any) {
      console.error(`    ✗ failed: ${err.message}`)
      fail++
    }

    // jeda 1 detik antar request agar tidak kena rate limit
    if (results.indexOf(r) < results.length - 1) {
      await new Promise(res => setTimeout(res, 1000))
    }
  }

  console.log(`\nDone. ✓ ${ok} updated, ✗ ${fail} failed.`)
  await prisma.$disconnect()
  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
