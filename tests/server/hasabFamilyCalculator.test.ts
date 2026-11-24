import { describe, expect, it } from 'vitest'
import {
  calculateFamilyScores,
  calculateFitGap,
  type FigureAnswers,
} from '../../server/utils/hasabFamilyCalculator'

/** Jawaban 6 soal untuk satu dimensi (D1..D5) dengan nilai yang sama. */
function dim(prefix: string, value: number) {
  return Array.from({ length: 6 }, (_, i) => ({ questionCode: `${prefix}_${i + 1}`, value }))
}

describe('calculateFamilyScores', () => {
  it('skor maksimum (semua 5) menjadi 100', () => {
    const figures: FigureAnswers[] = [{ role: 'ayah', isKnown: true, answers: dim('D1', 5) }]
    const r = calculateFamilyScores(figures)
    expect(r.scores.ilmi).toBe(100)
    expect(r.figuresIncluded).toBe(1)
  })

  it('figur yang tidak dikenal (isKnown=false) tidak dihitung', () => {
    const r = calculateFamilyScores([
      { role: 'ayah', isKnown: true, answers: dim('D2', 5) },
      { role: 'kakek_ayah', isKnown: false, answers: dim('D2', 1) },
    ])
    expect(r.figuresIncluded).toBe(1)
    expect(r.scores.qiyadah).toBe(100)
  })

  it('ayah/ibu berbobot 1.2, kakek/nenek 1.0 (rata-rata berbobot)', () => {
    // ayah: 30/30, kakek: 6/30 → (30*1.2 + 6*1.0) / (30*2.2) * 100 = 63.6
    const r = calculateFamilyScores([
      { role: 'ayah', isKnown: true, answers: dim('D3', 5) },
      { role: 'kakek_ibu', isKnown: true, answers: dim('D3', 1) },
    ])
    expect(r.scores.amali).toBe(63.6)
  })

  it('dimensi tanpa jawaban tetap 0 dan kode soal tak dikenal diabaikan', () => {
    const r = calculateFamilyScores([
      { role: 'ibu', isKnown: true, answers: [...dim('D4', 3), { questionCode: 'X9_1', value: 5 }] },
    ])
    expect(r.scores).toEqual({ ilmi: 0, qiyadah: 0, amali: 0, karam: 60, tarbiyah: 0 })
  })

  it('top3 diurutkan menurun dengan tiebreaker urutan dimensi (ilmi, qiyadah, amali, karam, tarbiyah)', () => {
    const r = calculateFamilyScores([
      { role: 'ayah', isKnown: true, answers: [...dim('D5', 5), ...dim('D4', 3), ...dim('D3', 3), ...dim('D1', 1)] },
    ])
    expect(r.top3Hasab).toEqual(['tarbiyah', 'amali', 'karam'])
  })

  it('tanpa figur sama sekali → semua nol', () => {
    const r = calculateFamilyScores([])
    expect(r.figuresIncluded).toBe(0)
    expect(r.top3Hasab).toEqual(['ilmi', 'qiyadah', 'amali'])
  })
})

describe('calculateFitGap', () => {
  it('OPTIMAL bila kedua rumpun teratas anak ada di top3 keluarga', () => {
    const r = calculateFitGap(['ilmi', 'qiyadah', 'amali'], ['ilmi', 'qiyadah', 'karam'])
    expect(r).toMatchObject({ fitGapStatus: 'OPTIMAL', fitGapScore: 1 })
    expect(r.recommendation).toContain('Ilmi')
  })

  it('OPTIMAL pada batas 0.5 (satu dari dua cocok)', () => {
    expect(calculateFitGap(['ilmi', 'amali'], ['ilmi', 'karam', 'tarbiyah'])).toMatchObject({
      fitGapStatus: 'OPTIMAL', fitGapScore: 0.5,
    })
  })

  it('GAP bila tidak ada yang cocok, rekomendasi menyebut dimensi yang kurang', () => {
    const r = calculateFitGap(['qiyadah', 'amali'], ['ilmi', 'karam', 'tarbiyah'])
    expect(r).toMatchObject({ fitGapStatus: 'GAP', fitGapScore: 0 })
    expect(r.recommendation).toContain('Al-Qiyadah')
    expect(r.recommendation).toContain('Qiyadah (kepemimpinan) dan Amali (etos kerja & eksekusi)')
  })

  it('rumpun anak kosong → GAP dengan skor 0 tanpa error', () => {
    const r = calculateFitGap([], ['ilmi', 'qiyadah', 'amali'])
    expect(r).toMatchObject({ fitGapStatus: 'GAP', fitGapScore: 0 })
    expect(r.recommendation).toContain('yang belum menjadi budaya utama keluarga')
  })
})
