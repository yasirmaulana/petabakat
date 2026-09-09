export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/sekolah/dashboard')) return
  try {
    await $fetch('/api/sekolah/auth/me')
  } catch {
    return navigateTo('/sekolah/login')
  }
})
