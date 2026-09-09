<template>
  <div class="min-h-screen bg-gray-25 font-body">
    <header class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <NuxtLink to="/mitra" class="text-sm font-semibold text-gray-900 hover:text-gray-600">← Program Kemitraan</NuxtLink>
    </header>

    <main class="mx-auto max-w-lg px-4 py-10">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-950">Daftar Jadi Mitra</h1>
        <p class="mt-1 text-sm text-gray-500">Admin akan menghubungi kamu dalam 1–2 hari kerja setelah pendaftaran.</p>
      </div>

      <div v-if="submitted" class="card p-6 text-center space-y-3">
        <div class="text-4xl">🎉</div>
        <h2 class="font-bold text-gray-950">Pendaftaran Terkirim!</h2>
        <p class="text-sm text-gray-500">Admin akan menghubungi kamu melalui WhatsApp dalam 1–2 hari kerja untuk aktivasi akun.</p>
        <NuxtLink to="/mitra" class="btn-secondary inline-block px-4 py-2 text-sm mt-2">Kembali</NuxtLink>
      </div>

      <form v-else @submit.prevent="submit" class="space-y-4">
        <!-- Jenis mitra -->
        <div class="card p-5 space-y-3">
          <label class="label-text block">Jenis Mitra</label>
          <div class="grid grid-cols-2 gap-3">
            <label
              class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors"
              :class="form.type === 'institutional' ? 'border-brand-400 bg-brand-50' : 'border-gray-200 hover:border-brand-200'"
            >
              <input v-model="form.type" type="radio" value="institutional" class="sr-only" />
              <span class="text-2xl">🏫</span>
              <span class="text-sm font-semibold text-gray-900">Institusi</span>
              <span class="text-xs text-gray-500">Bimbel / Lembaga</span>
            </label>
            <label
              class="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-colors"
              :class="form.type === 'affiliate' ? 'border-amber-400 bg-amber-50' : 'border-gray-200 hover:border-amber-200'"
            >
              <input v-model="form.type" type="radio" value="affiliate" class="sr-only" />
              <span class="text-2xl">👤</span>
              <span class="text-sm font-semibold text-gray-900">Personal</span>
              <span class="text-xs text-gray-500">Guru / Affiliate</span>
            </label>
          </div>
        </div>

        <div class="card p-5 space-y-4">
          <div>
            <label class="label-text">Nama Lengkap</label>
            <input v-model="form.name" required placeholder="Nama kamu" class="input-field" />
          </div>
          <div v-if="form.type === 'institutional'">
            <label class="label-text">Nama Institusi / Bimbel</label>
            <input v-model="form.institution" placeholder="Contoh: Bimbel Al-Fatih" class="input-field" />
          </div>
          <div>
            <label class="label-text">Email</label>
            <input v-model="form.email" type="email" required placeholder="email@contoh.com" class="input-field" />
          </div>
          <div>
            <label class="label-text">Nomor WhatsApp</label>
            <input v-model="form.phone" type="tel" required placeholder="0812xxxxxxxx" class="input-field" />
          </div>
        </div>

        <!-- Info sesuai tipe -->
        <div v-if="form.type" class="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
          <template v-if="form.type === 'institutional'">
            Setelah diapprove, kamu bisa beli kredit laporan (min. 10 kredit) dengan harga <strong>Rp 65.000/laporan</strong> dan generate kode voucher untuk klien kamu.
          </template>
          <template v-else>
            Setelah diapprove, kamu dapat kode referral unik. Tiap orang yang beli via kode kamu, kamu dapat komisi <strong>Rp 20.000</strong>.
          </template>
        </div>

        <p v-if="error" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
          <svg v-if="loading" class="inline h-4 w-4 animate-spin mr-2" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          {{ loading ? 'Mengirim...' : 'Kirim Pendaftaran' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
useSeoMeta({ title: 'Daftar Mitra — PetaMinatBakat' })

const route = useRoute()
const form = reactive({ name: '', institution: '', type: route.query.type || 'institutional', email: '', phone: '' })
const loading = ref(false)
const submitted = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/mitra/daftar', { method: 'POST', body: form })
    submitted.value = true
  } catch (err) {
    error.value = err?.data?.message || err?.message || 'Gagal mengirim pendaftaran. Coba lagi.'
  } finally {
    loading.value = false
  }
}
</script>
