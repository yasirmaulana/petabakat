// Dimensi dari checkbox naturalResponses yang sudah bertag [dimension]
// atau yang masuk optionsByDimension di survey.vue
const CHECKBOX_DIMENSION_MAP: Record<string, string> = {
  // Qiyadah
  'Suka bercerita atau berpidato di depan orang': 'qiyadah',
  'Suka menjadi pemimpin dalam permainan kelompok': 'qiyadah',
  'Senang membantu dan peduli terhadap teman': 'qiyadah',
  'Suka mengorganisir kegiatan atau acara': 'qiyadah',
  'Mudah bergaul dan cepat punya teman baru': 'qiyadah',
  'Pandai meyakinkan atau mengajak orang lain': 'qiyadah',
  // Ilmi
  'Kritis dan banyak bertanya "kenapa"': 'ilmi',
  'Senang membaca atau mencari tahu hal baru': 'ilmi',
  'Suka teka-teki, strategi, atau permainan logika': 'ilmi',
  'Suka berdebat atau berargumentasi': 'ilmi',
  'Senang menghafal (Quran, fakta, data)': 'ilmi',
  'Tertarik dengan komputer, robotik, atau coding': 'ilmi',
  // Amali
  'Suka bongkar-pasang atau merakit barang': 'amali',
  'Suka membuat sesuatu dengan tangan (prakarya, masak, berkebun)': 'amali',
  'Semangat kalau ada proyek atau tantangan nyata': 'amali',
  'Suka berdagang / jual-beli kecil-kecilan': 'amali',
  'Teliti dan suka merapikan barang atau jadwal': 'amali',
  'Aktif bergerak dan suka olahraga atau tantangan fisik': 'amali',
  // Karam
  'Senang membantu teman yang kesusahan tanpa diminta': 'karam',
  'Suka berbagi makanan, mainan, atau barang miliknya': 'karam',
  'Mudah merasakan sedih atau senang bersama orang lain (empati)': 'karam',
  'Sering menjadi penengah saat teman-temannya berselisih': 'karam',
  'Senang berkontribusi dalam kegiatan sosial atau bakti sosial': 'karam',
  'Rela mengalah demi menjaga kerukunan bersama': 'karam',
}

const DIM_TO_SCORE_KEY: Record<string, string> = {
  qiyadah: 'qiyadah',
  ilmi: 'ilmi',
  amali: 'amali',
  karam: 'karam',
}

const OPTIONS_PER_DIM = 6  // opsi predefined per rumpun di checklist

/**
 * Hitung scores dari naturalResponses (checkbox + custom tambahan).
 * Custom tambahan berformat "[dimension] teks" atau tanpa tag (diabaikan dari scoring, tetap dikirim ke AI).
 * Output dinormalisasi ke 0–100 agar sebanding dengan skor keluarga.
 */
export function calculateNaturalResponseScores(naturalResponses: string[]): {
  qiyadah: number; ilmi: number; amali: number; karam: number
} {
  const counts: Record<string, number> = { qiyadah: 0, ilmi: 0, amali: 0, karam: 0 }

  for (const resp of naturalResponses) {
    // Custom response dengan tag [dimension]
    const tagMatch = resp.match(/^\[(\w+)\]\s+(.+)$/)
    if (tagMatch) {
      const key = DIM_TO_SCORE_KEY[tagMatch[1]]
      if (key) counts[key]++
      continue
    }
    // Predefined checkbox
    const dim = CHECKBOX_DIMENSION_MAP[resp]
    if (dim) {
      const key = DIM_TO_SCORE_KEY[dim]
      if (key) counts[key]++
    }
    // String lain (momentAntusias, dll) — tidak masuk scoring
  }

  // Normalisasi ke 0–100 (cap di OPTIONS_PER_DIM agar custom input tidak overflow)
  const norm = (n: number) => Math.round(Math.min(n, OPTIONS_PER_DIM) / OPTIONS_PER_DIM * 100)
  return {
    qiyadah: norm(counts.qiyadah),
    ilmi:    norm(counts.ilmi),
    amali:   norm(counts.amali),
    karam:   norm(counts.karam),
  }
}

export function calculateHasabScores(answers: Record<number, number>) {
  const entries = Object.entries(answers).map(([questionId, value]) => ({
    questionId: Number(questionId),
    value: Number(value),
  }))

  const total = entries.reduce((sum, e) => sum + e.value, 0)
  if (total === 0) {
    return { qiyadah: 0, ilmi: 0, amali: 0, karam: 0 }
  }

  const scores: Record<string, number> = {
    qiyadah: 0,
    ilmi: 0,
    amali: 0,
    karam: 0,
  }

  for (const entry of entries) {
    const code = categoryCodeByQuestionId(entry.questionId)
    if (code) scores[code] += entry.value
  }

  return {
    qiyadah: scores.qiyadah,
    ilmi: scores.ilmi,
    amali: scores.amali,
    karam: scores.karam,
  }
}

export function calculatePercentages(scores: Record<string, number>) {
  const total = Object.values(scores).reduce((sum, v) => sum + v, 0)
  if (total === 0) {
    return { qiyadah: 0, ilmi: 0, amali: 0, karam: 0 }
  }
  return {
    qiyadah: Number(((scores.qiyadah / total) * 100).toFixed(2)),
    ilmi:    Number(((scores.ilmi    / total) * 100).toFixed(2)),
    amali:   Number(((scores.amali   / total) * 100).toFixed(2)),
    karam:   Number(((scores.karam   / total) * 100).toFixed(2)),
  }
}

function categoryCodeByQuestionId(questionId: number): string | null {
  // Map pertanyaan hasab ke kode kategori berdasarkan urutan seed
  // Qiyadah: id 1-5, Ilmi: 6-10, Amali: 11-15, Karam: 16-20
  // ponytail: ganti dengan lookup DB jika urutan seed berubah-ubah
  const index = (questionId - 1) % 20
  if (index >= 0 && index <= 4)   return 'qiyadah'
  if (index >= 5 && index <= 9)   return 'ilmi'
  if (index >= 10 && index <= 14) return 'amali'
  if (index >= 15 && index <= 19) return 'karam'
  return null
}
