export default defineEventHandler((event) => {
  deleteCookie(event, 'owner_session', { path: '/' })
  return { ok: true }
})
