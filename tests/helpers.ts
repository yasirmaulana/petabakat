import type { H3Event } from 'h3'

/** Event H3 minimal: cukup untuk getHeader/getCookie/getRequestHeader (h3 v1) dan readBody (stub di setup). */
export function mockEvent(
  headers: Record<string, string> = {},
  remoteAddress = '127.0.0.1',
  body?: unknown,
): H3Event {
  return { node: { req: { headers, socket: { remoteAddress } } }, _body: body } as unknown as H3Event
}
