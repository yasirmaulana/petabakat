import { SignJWT } from 'jose'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
const findPartner = vi.hoisted(() => vi.fn())
vi.mock('../../server/utils/prisma', () => ({ prisma: { partner: { findUnique: findPartner } } }))

import {
  getMitraTokenFromEvent,
  hashPassword,
  requireMitraAuth,
  signHistoryToken,
  signMitraToken,
  signSurveyToken,
  verifyHistoryToken,
  verifySurveyToken,
  verifyMitraToken,
  verifyPassword,
} from '../../server/utils/auth'
import { requireAdmin } from '../../server/utils/adminAuth'
import {
  requireOwnerSession,
  signOwnerToken,
  verifyAdminPassword,
  verifyOwnerToken,
} from '../../server/utils/ownerAuth'
import { requireSchoolAuth, signSchoolToken, verifySchoolToken } from '../../server/utils/schoolAuth'
import { mockEvent } from '../helpers'

const ENV_KEYS = ['JWT_SECRET', 'MITRA_JWT_SECRET', 'HISTORY_JWT_SECRET', 'SURVEY_JWT_SECRET', 'SCHOOL_JWT_SECRET', 'ADMIN_SECRET']
let savedEnv: Record<string, string | undefined>

beforeEach(() => {
  savedEnv = Object.fromEntries(ENV_KEYS.map((k) => [k, process.env[k]]))
  for (const k of ENV_KEYS) delete process.env[k]
  process.env.JWT_SECRET = 'test-jwt-secret'
  process.env.ADMIN_SECRET = 'admin-secret'
  findPartner.mockReset().mockResolvedValue({ status: 'active' })
})

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k]
    else process.env[k] = savedEnv[k]
  }
})

describe('password', () => {
  it('hash bisa diverifikasi dan menolak password salah', async () => {
    const hash = await hashPassword('rahasia123')
    expect(hash).not.toBe('rahasia123')
    expect(await verifyPassword('rahasia123', hash)).toBe(true)
    expect(await verifyPassword('salah', hash)).toBe(false)
  })
})

describe('mitra token', () => {
  it('round-trip sign/verify', async () => {
    const token = await signMitraToken(42, 'affiliate')
    expect(await verifyMitraToken(token)).toEqual({ partnerId: 42, type: 'affiliate' })
  })

  it('memakai MITRA_JWT_SECRET bila ada; token dengan secret lain ditolak', async () => {
    const token = await signMitraToken(1, 'reseller') // ditandatangani dengan JWT_SECRET
    process.env.MITRA_JWT_SECRET = 'mitra-only'
    await expect(verifyMitraToken(token)).rejects.toThrow()
  })

  it('menolak token dengan audience lain', async () => {
    const historyToken = await signHistoryToken('08123')
    await expect(verifyMitraToken(historyToken)).rejects.toThrow()
  })

  it('menolak token kedaluwarsa', async () => {
    const expired = await new SignJWT({ sub: '1', type: 'x', aud: 'mitra' })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime(Math.floor(Date.now() / 1000) - 60)
      .sign(new TextEncoder().encode('test-jwt-secret'))
    await expect(verifyMitraToken(expired)).rejects.toThrow()
  })

  it('error jelas bila secret tidak dikonfigurasi', async () => {
    delete process.env.JWT_SECRET
    await expect(signMitraToken(1, 'x')).rejects.toThrow('MITRA_JWT_SECRET env var not set')
  })

  it('mengambil token dari cookie lebih dulu, lalu header Bearer', () => {
    expect(getMitraTokenFromEvent(mockEvent({ cookie: 'mitra_token=abc', authorization: 'Bearer xyz' }))).toBe('abc')
    expect(getMitraTokenFromEvent(mockEvent({ authorization: 'Bearer xyz' }))).toBe('xyz')
    expect(getMitraTokenFromEvent(mockEvent({ authorization: 'Basic xyz' }))).toBeNull()
  })

  it('requireMitraAuth: 401 tanpa token atau token tidak valid', async () => {
    await expect(requireMitraAuth(mockEvent())).rejects.toMatchObject({ statusCode: 401 })
    await expect(requireMitraAuth(mockEvent({ authorization: 'Bearer rusak' }))).rejects.toMatchObject({ statusCode: 401 })
    const token = await signMitraToken(7, 'affiliate')
    await expect(requireMitraAuth(mockEvent({ authorization: `Bearer ${token}` }))).resolves.toEqual({ partnerId: 7, type: 'affiliate' })
  })
})

