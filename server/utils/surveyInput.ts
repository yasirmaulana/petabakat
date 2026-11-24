export interface SurveyInput {
  parentName: string
  parentPhone: string
  parentEmail: string | null
  childName: string
  childBirthDate: Date
  childGender: 'L' | 'P'
  naturalResponses: string[]
  voucherCode: string
  schoolId: number | null
  schoolCode: string | null
  schoolClassId: number | null
  schoolConsent: boolean
}

const MAX_RESPONSES = 60
const MAX_RESPONSE_LENGTH = 1000

function fail(message: string): never {
  throw createError({ statusCode: 400, message })
}

function requiredText(value: unknown, label: string, max = 100): string {
  if (typeof value !== 'string' || !value.trim()) fail(`${label} wajib diisi.`)
  const text = value.trim()
  if (text.length > max) fail(`${label} maksimal ${max} karakter.`)
  return text
}

function optionalId(value: unknown, label: string): number | null {
  if (value === null || value === undefined || value === '') return null
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) fail(`${label} tidak valid.`)
  return id
}

/** Validasi body POST /api/surveys di batas kepercayaan (klien tidak dipercaya). */
export function parseSurveyInput(body: unknown): SurveyInput {
  if (!body || typeof body !== 'object') fail('Data survey tidak valid.')
  const b = body as Record<string, unknown>

  const parentPhone = requiredText(b.parentPhone, 'Nomor WhatsApp', 20)
  if (!/^\+?[0-9][0-9 -]{7,18}$/.test(parentPhone)) fail('Nomor WhatsApp tidak valid.')

  let parentEmail: string | null = null
  if (typeof b.parentEmail === 'string' && b.parentEmail.trim()) {
    parentEmail = b.parentEmail.trim()
    if (parentEmail.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail)) fail('Email tidak valid.')
  }

  if (typeof b.childBirthDate !== 'string') fail('Tanggal lahir anak wajib diisi.')
  const childBirthDate = new Date(b.childBirthDate)
  if (Number.isNaN(childBirthDate.getTime()) || childBirthDate > new Date()) fail('Tanggal lahir anak tidak valid.')

  if (b.childGender !== 'L' && b.childGender !== 'P') fail('Jenis kelamin anak tidak valid.')

  if (!Array.isArray(b.naturalResponses) || b.naturalResponses.length === 0) fail('Respon alami anak wajib diisi.')
  if (b.naturalResponses.length > MAX_RESPONSES) fail('Terlalu banyak respon alami.')
  const naturalResponses = b.naturalResponses.map((r) => {
    if (typeof r !== 'string' || !r.trim() || r.length > MAX_RESPONSE_LENGTH) fail('Respon alami tidak valid.')
    return r.trim()
  })

  // Rahasianya adalah KODE voucher/sekolah, bukan id berurutan — id saja bisa ditebak.
  const voucherCode = requiredText(b.voucherCode, 'Kode voucher', 50).toUpperCase()
  const schoolId = optionalId(b.schoolId, 'Sekolah')
  const schoolCode = typeof b.schoolCode === 'string' && b.schoolCode.trim() ? b.schoolCode.trim().toUpperCase() : null
  if (schoolId !== null && schoolCode === null) fail('Kode sekolah wajib diisi.')

  return {
    parentName: requiredText(b.parentName, 'Nama orang tua'),
    parentPhone,
    parentEmail,
    childName: requiredText(b.childName, 'Nama anak'),
    childBirthDate,
    childGender: b.childGender,
    naturalResponses,
    voucherCode,
    schoolId,
    schoolCode,
    schoolClassId: optionalId(b.schoolClassId, 'Kelas'),
    schoolConsent: b.schoolConsent === true,
  }
}
