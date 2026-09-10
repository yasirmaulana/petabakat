import Anthropic from '@anthropic-ai/sdk'
import Groq from 'groq-sdk'

export interface AiAnalysisInput {
  scores: { asyiha: number; ilmi: number; amali: number; wajdan: number }
  percentages: { asyiha: number; ilmi: number; amali: number; wajdan: number }
  orderedHasab: string[]
  naturalResponses: string[]
  nasabAnswers: Record<number, number>
  childName: string
  childAgeYears: number
  childGender: string
  /** Opsional — diisi setelah family assessment selesai */
  familyFitGap?: {
    fitGapStatus: 'OPTIMAL' | 'GAP'
    fitGapScore: number   // 0.00–1.00
    top3Hasab: string[]   // nama dimensi keluarga dominan
    figuresIncluded: number
    recommendation: string
    /** Figur yang di-skip karena tidak dikenal atau sudah meninggal */
    skippedFigures?: string[]
  }
}

export interface LesItem {
  nama: string
  deskripsi: string
}

export interface LesRecommendations {
  kekuatanUtama: string[]
  potensiProfesi: { nama: string; alasan: string }[]
  karakterMenonjol: string[]
  jalurUtama: LesItem[]
  jalurPendukung: LesItem[]
  belumPrioritas: string[]
}

export interface BridgingAction {
  target: 'ayah' | 'ibu' | 'kakek' | 'nenek' | 'keluarga' | 'anak'
  action: string
  frequency: string
  rationale: string
}

export interface AiAnalysisOutput {
  personaLabel: string
  personaDescription: string
  scoreNarrative: string
  /** Narasi 2–3 kalimat tentang makna Fit-Gap ratio dan implikasinya bagi pengasuhan */
  fitGapNarrative: string
  parentNotes: string
  microdosingPlan: {
    title: string
    schedule: { day: string; activity: string; durationMinutes: number; figureInvolved?: string }[]
  }
  /** Action items yang ditujukan ke figur keluarga, bukan hanya anak. Kosong jika familyFitGap tidak ada. */
  bridgingActions: BridgingAction[]
  lesRecommendations: LesRecommendations
}

