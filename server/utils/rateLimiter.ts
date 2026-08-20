import type { H3Event } from 'h3'

interface Window {
  count: number
  resetAt: number
}

const windows = new Map<string, Window>()

export interface RateLimitOptions {
  max: number
  windowMs: number
  keyPrefix?: string
}

function getClientIp(event: H3Event): string {
  const forwarded = getRequestHeader(event, 'x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return event.node.req.socket.remoteAddress || 'unknown'
}

export function checkRateLimit(event: H3Event, options: RateLimitOptions): void {
  const key = `${options.keyPrefix || 'rl'}:${getClientIp(event)}`
  const now = Date.now()

  let window = windows.get(key)
  if (!window || now > window.resetAt) {
    window = { count: 0, resetAt: now + options.windowMs }
    windows.set(key, window)
  }

  window.count++

  if (window.count > options.max) {
    throw createError({
      statusCode: 429,
      statusMessage: 'Too many requests, please try again later.',
    })
  }
}

// ponytail: this in-memory store resets when the server restarts and is not shared
// across instances. For multi-instance / multi-region deploys, replace with Redis or Upstash.
