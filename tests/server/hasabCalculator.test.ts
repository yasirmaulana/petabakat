import { describe, expect, it } from 'vitest'
import {
  calculateHasabScores,
  calculateNaturalResponseScores,
  calculatePercentages,
} from '../../server/utils/hasabCalculator'

describe('calculateHasabScores', () => {
  it('mengelompokkan jawaban per rumpun berdasarkan id soal (1-5, 6-10, 11-15, 16-20)', () => {
    const answers: Record<number, number> = {}
    for (let id = 1; id <= 20; id++) answers[id] = 1
    answers[1] = 5
    answers[20] = 4
    expect(calculateHasabScores(answers)).toEqual({ qiyadah: 9, ilmi: 5, amali: 5, karam: 8 })
  })

  it('id di atas 20 dipetakan berulang (modulo 20)', () => {
    expect(calculateHasabScores({ 21: 3, 26: 2, 31: 4, 40: 1 })).toEqual({ qiyadah: 3, ilmi: 2, amali: 4, karam: 1 })
  })

  it('semua nol bila tidak ada jawaban atau total 0', () => {
    const zero = { qiyadah: 0, ilmi: 0, amali: 0, karam: 0 }
    expect(calculateHasabScores({})).toEqual(zero)
    expect(calculateHasabScores({ 1: 0, 6: 0 })).toEqual(zero)
  })

  it('id tidak valid (<= 0) diabaikan', () => {
    expect(calculateHasabScores({ 0: 5, 1: 2 })).toEqual({ qiyadah: 2, ilmi: 0, amali: 0, karam: 0 })
  })
})

describe('calculatePercentages', () => {
  it('menghitung persentase dengan 2 desimal', () => {
    expect(calculatePercentages({ qiyadah: 1, ilmi: 1, amali: 1, karam: 0 })).toEqual({
      qiyadah: 33.33, ilmi: 33.33, amali: 33.33, karam: 0,
    })
  })

  it('total 0 menghasilkan semua 0 (tanpa NaN)', () => {
    expect(calculatePercentages({ qiyadah: 0, ilmi: 0, amali: 0, karam: 0 })).toEqual({
      qiyadah: 0, ilmi: 0, amali: 0, karam: 0,
    })
  })
})

describe('calculateNaturalResponseScores', () => {
  it('menghitung checkbox predefined per rumpun dan menormalisasi ke 0-100', () => {
    const result = calculateNaturalResponseScores([
      'Suka bercerita atau berpidato di depan orang',
      'Suka menjadi pemimpin dalam permainan kelompok',
      'Senang membaca atau mencari tahu hal baru',
      'Rela mengalah demi menjaga kerukunan bersama',
    ])
    expect(result).toEqual({ qiyadah: 33, ilmi: 17, amali: 0, karam: 17 })
  })

  it('menghitung input custom bertag [dimension]', () => {
    expect(calculateNaturalResponseScores(['[amali] suka memasak', '[amali] suka berkebun'])).toEqual({
      qiyadah: 0, ilmi: 0, amali: 33, karam: 0,
    })
  })

  it('mengabaikan tag tak dikenal dan teks bebas tanpa tag', () => {
    expect(calculateNaturalResponseScores(['[tarbiyah] sesuatu', 'momen antusias bebas', ''])).toEqual({
      qiyadah: 0, ilmi: 0, amali: 0, karam: 0,
    })
  })

  it('dibatasi maksimal 100 walau input custom melebihi jumlah opsi', () => {
    const many = Array.from({ length: 10 }, (_, i) => `[ilmi] minat ${i}`)
    expect(calculateNaturalResponseScores(many).ilmi).toBe(100)
  })
})
