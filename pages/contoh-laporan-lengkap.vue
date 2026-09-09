<template>
  <div class="min-h-screen bg-gray-25 font-body">

    <!-- Header -->
    <header class="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <NuxtLink to="/" class="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Beranda
      </NuxtLink>
      <NuxtLink to="/survey" class="btn-primary px-4 py-2 text-sm">Mulai Survey Saya</NuxtLink>
    </header>

    <!-- Banner demo -->
    <div class="border-b border-amber-200 bg-amber-50 px-6 py-3 text-center">
      <p class="text-xs text-amber-700">
        ✨ Ini adalah <strong>contoh laporan nyata</strong> dari salah satu pengguna PetaMinatBakat.
        <NuxtLink to="/survey" class="ml-1 font-semibold underline underline-offset-2 hover:text-amber-900">Buat laporan anak kamu →</NuxtLink>
      </p>
    </div>

    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6">

      <div v-if="pending" class="flex flex-col items-center gap-4 py-24 text-center">
        <svg class="h-8 w-8 animate-spin text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm text-gray-500">Memuat contoh laporan...</p>
      </div>

      <template v-else-if="result">

        <!-- Persona Banner -->
        <div class="mb-6 overflow-hidden rounded-2xl border border-brand-200 bg-brand-50">
          <div class="px-6 py-6 sm:flex sm:items-start sm:gap-6">
            <div class="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-400 text-2xl sm:mb-0">
              🌟
            </div>
            <div class="flex-1">
              <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">Persona Potensi Anak</p>
              <h1 class="text-2xl font-bold text-gray-950 sm:text-3xl">{{ result.personaLabel }}</h1>
              <div v-if="karakterMenonjol.length" class="mt-2 flex flex-wrap gap-1.5">
                <span v-for="k in karakterMenonjol" :key="k"
                  class="inline-flex items-center rounded-full bg-brand-400/20 px-2.5 py-0.5 text-xs font-semibold text-brand-800">{{ k }}</span>
              </div>
              <p class="mt-2 text-sm leading-relaxed text-gray-600">{{ result.personaDescription }}</p>
            </div>
          </div>
        </div>

        <!-- Kekuatan Utama -->
        <div v-if="kekuatanUtama.length" class="mb-6 card p-6">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">Kekuatan Utama</p>
          <h2 class="mb-4 text-base font-bold text-gray-900">
            {{ result.survey?.child?.name || 'Anak' }} memiliki {{ kekuatanUtama.length }} kekuatan utama:
          </h2>
          <ol class="space-y-2">
            <li v-for="(k, i) in kekuatanUtama" :key="i" class="flex items-start gap-3">
              <span class="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-400 text-xs font-bold text-black">{{ i + 1 }}</span>
              <span class="text-sm text-gray-800 leading-relaxed">{{ k }}</span>
            </li>
          </ol>
        </div>

        <!-- Potensi Profesi -->
        <div v-if="potensiProfesi.length" class="mb-6 card p-6">
          <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">Peluang di Dunia Nyata</p>
          <h2 class="mb-4 text-base font-bold text-gray-900">Sehingga memberikan peluang untuk berkembang sebagai:</h2>
          <div class="space-y-3">
            <div v-for="(p, i) in potensiProfesi" :key="i"
              class="flex gap-3 rounded-xl border border-gray-100 bg-gray-25 px-4 py-3.5">
              <span class="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                {{ ['🎯','🔬','💡'][i] || '★' }}
              </span>
              <div>
                <p class="text-sm font-semibold text-gray-900">{{ p.nama }}</p>
                <p class="text-xs leading-relaxed text-gray-500">{{ p.alasan }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Disclaimer -->
        <div class="mb-6 rounded-xl border border-gray-200 bg-gray-50">
          <button type="button" class="flex w-full items-center justify-between px-4 py-3 text-left"
            @click="showDisclaimer = !showDisclaimer">
            <span class="text-xs font-medium text-gray-500">⚠️ Disclaimer — baca sebelum mengambil keputusan</span>
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 shrink-0 text-gray-400 transition-transform"
              :class="{ 'rotate-180': showDisclaimer }" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="showDisclaimer" class="border-t border-gray-200 px-4 py-3">
            <ul class="space-y-1.5 text-xs leading-relaxed text-gray-500">
              <li>• Hasil ini <strong class="text-gray-600">bukan diagnosis profesional</strong> — bukan pengganti asesmen psikolog, dokter anak, atau konselor pendidikan.</li>
              <li>• Analisis dihasilkan oleh <strong class="text-gray-600">AI</strong> berdasarkan framework Nasab &amp; Hasab, bukan oleh pakar bersertifikat.</li>
              <li>• Hasil bersifat <strong class="text-gray-600">indikatif</strong> — gambaran awal, bukan vonis final tentang masa depan anak.</li>
              <li>• Akurasi bergantung pada kejujuran pengisian. Orang tua tetap penentu terbaik dalam mengenali potensi anaknya.</li>
            </ul>
          </div>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">

          <!-- Radar Chart -->
          <div class="card p-6 lg:col-span-2">
            <h2 class="mb-4 text-base font-semibold text-gray-900">Peta Hasab</h2>
            <ClientOnly>
              <apexchart type="radar" height="340" :options="chartOptions" :series="chartSeries" />
              <template #fallback>
                <div class="flex h-64 items-center justify-center text-sm text-gray-400">Memuat grafik...</div>
              </template>
            </ClientOnly>
          </div>

          <!-- Score Cards -->
          <div class="flex flex-col gap-3">
            <div v-for="item in scoreItems" :key="item.code" class="card p-4"
              :class="{ 'border-brand-300 bg-brand-25': item.code === result.dominantHasab }">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ item.icon }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
                </div>
                <span v-if="item.code === result.dominantHasab"
                  class="rounded-full bg-brand-400 px-2 py-0.5 text-xs font-semibold text-black">Dominan</span>
              </div>
              <div class="mt-3 flex items-end gap-2">
                <span class="text-2xl font-bold text-gray-950">{{ result[item.scoreKey] }}</span>
                <span class="mb-0.5 text-sm text-gray-400">/ 25</span>
                <span class="mb-0.5 ml-auto text-sm font-semibold text-brand-600">{{ result[item.pctKey] }}%</span>
              </div>
              <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div class="h-1.5 rounded-full bg-brand-400 transition-all"
                  :style="{ width: `${(result[item.scoreKey] / 25) * 100}%` }" />
              </div>
            </div>
          </div>

        </div>

        <!-- Narasi Skor -->
        <div class="card mt-6 p-6">
          <h2 class="mb-3 text-base font-semibold text-gray-900">Penjelasan Skor</h2>
          <p class="text-sm leading-relaxed text-gray-700">{{ result.scoreNarrative }}</p>
        </div>

        <!-- Micro-Dosing Plan -->
        <div class="card mt-6 p-6">
          <h2 class="mb-4 text-base font-semibold text-gray-900">{{ result.microdosingPlan?.title || 'Rencana Stimulasi Mingguan' }}</h2>
          <div class="space-y-3">
            <div v-for="(item, idx) in result.microdosingPlan?.schedule || []" :key="idx"
              class="rounded-xl border border-gray-100 bg-gray-25 px-4 py-3.5">
              <span class="inline-block rounded-lg bg-brand-400 px-2.5 py-1 text-xs font-semibold text-black">{{ item.day }}</span>
              <p class="mt-2 text-sm font-medium text-gray-800">{{ item.activity }}</p>
              <p class="mt-0.5 text-xs text-gray-400">{{ item.durationMinutes }} menit</p>
            </div>
          </div>
        </div>

        <!-- Catatan Orang Tua -->
        <div class="card mt-6 p-6">
          <h2 class="mb-3 text-base font-semibold text-gray-900">Catatan untuk Orang Tua</h2>
          <p class="text-sm leading-relaxed text-gray-700">{{ result.parentNotes }}</p>
        </div>

        <!-- Rekomendasi Les -->
        <div v-if="lesRecs" class="card mt-6 p-6">
          <h2 class="mb-1 text-base font-semibold text-gray-900">Rekomendasi Aktivitas & Les</h2>
          <p class="mb-5 text-xs text-gray-400">Dipilih AI berdasarkan rumpun dominan, usia, dan minat anak.</p>
          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Jalur Utama</p>
            <div class="space-y-2">
              <div v-for="(les, i) in lesRecs.jalurUtama" :key="i"
                class="flex gap-3 rounded-xl border border-gray-100 bg-gray-25 px-4 py-3">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400 text-xs font-bold text-black">
                  {{ String.fromCharCode(65 + i) }}
                </span>
                <div>
                  <p class="text-sm font-medium text-gray-800">{{ les.nama }}</p>
                  <p class="text-xs leading-relaxed text-gray-500">{{ les.deskripsi }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="lesRecs.jalurPendukung?.length" class="mb-4">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Pendukung</p>
            <div class="space-y-1.5">
              <div v-for="(les, i) in lesRecs.jalurPendukung" :key="i"
                class="flex gap-3 rounded-xl border border-dashed border-gray-200 px-4 py-3">
                <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-bold text-gray-600">+</span>
                <div>
                  <p class="text-sm font-medium text-gray-700">{{ les.nama }}</p>
                  <p class="text-xs leading-relaxed text-gray-400">{{ les.deskripsi }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-if="lesRecs.belumPrioritas?.length">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Belum Prioritas</p>
            <div class="flex flex-wrap gap-2">
              <span v-for="(s, i) in lesRecs.belumPrioritas" :key="i"
                class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500">{{ s }}</span>
            </div>
          </div>
        </div>

        <!-- CTA -->
        <div class="mt-8 rounded-2xl border border-brand-200 bg-brand-50 p-6 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-brand-600">Siap untuk anak kamu?</p>
          <h2 class="mt-1 text-xl font-bold text-gray-950">Buat Laporan Anak Kamu Sekarang</h2>
          <p class="mt-2 text-sm text-gray-600">~5–10 menit · Laporan PDF + rekomendasi bimbingan belajar · Rp 99.000</p>
          <NuxtLink to="/survey" class="btn-primary-lg mt-5 inline-flex">
            Mulai Survey Sekarang
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
        </div>

      </template>

      <div v-else class="py-24 text-center text-sm text-gray-400">Contoh laporan tidak tersedia.</div>

    </main>
  </div>
</template>

<script setup lang="ts">
useSeoMeta({
  title: 'Contoh Laporan Lengkap — PetaMinatBakat',
  description: 'Lihat contoh laporan pemetaan potensi anak berdasarkan framework Nasab & Hasab dari PetaMinatBakat.',
})

const DEMO_ID = '4d943584-3b2d-48e8-8098-60749837950e'
const { data: result, pending } = await useFetch(`/api/results/${DEMO_ID}`)

const showDisclaimer = ref(false)

const scoreItems = [
  { code: 'asyiha', label: 'Qiyadah', icon: '🤝', scoreKey: 'scoreAsyiha', pctKey: 'pctAsyiha' },
  { code: 'ilmi',   label: 'Ilmi',   icon: '📚', scoreKey: 'scoreIlmi',   pctKey: 'pctIlmi'   },
  { code: 'amali',  label: 'Amali',  icon: '🛠️', scoreKey: 'scoreAmali',  pctKey: 'pctAmali'  },
  { code: 'wajdan', label: 'Wajdan', icon: '🎨', scoreKey: 'scoreWajdan', pctKey: 'pctWajdan' },
]

const chartOptions = computed(() => ({
  chart: { type: 'radar', toolbar: { show: false }, fontFamily: '"Inter Tight", sans-serif' },
  labels: ['Al-Qiyadah', 'Ilmi', 'Amali', 'Wajdan'],
  colors: ['#fabc3f'],
  fill: { opacity: 0.2, colors: ['#fabc3f'] },
  stroke: { width: 2, colors: ['#e4ab39'] },
  markers: { size: 4, colors: ['#e4ab39'] },
  yaxis: { show: false, min: 0, max: 25 },
  plotOptions: { radar: { polygons: { strokeColors: '#e9eaeb', fill: { colors: ['#fafafa', '#fff'] } } } },
}))

const chartSeries = computed(() => [{
  name: 'Skor Hasab',
  data: result.value
    ? [result.value.scoreAsyiha, result.value.scoreIlmi, result.value.scoreAmali, result.value.scoreWajdan]
    : [0, 0, 0, 0],
}])

const lesRecs = computed(() => result.value?.lesRecommendations || null)
const kekuatanUtama = computed(() => (lesRecs.value?.kekuatanUtama as string[]) || [])
const potensiProfesi = computed(() => (lesRecs.value?.potensiProfesi as { nama: string; alasan: string }[]) || [])
const karakterMenonjol = computed(() => (lesRecs.value?.karakterMenonjol as string[]) || [])
</script>
