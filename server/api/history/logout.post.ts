export default defineEventHandler(async (event) => {
  deleteCookie(event, 'history_session', { path: '/' })
  return { ok: true }
})
