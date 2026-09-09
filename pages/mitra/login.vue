<template>
  <div class="min-h-screen bg-gray-25 font-body flex items-center justify-center px-4">
    <div class="w-full max-w-sm">
      <div class="mb-6 text-center">
        <NuxtLink to="/" class="text-sm font-semibold text-gray-900 hover:text-gray-600">PetaMinatBakat</NuxtLink>
        <h1 class="mt-4 text-2xl font-bold text-gray-950">Login Mitra</h1>
        <p class="mt-1 text-sm text-gray-500">Masuk ke dashboard mitra kamu</p>
      </div>

      <form @submit.prevent="submit" class="card p-6 space-y-4">
        <div>
          <label class="label-text">Email</label>
          <input v-model="form.email" type="email" required placeholder="email@contoh.com" class="input-field" />
        </div>
        <div>
          <label class="label-text">Password</label>
          <input v-model="form.password" type="password" required placeholder="••••••••" class="input-field" />
        </div>

        <p v-if="error" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Masuk...' : 'Masuk' }}
        </button>
      </form>

      <p class="mt-4 text-center text-xs text-gray-400">
        Belum punya akun mitra? <NuxtLink to="/mitra/daftar" class="text-brand-600 hover:underline">Daftar di sini</NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
useSeoMeta({ title: 'Login Mitra — PetaMinatBakat' })

const router = useRouter()
const form = reactive({ email: '', password: '' })
const loading = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/mitra/auth/login', { method: 'POST', body: form })
    await router.push('/mitra/dashboard')
  } catch (err) {
    error.value = err?.data?.message || err?.message || 'Login gagal. Periksa email dan password.'
  } finally {
    loading.value = false
  }
}
</script>