describe('requireMitraAuth: status mitra', () => {
  it('403 bila mitra sudah disuspend walau tokennya masih berlaku', async () => {
    const token = await signMitraToken(7, 'affiliate')
    findPartner.mockResolvedValue({ status: 'suspended' })
    await expect(requireMitraAuth(mockEvent({ authorization: `Bearer ${token}` }))).rejects.toMatchObject({ statusCode: 403 })
  })

  it('403 bila mitra sudah dihapus', async () => {
    const token = await signMitraToken(7, 'affiliate')
    findPartner.mockResolvedValue(null)
    await expect(requireMitraAuth(mockEvent({ authorization: `Bearer ${token}` }))).rejects.toMatchObject({ statusCode: 403 })
  })
})

describe('survey token', () => {
  it('round-trip mengembalikan daftar publicId survey', async () => {
    expect(await verifySurveyToken(await signSurveyToken(['a', 'b']))).toEqual(['a', 'b'])
  })

  it('hanya menyimpan 5 survey terakhir tanpa duplikat', async () => {
    const token = await signSurveyToken(['1', '2', '3', '2', '4', '5', '6'])
    expect(await verifySurveyToken(token)).toEqual(['2', '3', '4', '5', '6'])
  })

  it('tidak bisa dipakai sebagai history token (audience berbeda)', async () => {
    await expect(verifyHistoryToken(await signSurveyToken(['abc-123']))).rejects.toThrow()
  })
})

describe('history token', () => {
  it('round-trip mengembalikan nomor telepon', async () => {
    expect(await verifyHistoryToken(await signHistoryToken('628111'))).toBe('628111')
  })
})

describe('school token', () => {
  it('round-trip sign/verify', async () => {
    const token = await signSchoolToken(3, 9, 'admin')
    expect(await verifySchoolToken(token)).toEqual({ userId: 3, schoolId: 9, role: 'admin' })
  })

  it('requireSchoolAuth membaca cookie school_token', async () => {
    const token = await signSchoolToken(3, 9, 'guru')
    await expect(requireSchoolAuth(mockEvent({ cookie: `school_token=${token}` }))).resolves.toMatchObject({ schoolId: 9 })
    await expect(requireSchoolAuth(mockEvent())).rejects.toMatchObject({ statusCode: 401 })
  })

  it('token mitra tidak berlaku sebagai token sekolah', async () => {
    await expect(verifySchoolToken(await signMitraToken(1, 'x'))).rejects.toThrow()
  })
})

describe('owner session', () => {
  it('round-trip dan requireOwnerSession via cookie', async () => {
    const token = await signOwnerToken()
    await expect(verifyOwnerToken(token)).resolves.toBeUndefined()
    await expect(requireOwnerSession(mockEvent({ cookie: `owner_session=${token}` }))).resolves.toBeUndefined()
  })

  it('requireOwnerSession: 401 tanpa cookie atau cookie tidak valid', async () => {
    expect(() => requireOwnerSession(mockEvent())).toThrow(expect.objectContaining({ statusCode: 401 }))
    await expect(requireOwnerSession(mockEvent({ cookie: 'owner_session=rusak' }))).rejects.toMatchObject({ statusCode: 401 })
  })

  it('verifyAdminPassword hanya menerima secret yang persis sama', () => {
    expect(verifyAdminPassword('admin-secret')).toBe(true)
    expect(verifyAdminPassword('admin-secreT')).toBe(false)
    expect(verifyAdminPassword('admin')).toBe(false)
    expect(verifyAdminPassword('admin-secret-extra')).toBe(false)
    expect(verifyAdminPassword('')).toBe(false)
  })

  it('verifyAdminPassword false bila ADMIN_SECRET tidak di-set', () => {
    delete process.env.ADMIN_SECRET
    expect(verifyAdminPassword('')).toBe(false)
  })
})

describe('requireAdmin', () => {
  it('lolos dengan Bearer secret yang benar', () => {
    expect(() => requireAdmin(mockEvent({ authorization: 'Bearer admin-secret' }))).not.toThrow()
  })

  it('401 untuk header salah, lebih pendek, lebih panjang, atau kosong', () => {
    for (const authorization of ['Bearer wrong-secret', 'Bearer admin', 'Bearer admin-secret!', '']) {
      expect(() => requireAdmin(mockEvent({ authorization }))).toThrow(expect.objectContaining({ statusCode: 401 }))
    }
  })

  it('500 bila ADMIN_SECRET tidak di-set', () => {
    delete process.env.ADMIN_SECRET
    expect(() => requireAdmin(mockEvent({ authorization: 'Bearer x' }))).toThrow(expect.objectContaining({ statusCode: 500 }))
  })
})
