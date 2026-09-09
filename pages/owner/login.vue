<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">
      <div class="mb-8 text-center">
        <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-400">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h1 class="text-xl font-bold text-gray-900">Owner Dashboard</h1>
        <p class="mt-1 text-sm text-gray-500">PetaMinatBakat</p>
      </div>

      <div class="card p-6">
        <form @submit.prevent="submit">
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1.5 block w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30"
            placeholder="Admin password"
          />

          <p v-if="error" class="mt-2 text-sm text-red-600">{{ error }}</p>

          <button type="submit" :disabled="loading"
            class="btn-primary mt-4 w-full justify-center">
            <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>{{ loading ? 'Masuk...' : 'Masuk' }}</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: [] })

useSeoMeta({ title: 'Owner Login — PetaMinatBakat', robots: 'noindex' })

const password = ref('')
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/owner/login', { method: 'POST', body: { password: password.value } })
    await navigateTo('/owner/dashboard')
  } catch (e: unknown) {
    error.value = (e as { data?: { message?: string } })?.data?.message ?? 'Terjadi kesalahan.'
  } finally {
    loading.value = false
  }
}
</script>
