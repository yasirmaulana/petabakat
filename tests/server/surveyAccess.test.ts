import { beforeEach, describe, expect, it, vi } from 'vitest'

const findPartner = vi.hoisted(() => vi.fn())
vi.mock('../../server/utils/prisma', () => ({ prisma: { partner: { findUnique: findPartner } } }))

import { signHistoryToken, signMitraToken, signSurveyToken } from '../../server/utils/auth'
import { signOwnerToken } from '../../server/utils/ownerAuth'
import { signSchoolToken } from '../../server/utils/schoolAuth'
import {
  canViewSurvey,
  isSurveyOwner,
  requireSurveyOwner,
  requireSurveyView,
  type SurveyAccessInfo,
} from '../../server/utils/surveyAccess'
import { mockEvent } from '../helpers'

const survey: SurveyAccessInfo = {
  publicId: 'survey-1',
  parent: { phone: '08111' },
  voucher: { partnerId: 10 },
  schoolStudent: { consentGiven: true, schoolClass: { schoolId: 20 } },
}

const cookie = (name: string, value: string) => mockEvent({ cookie: `${name}=${value}` })
const bearer = (token: string) => mockEvent({ authorization: `Bearer ${token}` })

beforeEach(() => {
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.ADMIN_SECRET = 'admin-secret'
  delete process.env.DEMO_RESULT_ID
  findPartner.mockReset().mockResolvedValue({ status: 'active' })
})

describe('isSurveyOwner', () => {
  it('true untuk history_session dengan nomor pemilik', async () => {
    expect(await isSurveyOwner(cookie('history_session', await signHistoryToken('08111')), survey)).toBe(true)
  })

  it('false untuk history_session nomor lain', async () => {
    expect(await isSurveyOwner(cookie('history_session', await signHistoryToken('08999')), survey)).toBe(false)
  })

  it('true bila survey ini ada di survey_session (beberapa survey per browser)', async () => {
    expect(await isSurveyOwner(cookie('survey_session', await signSurveyToken(['survey-lama', 'survey-1'])), survey)).toBe(true)
    expect(await isSurveyOwner(cookie('survey_session', await signSurveyToken(['survey-lain'])), survey)).toBe(false)
  })

  it('false tanpa cookie atau cookie rusak; token mitra/owner tidak dihitung sebagai pemilik', async () => {
    expect(await isSurveyOwner(mockEvent(), survey)).toBe(false)
    expect(await isSurveyOwner(cookie('history_session', 'rusak'), survey)).toBe(false)
    expect(await isSurveyOwner(cookie('owner_session', await signOwnerToken()), survey)).toBe(false)
  })
})

describe('canViewSurvey', () => {
  it('owner boleh melihat semua survey', async () => {
    expect(await canViewSurvey(cookie('owner_session', await signOwnerToken()), survey)).toBe(true)
  })

  it('mitra hanya boleh melihat survey dari vouchernya sendiri', async () => {
    expect(await canViewSurvey(bearer(await signMitraToken(10, 'affiliate')), survey)).toBe(true)
    expect(await canViewSurvey(bearer(await signMitraToken(11, 'affiliate')), survey)).toBe(false)
  })

  it('mitra yang disuspend ditolak', async () => {
    findPartner.mockResolvedValue({ status: 'suspended' })
    expect(await canViewSurvey(bearer(await signMitraToken(10, 'affiliate')), survey)).toBe(false)
  })

  it('sekolah hanya boleh melihat siswanya sendiri yang memberi consent', async () => {
    expect(await canViewSurvey(bearer(await signSchoolToken(1, 20, 'admin')), survey)).toBe(true)
    expect(await canViewSurvey(bearer(await signSchoolToken(1, 21, 'admin')), survey)).toBe(false)
    const noConsent = { ...survey, schoolStudent: { consentGiven: false, schoolClass: { schoolId: 20 } } }
    expect(await canViewSurvey(bearer(await signSchoolToken(1, 20, 'admin')), noConsent)).toBe(false)
  })

  it('survey tanpa voucher/sekolah tidak bisa dibuka mitra/sekolah mana pun', async () => {
    const bare = { publicId: 'x', parent: { phone: '1' }, voucher: null, schoolStudent: null }
    expect(await canViewSurvey(bearer(await signMitraToken(10, 'affiliate')), bare)).toBe(false)
    expect(await canViewSurvey(bearer(await signSchoolToken(1, 20, 'admin')), bare)).toBe(false)
  })

  it('survey demo terbuka untuk publik', async () => {
    process.env.DEMO_RESULT_ID = 'survey-1'
    expect(await canViewSurvey(mockEvent(), survey)).toBe(true)
  })

  it('anonim ditolak', async () => {
    expect(await canViewSurvey(mockEvent(), survey)).toBe(false)
  })
})

describe('require*', () => {
  it('melempar 403 bila tidak berhak', async () => {
    await expect(requireSurveyView(mockEvent(), survey)).rejects.toMatchObject({ statusCode: 403 })
    await expect(requireSurveyOwner(cookie('owner_session', await signOwnerToken()), survey)).rejects.toMatchObject({ statusCode: 403 })
  })

  it('lolos bila berhak', async () => {
    await expect(requireSurveyOwner(cookie('survey_session', await signSurveyToken(['survey-lama', 'survey-1'])), survey)).resolves.toBeUndefined()
  })
})
