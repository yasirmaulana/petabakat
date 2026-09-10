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
  // Wajdan
  'Suka menggambar, mewarnai, atau berkarya visual': 'wajdan',
  'Peka dengan musik, suara, atau irama': 'wajdan',
  'Mudah merasakan suasana hati orang lain / peka secara emosi': 'wajdan',
  'Suka bercerita lewat tulisan atau gambar komik': 'wajdan',
  'Senang dengan kegiatan rohani (mengaji, dzikir, doa)': 'wajdan',
  'Peka dan mudah terbawa suasana saat menonton atau mendengar cerita': 'wajdan',
}

// Dimensi qiyadah di sini dimap ke 'asyiha' (sesuai schema surveyResult yang ada)
const DIM_TO_SCORE_KEY: Record<string, string> = {
  qiyadah: 'asyiha',
  ilmi: 'ilmi',
  amali: 'amali',
  wajdan: 'wajdan',
}

/**
 * Hitung scores dari naturalResponses (checkbox + custom tambahan).
 * Custom tambahan berformat "[dimension] teks" atau tanpa tag (diabaikan dari scoring, tetap dikirim ke AI).
 */
export function calculateNaturalResponseScores(naturalResponses: string[]): {
  asyiha: number; ilmi: number; amali: number; wajdan: number
} {
  const counts: Record<string, number> = { asyiha: 0, ilmi: 0, amali: 0, wajdan: 0 }

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

  return { asyiha: counts.asyiha, ilmi: counts.ilmi, amali: counts.amali, wajdan: counts.wajdan }
}

export function calculateHasabScores(answers: Record<number, number>) {
  const entries = Object.entries(answers).map(([questionId, value]) => ({
    questionId: Number(questionId),
    value: Number(value),
  }))

  const total = entries.reduce((sum, e) => sum + e.value, 0)
  if (total === 0) {
    return { asyiha: 0, ilmi: 0, amali: 0, wajdan: 0 }
  }

  const scores: Record<string, number> = {
    asyiha: 0,
    ilmi: 0,
    amali: 0,
    wajdan: 0,
  }

  for (const entry of entries) {
    const code = categoryCodeByQuestionId(entry.questionId)
    if (code) scores[code] += entry.value
  }

  return {
    asyiha: scores.asyiha,
    ilmi: scores.ilmi,
    amali: scores.amali,
    wajdan: scores.wajdan,
  }
}

export function calculatePercentages(scores: Record<string, number>) {
  const total = Object.values(scores).reduce((sum, v) => sum + v, 0)
  if (total === 0) {
    return { asyiha: 0, ilmi: 0, amali: 0, wajdan: 0 }
  }
  return {
    asyiha: Number(((scores.asyiha / total) * 100).toFixed(2)),
    ilmi: Number(((scores.ilmi / total) * 100).toFixed(2)),
    amali: Number(((scores.amali / total) * 100).toFixed(2)),
    wajdan: Number(((scores.wajdan / total) * 100).toFixed(2)),
  }
}

function categoryCodeByQuestionId(questionId: number): string | null {
  // Map pertanyaan hasab ke kode kategori berdasarkan urutan seed
  // Asyiha: id 1-5, Ilmi: 6-10, Amali: 11-15, Wajdan: 16-20
  // Di production sebaiknya query dari DB, tapi untuk kalkulasi ini bisa infer dari relasi tersimpan
  // Karena jawaban sudah terikat question_id, kita gunakan modulo block sementara
  // ponytail: ganti dengan lookup DB jika urutan seed berubah-ubah
  const index = (questionId - 1) % 20
  if (index >= 0 && index <= 4) return 'asyiha'
  if (index >= 5 && index <= 9) return 'ilmi'
  if (index >= 10 && index <= 14) return 'amali'
  if (index >= 15 && index <= 19) return 'wajdan'
  return null
}
