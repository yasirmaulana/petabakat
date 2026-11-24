import { describe, expect, it } from 'vitest'
import { parseSurveyInput } from '../../server/utils/surveyInput'

const valid = {
  parentName: '  Budi  ',
  parentPhone: '081234567890',
  parentEmail: '',
  childName: 'Aisyah',
  childBirthDate: '2018-05-01',
  childGender: 'P',
  naturalResponses: ['Senang membaca atau mencari tahu hal baru', '[amali] suka memasak'],
  voucherCode: ' mx-abc123 ',
  schoolId: null,
  schoolCode: null,
  schoolClassId: null,
  schoolConsent: false,
}

const errorOf = (body: unknown) => {
  try {
    parseSurveyInput(body)
  } catch (e) {
    return e as { statusCode: number; message: string }
  }
  throw new Error('expected parseSurveyInput to throw')
}

describe('parseSurveyInput', () => {
  it('menerima payload valid dan menormalisasi nilainya', () => {
    const r = parseSurveyInput(valid)
    expect(r.parentName).toBe('Budi')
    expect(r.parentEmail).toBeNull()
    expect(r.childBirthDate).toBeInstanceOf(Date)
    expect(r.voucherCode).toBe('MX-ABC123')
    expect(r.schoolId).toBeNull()
    expect(r.schoolConsent).toBe(false)
  })

  it('kode voucher wajib — survey tidak bisa dibuat gratis lewat API', () => {
    expect(errorOf({ ...valid, voucherCode: '' })).toMatchObject({ statusCode: 400, message: 'Kode voucher wajib diisi.' })
  })

  it('id voucher saja (tanpa kode) ditolak — id berurutan bisa ditebak', () => {
    const { voucherCode: _, ...rest } = valid
    expect(errorOf({ ...rest, voucherId: 1 }).statusCode).toBe(400)
  })

  it('schoolId tanpa kode sekolah ditolak', () => {
    expect(errorOf({ ...valid, schoolId: 3 })).toMatchObject({ statusCode: 400, message: 'Kode sekolah wajib diisi.' })
  })

  it.each([
    ['body bukan objek', null],
    ['naturalResponses hilang', { ...valid, naturalResponses: undefined }],
    ['naturalResponses kosong', { ...valid, naturalResponses: [] }],
    ['naturalResponses berisi non-string', { ...valid, naturalResponses: [1] }],
    ['naturalResponses terlalu banyak', { ...valid, naturalResponses: Array(61).fill('x') }],
    ['tanggal lahir tidak valid', { ...valid, childBirthDate: 'bukan-tanggal' }],
    ['tanggal lahir di masa depan', { ...valid, childBirthDate: '2999-01-01' }],
    ['gender tidak dikenal', { ...valid, childGender: 'X' }],
    ['nomor WA berisi huruf', { ...valid, parentPhone: '0812abc' }],
    ['email tidak valid', { ...valid, parentEmail: 'bukan-email' }],
    ['nama anak kosong', { ...valid, childName: '   ' }],
    ['nama terlalu panjang', { ...valid, parentName: 'a'.repeat(101) }],
    ['schoolId bukan bilangan bulat positif', { ...valid, schoolId: -1 }],
  ])('400 untuk %s', (_, body) => {
    expect(errorOf(body).statusCode).toBe(400)
  })

  it('schoolConsent hanya true bila benar-benar boolean true', () => {
    expect(parseSurveyInput({ ...valid, schoolConsent: 'true' }).schoolConsent).toBe(false)
    expect(parseSurveyInput({ ...valid, schoolId: '3', schoolCode: ' sd01 ', schoolClassId: 4, schoolConsent: true })).toMatchObject({
      schoolId: 3, schoolCode: 'SD01', schoolClassId: 4, schoolConsent: true,
    })
  })
})
