export default defineEventHandler((event) => {
  deleteCookie(event, 'mitra_token', { path: '/' })
  return { ok: true }
})
