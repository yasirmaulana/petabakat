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
}

export interface AiAnalysisOutput {
  personaLabel: string
  personaDescription: string
  scoreNarrative: string
  parentNotes: string
  microdosingPlan: {
    title: string
    schedule: { day: string; activity: string; durationMinutes: number }[]
  }
}

const systemPrompt = `Kamu adalah asesor potensi anak berbasis framework Nasab & Hasab dalam perspektif Islam.

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

const RATE_LIMIT_CODES = new Set([429, 529])

export interface AiAnalysisResult extends AiAnalysisOutput {
  _model: string
}

async function parseAiResponse(raw: string, model: string): Promise<AiAnalysisResult> {
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim()
  return { ...JSON.parse(cleaned), _model: model }
}

async function callAnthropic(anthropic: Anthropic, model: string, userPrompt: string): Promise<AiAnalysisResult> {
  const response = await anthropic.messages.create({
    model,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: 'user', content: userPrompt }],
  })
  const raw = response.content.find((c) => c.type === 'text')?.text || '{}'
  return parseAiResponse(raw, model)
}

async function callGroq(groq: Groq, model: string, userPrompt: string): Promise<AiAnalysisResult> {
  const completion = await groq.chat.completions.create({
    model,
    temperature: 0.7,
    max_tokens: 3000,
    stream: false,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  })
  const raw = completion.choices[0]?.message?.content || '{}'
  return parseAiResponse(raw, model)
}

function isRetryableError(err: any): boolean {
  const status = err?.status ?? err?.statusCode
  return RATE_LIMIT_CODES.has(status) || status >= 500 || err?.code === 'ECONNRESET' || err?.code === 'ETIMEDOUT'
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

  const attempts: Array<() => Promise<AiAnalysisResult>> = [
    () => callAnthropic(anthropic, config.anthropicSonnetModel || 'cc/claude-sonnet-4-6', userPrompt),
    () => callAnthropic(anthropic, config.anthropicHaikuModel || 'ocg/kimi-k2.7-code', userPrompt),
  ]

  if (groq) {
    attempts.push(() => callGroq(groq, config.groqModel || 'llama-3.3-70b-versatile', userPrompt))
  }

  const errors: string[] = []
  for (const attempt of attempts) {
    try {
      return await attempt()
    } catch (err: any) {
      const msg = err?.message || String(err)
      errors.push(msg)
      if (isRetryableError(err)) {
        console.warn(`AI provider failed (${msg}), trying next fallback...`)
        continue
      }
      // client/config errors: fail fast
      throw err
    }
  }

  throw new Error(`All AI providers failed: ${errors.join(' | ')}`)
}

function buildUserPrompt(input: AiAnalysisInput): string {
  return `Data anak:
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

Jawaban nasab (1=ya, 0=tidak): ${Object.entries(input.nasabAnswers).map(([qid, val]) => `Q${qid}:${val}`).join(', ')}

Buatkan analisis dalam format JSON sesuai instruksi.`
}
