// Bobot figur: ayah/ibu lebih berpengaruh dari kakek/nenek
const FIGURE_WEIGHTS: Record<string, number> = {
  ayah: 1.2,
  ibu: 1.2,
  kakek_ayah: 1.0,
  nenek_ayah: 1.0,
  kakek_ibu: 1.0,
  nenek_ibu: 1.0,
}

const DIMENSIONS = ['ilmi', 'qiyadah', 'amali', 'karam', 'tarbiyah'] as const
type Dimension = typeof DIMENSIONS[number]

// Mapping kode soal → dimensi (D1=ilmi … D5=tarbiyah)
function dimensionByCode(code: string): Dimension | null {
  const prefix = code.slice(0, 2)
  const map: Record<string, Dimension> = { D1: 'ilmi', D2: 'qiyadah', D3: 'amali', D4: 'karam', D5: 'tarbiyah' }
  return map[prefix] ?? null
}

export interface FigureAnswers {
  role: string
  isKnown: boolean
  answers: { questionCode: string; value: number }[]
}

export interface FamilyScores {
  ilmi: number
  qiyadah: number
  amali: number
  karam: number
  tarbiyah: number
}

export interface FamilyCalcResult {
  scores: FamilyScores
  top3Hasab: Dimension[]
  figuresIncluded: number
}

const QUESTIONS_PER_DIM = 6   // soal per dimensi per figur
const SCORE_MAX = 5            // nilai Likert maksimum
const NORMALIZED_MAX = 100    // skala 0–100, sebanding dengan skor anak

export function calculateFamilyScores(figures: FigureAnswers[]): FamilyCalcResult {
  const totals: Record<Dimension, number> = { ilmi: 0, qiyadah: 0, amali: 0, karam: 0, tarbiyah: 0 }
  const weightSums: Record<Dimension, number> = { ilmi: 0, qiyadah: 0, amali: 0, karam: 0, tarbiyah: 0 }
  let figuresIncluded = 0

  for (const figure of figures) {
    if (!figure.isKnown) continue
    figuresIncluded++
    const weight = FIGURE_WEIGHTS[figure.role] ?? 1.0

    // Hitung skor mentah per dimensi untuk figur ini
    const figDimScores: Partial<Record<Dimension, number>> = {}
    for (const answer of figure.answers) {
      const dim = dimensionByCode(answer.questionCode)
      if (dim) figDimScores[dim] = (figDimScores[dim] ?? 0) + answer.value
    }

    // Akumulasi ke totals dengan bobot — hanya dimensi yang ada jawaban
    for (const dim of DIMENSIONS) {
      if (figDimScores[dim] !== undefined) {
        totals[dim] += figDimScores[dim] * weight
        weightSums[dim] += weight
      }
    }
  }

  // Normalisasi ke skala 0–25 (sama dengan skor anak)
  // max per dimensi per figur = QUESTIONS_PER_DIM × SCORE_MAX
  const maxPerFigureDim = QUESTIONS_PER_DIM * SCORE_MAX
  const normalized: Record<Dimension, number> = { ilmi: 0, qiyadah: 0, amali: 0, karam: 0, tarbiyah: 0 }
  for (const dim of DIMENSIONS) {
    if (weightSums[dim] === 0) continue
    const maxPossible = maxPerFigureDim * weightSums[dim]
    normalized[dim] = Math.round((totals[dim] / maxPossible) * NORMALIZED_MAX * 10) / 10
  }

  // Ranking descending untuk Top-3, tiebreaker: urutan deklarasi DIMENSIONS
  const ranked = (Object.entries(normalized) as [Dimension, number][])
    .sort((a, b) => b[1] - a[1] || DIMENSIONS.indexOf(a[0]) - DIMENSIONS.indexOf(b[0]))

  const top3Hasab = ranked.slice(0, 3).map(([dim]) => dim)

  return { scores: normalized as FamilyScores, top3Hasab, figuresIncluded }
}

// ─── Fit-Gap ──────────────────────────────────────────────────────────────────

// Peta dari kode rumpun anak (survey) ke kode dimensi keluarga
const CHILD_TO_FAMILY_DIM: Record<string, Dimension> = {
  qiyadah: 'qiyadah',
  ilmi: 'ilmi',
  amali: 'amali',
  karam: 'karam',
}

export interface FitGapResult {
  fitGapStatus: 'OPTIMAL' | 'GAP'
  fitGapScore: number // 0.00 – 1.00
  recommendation: string
}

/**
 * Hitung Fit-Gap antara rumpun dominan anak dan Top-3 Hasab Keluarga.
 * @param childOrdered rumpun anak diurutkan dari dominan ke lemah (dari SurveyResult)
 * @param familyTop3   Top-3 dimensi keluarga dari calculateFamilyScores
 */
export function calculateFitGap(childOrdered: string[], familyTop3: Dimension[]): FitGapResult {
  // Ambil 2 rumpun teratas anak, petakan ke dimensi keluarga
  const childTop2Dims = childOrdered
    .slice(0, 2)
    .map((c) => CHILD_TO_FAMILY_DIM[c])
    .filter(Boolean) as Dimension[]

  const matchCount = childTop2Dims.filter((d) => familyTop3.includes(d)).length
  const fitGapScore = Number((matchCount / Math.max(childTop2Dims.length, 1)).toFixed(2))

  const fitGapStatus: 'OPTIMAL' | 'GAP' = fitGapScore >= 0.5 ? 'OPTIMAL' : 'GAP'

  const dominantChild = childOrdered[0] ?? ''
  const familyDimLabel: Record<Dimension, string> = {
    ilmi: 'Ilmi (tradisi keilmuan)',
    qiyadah: 'Qiyadah (kepemimpinan)',
    amali: 'Amali (etos kerja & eksekusi)',
    karam: 'Karam (kedermawanan & empati)',
    tarbiyah: 'Tarbiyah (gaya pengasuhan)',
  }
  const childLabel: Record<string, string> = {
    qiyadah: 'Al-Qiyadah',
    ilmi: 'Ilmi',
    amali: 'Amali',
    karam: 'Al-Karam',
  }

  let recommendation: string
  if (fitGapStatus === 'OPTIMAL') {
    recommendation =
      `Ekosistem keluarga mendukung penuh potensi ${childLabel[dominantChild] ?? dominantChild} anak. ` +
      `Ayah/Bunda dan keluarga besar dapat berperan langsung sebagai mentor utama—rekam jejak keluarga sudah selaras ` +
      `dengan kecenderungan alami ananda. Teruskan pola pengasuhan yang ada dan perkuat dengan aktivitas bersama.`
  } else {
    const gapDims = childTop2Dims
      .filter((d) => !familyTop3.includes(d))
      .map((d) => familyDimLabel[d])
      .join(' dan ')
    recommendation =
      `Minat dominan ananda (${childLabel[dominantChild] ?? dominantChild}) membutuhkan stimulasi di bidang ${gapDims || 'yang belum menjadi budaya utama keluarga'}. ` +
      `Disarankan untuk menghubungkan ananda dengan mentor luar, komunitas, atau ekosistem pendukung yang sesuai. ` +
      `Keluarga tetap dapat berperan di bidang kekuatan Hasab-nya sambil memfasilitasi eksplorasi ananda.`
  }

  return { fitGapStatus, fitGapScore, recommendation }
}
