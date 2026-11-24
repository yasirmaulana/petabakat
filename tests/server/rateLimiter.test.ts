import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkRateLimit } from '../../server/utils/rateLimiter'
import { mockEvent } from '../helpers'

afterEach(() => vi.useRealTimers())

describe('checkRateLimit', () => {
  it('mengizinkan sampai max lalu melempar 429', () => {
    const event = mockEvent({}, '10.0.0.1')
    const opts = { max: 2, windowMs: 60_000, keyPrefix: 'max-test' }
    checkRateLimit(event, opts)
    checkRateLimit(event, opts)
    expect(() => checkRateLimit(event, opts)).toThrow(expect.objectContaining({ statusCode: 429 }))
  })

  it('reset setelah window berakhir', () => {
    vi.useFakeTimers()
    const event = mockEvent({}, '10.0.0.2')
    const opts = { max: 1, windowMs: 1000, keyPrefix: 'window-test' }
    checkRateLimit(event, opts)
    expect(() => checkRateLimit(event, opts)).toThrow()
    vi.advanceTimersByTime(1001)
    expect(() => checkRateLimit(event, opts)).not.toThrow()
  })

  it('memakai IP pertama dari x-forwarded-for dan memisahkan per IP', () => {
    const opts = { max: 1, windowMs: 60_000, keyPrefix: 'xff-test' }
    checkRateLimit(mockEvent({ 'x-forwarded-for': '1.1.1.1, 9.9.9.9' }), opts)
    expect(() => checkRateLimit(mockEvent({ 'x-forwarded-for': '1.1.1.1' }), opts)).toThrow()
    expect(() => checkRateLimit(mockEvent({ 'x-forwarded-for': '2.2.2.2' }), opts)).not.toThrow()
  })

  it('keyPrefix berbeda punya kuota terpisah', () => {
    const event = mockEvent({}, '10.0.0.3')
    checkRateLimit(event, { max: 1, windowMs: 60_000, keyPrefix: 'a' })
    expect(() => checkRateLimit(event, { max: 1, windowMs: 60_000, keyPrefix: 'b' })).not.toThrow()
  })
})
