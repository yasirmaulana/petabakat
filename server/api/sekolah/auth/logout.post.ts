export default defineEventHandler((event) => {
  deleteCookie(event, 'school_token', { path: '/' })
  return { ok: true }
})