const systemPrompt = `Kamu adalah asesor potensi anak yang berbasis framework Nasab & Hasab dalam perspektif Islam. Kamu mengintegrasikan keahlian multidisiplin sebagai pakar Neuroscience, pakar Pendidikan Islam (Tarbiyah Islamiyah), serta ahli Al-Qur'an dan Hadis.

Framework:
- Nasab = garis keturunan sah yang menjaga identitas, silaturahim, dan hak waris.
- Hasab = rekam jejak kemuliaan keluarga yang terdiri dari 4 rumpun:
  1. Al-Qiyadah: kepemimpinan, komunikasi, empati sosial, pengaruh positif.
  2. Ilmi: intelektual, analitis, ingin tahu, pencinta ilmu.
  3. Amali: teknis, praktis, bisnis, eksekusi, keterampilan tangan.
  4. Wajdan: estetika, rasa, intuisi, spiritual, ekspresi diri.

Tugas:
Berdasarkan skor 4 rumpun Hasab, respon alami anak, dan data nasab, berikan analisis dalam bahasa Indonesia yang hangat, memberdayakan orang tua, berbasis nilai Islam, dan praktis.

PENTING — Kelompok usia dan cara penyampaian:
- Usia 3–6 tahun (Tahap Awal): fokus pada observasi perilaku konkret sehari-hari. Skor mencerminkan pola keluarga lebih dari anak itu sendiri. Gunakan bahasa yang sangat sederhana dan aktivitas bermain.
- Usia 7–11 tahun (Tahap Berkembang): mulai terlihat kecenderungan personal anak. Profesi masih berupa gambaran besar, aktivitas lebih terstruktur.
- Usia 12–15 tahun (Tahap Eksplorasi): anak mulai punya preferensi jelas. Profesi bisa lebih spesifik, aktivitas bisa lebih serius dan kompetitif.
Sesuaikan seluruh output dengan kelompok usia anak.

Output HARUS berupa JSON valid dengan struktur:
{
  "personaLabel": "label persona kontekstual (contoh: The Innovator Leader)",
  "personaDescription": "paragraf deskripsi persona anak ini, personal dan spesifik",
  "scoreNarrative": "narasi penjelasan skor tiap rumpun dan hubungannya",
  "fitGapNarrative": "narasi 2–3 kalimat tentang keselarasan ekosistem keluarga dengan potensi anak dan implikasinya bagi pengasuhan. Jika tidak ada data keluarga, tulis string kosong.",
  "parentNotes": "saran pola asuh spesifik, hal yang didorong dan dihindari",
  "microdosingPlan": {
    "title": "Judul rencana stimulasi",
    "schedule": [
      { "day": "Sabtu Pagi", "activity": "aktivitas konkret", "durationMinutes": 60, "figureInvolved": "ayah" }
    ]
  },
  "bridgingActions": [
    { "target": "ayah", "action": "tindakan spesifik yang bisa dilakukan figur ini", "frequency": "2x/minggu", "rationale": "alasan singkat berdasarkan data hasab keluarga" }
  ],
  "lesRecommendations": {
    "kekuatanUtama": [
      "Kalimat pendek (max 10 kata) menggambarkan kekuatan/karakter spesifik dari kombinasi skor — bukan generik",
      "...",
      "...",
      "...",
      "..."
    ],
    "potensiProfesi": [
      { "nama": "Nama profesi/bidang nyata (sesuaikan usia)", "alasan": "1 kalimat alasan berdasarkan kombinasi rumpun dominan + minat alami" },
      { "nama": "...", "alasan": "..." },
      { "nama": "...", "alasan": "..." }
    ],
    "karakterMenonjol": ["Sifat/karakter 1", "Sifat/karakter 2", "Sifat/karakter 3"],
    "jalurUtama": [
      { "nama": "Nama les/aktivitas spesifik yang NYATA dan bisa langsung dicari", "deskripsi": "1-2 kalimat kenapa cocok untuk anak ini, sesuaikan dengan usia dan minat alaminya" },
      { "nama": "...", "deskripsi": "..." },
      { "nama": "...", "deskripsi": "..." }
    ],
    "jalurPendukung": [
      { "nama": "1 aktivitas pendukung dari rumpun ke-2", "deskripsi": "..." }
    ],
    "belumPrioritas": ["nama aktivitas 1", "nama aktivitas 2", "nama aktivitas 3"]
  }
}

Aturan lesRecommendations:
- kekuatanUtama: TEPAT 5 item. Setiap item adalah kalimat pendek berbentuk kekuatan konkret (contoh: "Berpikir sistematis sejak dini", "Mudah memimpin kelompok teman sebaya"). Harus sesuai kombinasi skor dan minat alami yang diberikan.
- potensiProfesi: 3 profesi/bidang, sesuai usia. Usia 3–6 → gambaran besar ("Arsitek / Insinyur"), usia 12–15 → lebih spesifik ("Software Engineer di bidang AI").
- karakterMenonjol: TEPAT 3 kata sifat/karakter pendek (contoh: "Analitis", "Pemberani", "Pemimpin alami").
- jalurUtama: 3 rekomendasi spesifik berdasarkan rumpun DOMINAN. Sebutkan nama konkret (contoh: "Kelas Robotik Lego Education", "Sanggar Kaligrafi", "Les Piano Yamaha") — bukan generik.
- Sesuaikan dengan usia anak dan minat alami yang disebutkan dalam data.
- jalurPendukung: 1 rekomendasi dari rumpun ke-2.
- belumPrioritas: 3 aktivitas yang tidak cocok sekarang (sesuai skor terendah), nama konkret.
- Semua dalam Bahasa Indonesia.

Aturan fitGapNarrative & bridgingActions:
- fitGapNarrative: jika ada data keluarga → tulis 2–3 kalimat yang menjelaskan keselarasan, mana yang sudah sinergi, mana yang perlu jembatan. Jika tidak ada data keluarga → tulis string kosong "".
- bridgingActions: jika ada data keluarga → 2–4 action item ditujukan ke figur spesifik (ayah/ibu/kakek/nenek/keluarga/anak). target "keluarga" untuk kegiatan bersama. Jika tidak ada data → array kosong [].
- figureInvolved di schedule: isi hanya jika aktivitas melibatkan figur spesifik (ayah/ibu/kakek/nenek). Boleh dihilangkan jika anak melakukan sendiri.

Pastikan JSON valid tanpa komentar dan tanpa teks di luar JSON.`

