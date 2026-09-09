// Dijalankan di client-side sebelum render halaman /mitra/dashboard
export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/mitra/dashboard')) return

  try {
    await $fetch('/api/mitra/auth/me')
  } catch {
    return navigateTo('/mitra/login')
  }
})
