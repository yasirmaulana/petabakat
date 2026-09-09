<template>
  <div class="min-h-screen bg-gray-25 font-body">
    <header class="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <NuxtLink to="/sekolah" class="text-sm font-semibold text-gray-900 hover:text-gray-600">← Dashboard Sekolah</NuxtLink>
    </header>

    <main class="mx-auto max-w-lg px-4 py-10">
      <div class="mb-6">
        <h1 class="text-2xl font-bold text-gray-950">Daftarkan Sekolah</h1>
        <p class="mt-1 text-sm text-gray-500">Admin akan menghubungi dalam 1–2 hari kerja untuk aktivasi dan pemilihan paket.</p>
      </div>

      <div v-if="submitted" class="card p-6 text-center space-y-3">
        <div class="text-4xl">🏫</div>
        <h2 class="font-bold text-gray-950">Pendaftaran Terkirim!</h2>
        <p class="text-sm text-gray-500">Admin akan menghubungi melalui WhatsApp dalam 1–2 hari kerja untuk aktivasi dan setup dashboard.</p>
        <NuxtLink to="/sekolah" class="btn-secondary inline-block px-4 py-2 text-sm mt-2">Kembali</NuxtLink>
      </div>

      <form v-else @submit.prevent="submit" class="space-y-4">
        <div class="card p-5 space-y-4">
          <div>
            <label class="label-text">Nama Sekolah</label>
            <input v-model="form.name" required placeholder="Contoh: SDIT Al-Fatih Jakarta" class="input-field" />
          </div>
          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <label class="label-text">NPSN <span class="font-normal text-gray-400">(opsional)</span></label>
              <input v-model="form.npsn" placeholder="12345678" class="input-field" maxlength="8" />
            </div>
            <div>
              <label class="label-text">Kota</label>
              <input v-model="form.city" placeholder="Jakarta" class="input-field" />
            </div>
          </div>
          <div>
            <label class="label-text">Estimasi Jumlah Siswa</label>
            <select v-model="form.estimatedStudents" class="input-field">
              <option value="">Pilih estimasi</option>
              <option value="< 30">Kurang dari 30</option>
              <option value="30–100">30–100 siswa</option>
              <option value="100–300">100–300 siswa</option>
              <option value="> 300">Lebih dari 300</option>
            </select>
          </div>
        </div>

        <div class="card p-5 space-y-4">
          <p class="text-sm font-semibold text-gray-900">Kontak Admin Sekolah</p>
          <div>
            <label class="label-text">Email</label>
            <input v-model="form.adminEmail" type="email" required placeholder="admin@sekolah.sch.id" class="input-field" />
          </div>
          <div>
            <label class="label-text">Nomor WhatsApp</label>
            <input v-model="form.adminPhone" type="tel" required placeholder="0812xxxxxxxx" class="input-field" />
          </div>
        </div>

        <p v-if="error" class="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{{ error }}</p>

        <button type="submit" :disabled="loading" class="btn-primary w-full py-3 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ loading ? 'Mengirim...' : 'Kirim Pendaftaran' }}
        </button>
      </form>
    </main>
  </div>
</template>

<script setup>
useSeoMeta({ title: 'Daftar Sekolah — PetaMinatBakat' })

const form = reactive({ name: '', npsn: '', city: '', estimatedStudents: '', adminEmail: '', adminPhone: '' })
const loading = ref(false)
const submitted = ref(false)
const error = ref('')

async function submit() {
  loading.value = true
  error.value = ''
  try {
    await $fetch('/api/sekolah/daftar', { method: 'POST', body: form })
    submitted.value = true
  } catch (err) {
    error.value = err?.data?.message || 'Gagal mengirim pendaftaran.'
  } finally {
    loading.value = false
  }
}
</script>
