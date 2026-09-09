export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/owner') || to.path === '/owner/login') return

  // Hanya jalankan di client — cookie httpOnly tidak tersedia saat SSR
  if (import.meta.server) return

  try {
    await $fetch('/api/owner/me')
  } catch {
    return navigateTo('/owner/login')
  }
})
