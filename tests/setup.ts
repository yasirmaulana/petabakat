// Unit test berjalan tanpa Nuxt, jadi auto-import Nuxt/Nitro yang dipakai
// oleh server/utils, server/api, dan composables disediakan dari paket aslinya.
import { createError, getCookie, getHeader, getRequestHeader } from 'h3'
import { vi } from 'vitest'
import { readonly, ref } from 'vue'

Object.assign(globalThis, {
  createError,
  getCookie,
  getHeader,
  getRequestHeader,
  readonly,
  ref,
  // Handler diuji langsung sebagai fungsi; body request dibaca dari mockEvent(..., { body }).
  defineEventHandler: <T>(handler: T) => handler,
  readBody: async (event: { _body?: unknown }) => event._body,
  setCookie: vi.fn(),
  useRuntimeConfig: () => ({ whatsappApiUrl: 'https://wa.test/send', whatsappFonnteToken: 'token' }),
  $fetch: vi.fn(async () => ({})),
})