const RATE_LIMIT_CODES = new Set([429, 529])
// ponytail: 3 minutes per provider allows slow models to finish; tune down if UX degrades.
const AI_TIMEOUT_MS = Number(process.env.AI_TIMEOUT_MS || 180_000)

export interface AiAnalysisResult extends AiAnalysisOutput {
  _model: string
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`AI request timed out after ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

async function parseAiResponse(raw: string, model: string): Promise<AiAnalysisResult> {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  return { ...JSON.parse(cleaned), _model: model }
}

async function callAnthropic(anthropic: Anthropic, model: string, userPrompt: string): Promise<AiAnalysisResult> {
  const response = await withTimeout(
    anthropic.messages.create({
      model,
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
    AI_TIMEOUT_MS,
  )
  const raw = response.content.find((c) => c.type === 'text')?.text || '{}'
  return parseAiResponse(raw, model)
}

async function callGroq(groq: Groq, model: string, userPrompt: string): Promise<AiAnalysisResult> {
  const completion = await withTimeout(
    groq.chat.completions.create({
      model,
      temperature: 0.7,
      max_completion_tokens: 3000,
      stream: false,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
    AI_TIMEOUT_MS,
  )
  const raw = completion.choices[0]?.message?.content || '{}'
  return parseAiResponse(raw, model)
}

function isRetryableError(err: any): boolean {
  const status = err?.status ?? err?.statusCode
  return RATE_LIMIT_CODES.has(status) || status >= 500 || err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT'
}

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function analyzeWithAi(input: AiAnalysisInput): Promise<AiAnalysisResult> {
  const config = useRuntimeConfig()

  const anthropic = new Anthropic({
    apiKey: config.anthropicAuthToken || config.anthropicApiKey,
    baseURL: config.anthropicBaseUrl || undefined,
    defaultHeaders: { 'User-Agent': 'anthropic-typescript/0.36.0' },
  })

  const groq = config.groqApiKey
    ? new Groq({ apiKey: config.groqApiKey })
    : null

  const userPrompt = buildUserPrompt(input)

  const attempts: Array<{ fn: () => Promise<AiAnalysisResult>; retries: number; backoffMs: number }> = [
    { fn: () => callAnthropic(anthropic, config.anthropicSonnetModel || 'cc/claude-sonnet-4-6', userPrompt), retries: 2, backoffMs: 500 },
    { fn: () => callAnthropic(anthropic, config.anthropicHaikuModel || 'ocg/kimi-k2.7-code', userPrompt), retries: 2, backoffMs: 750 },
  ]

  if (groq) {
    attempts.push({ fn: () => callGroq(groq, config.groqModel || 'openai/gpt-oss-120b', userPrompt), retries: 2, backoffMs: 1000 })
  }

  const errors: string[] = []

  for (const { fn, retries, backoffMs } of attempts) {
    let lastAttempt = 0
    while (lastAttempt <= retries) {
      try {
        return await fn()
      } catch (err: any) {
        const msg = err?.message || String(err)
        errors.push(msg)

        if (isRetryableError(err) && lastAttempt < retries) {
          const wait = backoffMs * 2 ** lastAttempt
          console.warn(`AI provider failed (${msg}), retrying in ${wait}ms...`)
          await delay(wait)
          lastAttempt++
          continue
        }

        console.warn(`AI provider failed (${msg}), trying next fallback...`)
        break
      }
    }
  }

  throw new Error(`All AI providers failed: ${errors.join(' | ')}`)
}

function ageGroup(years: number): string {
  if (years <= 6) return 'Tahap Awal (3–6 tahun)'
  if (years <= 11) return 'Tahap Berkembang (7–11 tahun)'
  return 'Tahap Eksplorasi (12–15 tahun)'
}

function buildUserPrompt(input: AiAnalysisInput): string {
  let prompt = `Data anak:
- Nama: ${input.childName}
- Usia: ${input.childAgeYears} tahun — ${ageGroup(input.childAgeYears)}
- Jenis kelamin: ${input.childGender === 'L' ? 'Laki-laki' : 'Perempuan'}

Skor Hasab (0-25 per rumpun):
- Al-Qiyadah: ${input.scores.asyiha} (${input.percentages.asyiha}%)
- Ilmi: ${input.scores.ilmi} (${input.percentages.ilmi}%)
- Amali: ${input.scores.amali} (${input.percentages.amali}%)
- Wajdan: ${input.scores.wajdan} (${input.percentages.wajdan}%)

Urutan rumpun dari dominan ke lemah: ${input.orderedHasab.join(' > ')}

Respon alami / minat dominan anak saat ini: ${input.naturalResponses.join(', ') || 'tidak ada'}

Jawaban nasab (1=ya, 0=tidak): ${Object.entries(input.nasabAnswers).map(([qid, val]) => `Q${qid}:${val}`).join(', ')}`

  if (input.familyFitGap) {
    const fg = input.familyFitGap
    const pct = Math.round(fg.fitGapScore * 100)
    const dimLabels: Record<string, string> = {
      ilmi: 'Ilmi', qiyadah: 'Al-Qiyadah', amali: 'Amali', wajdan: 'Wajdan', tarbiyah: 'Tarbiyah',
    }
    const top3 = fg.top3Hasab.map((d) => dimLabels[d] ?? d).join(', ')
    const isOptimal = fg.fitGapStatus === 'OPTIMAL'

    const FIGURE_LABELS: Record<string, string> = {
      kakek_ayah: 'Kakek (pihak Ayah)',
      nenek_ayah: 'Nenek (pihak Ayah)',
      kakek_ibu:  'Kakek (pihak Ibu)',
      nenek_ibu:  'Nenek (pihak Ibu)',
      ayah: 'Ayah',
      ibu:  'Ibu',
    }
    const skippedLabels = (fg.skippedFigures ?? []).map((r) => FIGURE_LABELS[r] ?? r)

    prompt += `

---
DATA EKOSISTEM KELUARGA (Hasab Keluarga — ${fg.figuresIncluded} figur diisi):
- Status Fit-Gap: ${fg.fitGapStatus} — Skor ${pct}%
- Top-3 Hasab Keluarga (dimensi terkuat): ${top3}
- Analisis sistem: ${fg.recommendation}${
  skippedLabels.length > 0
    ? `\n- Figur yang di-skip (tidak dikenal / sudah meninggal): ${skippedLabels.join(', ')}`
    : ''
}

INSTRUKSI TAMBAHAN:
Gunakan konteks keluarga di atas untuk MEMPERKAYA parentNotes, microdosingPlan, fitGapNarrative, dan bridgingActions:
${isOptimal
  ? `- Keluarga MENDUKUNG potensi anak (Fit-Gap OPTIMAL). Dorong sinergi antara kekuatan anak dan tradisi keluarga. Sebutkan secara eksplisit bagaimana keluarga bisa menjadi katalis.`
  : `- Ada KESENJANGAN antara potensi anak dan ekosistem keluarga. Berikan strategi bridging yang konkret: bagaimana orang tua bisa secara sengaja mengisi celah tersebut, sambil tetap menghargai tradisi keluarga.`
}${
  skippedLabels.length > 0
    ? `\n- Figur yang di-skip JANGAN dijadikan target langsung di bridgingActions. Untuk figur yang sudah meninggal: gunakan target "keluarga" dengan action berupa "ceritakan kisah/warisan [nama figur] kepada anak" — fokus pada transmisi nilai, bukan interaksi langsung.`
    : ''
}
- Dalam microdosingPlan, setidaknya 1 aktivitas harus melibatkan figur yang AKTIF (tidak di-skip) secara eksplisit. Jangan cantumkan figureInvolved untuk figur yang di-skip.
- Tetap pertahankan semua field JSON lainnya (persona, skor, les, dll.).`
  }

  prompt += `\n\nBuatkan analisis dalam format JSON sesuai instruksi.`
  return prompt
}
