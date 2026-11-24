import { beforeEach, describe, expect, it, vi } from 'vitest'

const db = vi.hoisted(() => ({
  otpCode: { findFirst: vi.fn(), updateMany: vi.fn(), deleteMany: vi.fn(), create: vi.fn() },
  parent: { findUnique: vi.fn() },
}))
vi.mock('~/server/utils/prisma', () => ({ prisma: db }))
vi.mock('~/server/utils/rateLimiter', () => ({ checkRateLimit: vi.fn() }))

import sendOtp from '../../server/api/otp/send.post'
import verifyOtp from '../../server/api/otp/verify.post'
import { mockEvent } from '../helpers'

type Handler = (event: ReturnType<typeof mockEvent>) => Promise<unknown>
const send = (body: unknown) => (sendOtp as unknown as Handler)(mockEvent({}, '1.1.1.1', body))
const verify = (body: unknown) => (verifyOtp as unknown as Handler)(mockEvent({}, '1.1.1.1', body))

const future = () => new Date(Date.now() + 60_000)

beforeEach(() => {
  process.env.JWT_SECRET = 'test-jwt-secret'
  for (const group of Object.values(db)) for (const fn of Object.values(group)) fn.mockReset()
  vi.mocked(globalThis.$fetch).mockClear()
})

describe('POST /api/otp/verify', () => {
  it('kode benar: dicatat sebagai percobaan, dipakai, lalu sesi dibuat', async () => {
    db.otpCode.findFirst.mockResolvedValue({ id: 1, code: '123456', expiresAt: future() })
    db.otpCode.updateMany.mockResolvedValue({ count: 1 })
    db.parent.findUnique.mockResolvedValue({ name: 'Budi', phone: '0811', surveys: [] })

    await expect(verify({ phone: ' 0811 ', code: '123456' })).resolves.toMatchObject({ found: true })
    expect(db.otpCode.updateMany).toHaveBeenNthCalledWith(1, expect.objectContaining({
      where: { id: 1, used: false, attempts: { lt: 5 } },
    }))
    expect(db.otpCode.updateMany).toHaveBeenNthCalledWith(2, { where: { id: 1, used: false }, data: { used: true } })
    expect(globalThis.setCookie).toHaveBeenCalledWith(expect.anything(), 'history_session', expect.any(String), expect.anything())
  })

  it('kode salah: 401 dan kode tidak ditandai terpakai', async () => {
    db.otpCode.findFirst.mockResolvedValue({ id: 1, code: '123456', expiresAt: future() })
    db.otpCode.updateMany.mockResolvedValue({ count: 1 })
    await expect(verify({ phone: '0811', code: '000000' })).rejects.toMatchObject({ statusCode: 401 })
    expect(db.otpCode.updateMany).toHaveBeenCalledTimes(1)
  })

  it('setelah batas percobaan habis: 429 walau kodenya benar (anti brute-force)', async () => {
    db.otpCode.findFirst.mockResolvedValue({ id: 1, code: '123456', expiresAt: future() })
    db.otpCode.updateMany.mockResolvedValue({ count: 0 })
    await expect(verify({ phone: '0811', code: '123456' })).rejects.toMatchObject({ statusCode: 429 })
    expect(db.parent.findUnique).not.toHaveBeenCalled()
  })

  it('kode kedaluwarsa atau tidak ada: 401', async () => {
    db.otpCode.findFirst.mockResolvedValue({ id: 1, code: '123456', expiresAt: new Date(Date.now() - 1) })
    await expect(verify({ phone: '0811', code: '123456' })).rejects.toMatchObject({ statusCode: 401 })
    db.otpCode.findFirst.mockResolvedValue(null)
    await expect(verify({ phone: '0811', code: '123456' })).rejects.toMatchObject({ statusCode: 401 })
  })

  it('input bukan string: 400', async () => {
    await expect(verify({ phone: 811, code: ['1'] })).rejects.toMatchObject({ statusCode: 400 })
  })
})

describe('POST /api/otp/send', () => {
  it('nomor tidak terdaftar: respons sama dengan sukses dan tidak mengirim WA (anti enumerasi)', async () => {
    db.parent.findUnique.mockResolvedValue(null)
    await expect(send({ phone: '0899' })).resolves.toEqual({ sent: true })
    expect(db.otpCode.create).not.toHaveBeenCalled()
    expect(globalThis.$fetch).not.toHaveBeenCalled()
  })

  it('cooldown 1 menit per nomor: 429', async () => {
    db.parent.findUnique.mockResolvedValue({ id: 1 })
    db.otpCode.findFirst.mockResolvedValue({ createdAt: new Date(Date.now() - 10_000) })
    await expect(send({ phone: '0811' })).rejects.toMatchObject({ statusCode: 429 })
    expect(db.otpCode.create).not.toHaveBeenCalled()
  })

  it('nomor terdaftar: membuat kode 6 digit dan mengirim WA', async () => {
    db.parent.findUnique.mockResolvedValue({ id: 1 })
    db.otpCode.findFirst.mockResolvedValue(null)
    await expect(send({ phone: ' 0811 ' })).resolves.toEqual({ sent: true })
    const { data } = db.otpCode.create.mock.calls[0][0]
    expect(data.phone).toBe('0811')
    expect(data.code).toMatch(/^\d{6}$/)
    expect(globalThis.$fetch).toHaveBeenCalledOnce()
  })
})
