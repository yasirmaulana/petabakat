<template>
  <div class="min-h-screen bg-gray-25 font-body">

    <!-- Wakaf Popup -->
    <Transition name="fade">
      <div v-if="showWakafPopup" class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
        <div class="absolute inset-0 bg-black/40 backdrop-blur-[2px]" @click="showWakafPopup = false" />
        <div class="relative w-full max-w-md overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-2xl">
          <div
            class="relative px-5 py-6"
            style="background-image: url('/wakaf-asrama.png'); background-size: cover; background-position: center top;"
          >
            <div class="absolute inset-0 bg-black/60" />
            <div class="relative">
              <p class="text-xs font-semibold uppercase tracking-widest text-brand-300">Wakaf Pendidikan</p>
              <h3 class="mt-0.5 text-lg font-bold text-white">Bangun Peradaban Lewat Wakaf</h3>
            </div>
          </div>
          <div class="p-5">
            <p class="text-sm leading-relaxed text-gray-700">
              Anda baru saja melihat peta potensi anak — benih peradaban masa depan.
              Agar benih itu tumbuh, dibutuhkan lembaga pendidikan yang kuat dan layak.
            </p>
            <p class="mt-3 text-sm leading-relaxed text-gray-700">
              Ikut ambil bagian dalam membangun <strong>asrama santri Madrasah Al-Fatih</strong>, Situ Daun, Bogor.
              Wakaf di bidang pendidikan adalah investasi peradaban yang pahalanya terus mengalir.
            </p>
            <div class="mt-5 flex flex-col gap-2.5">
              <a
                href="https://tarahum.id/amal/wakaf-asrama-akhwat-madrasah-al-fatih-situ-daun-bogor?ref=AsyTTx2F"
                target="_blank"
                rel="noopener noreferrer"
                class="btn-primary-full"
                @click="showWakafPopup = false"
              >
                🕌 Wakaf Sekarang via Tarahum
              </a>
              <button class="btn-secondary-full" @click="showWakafPopup = false">
                Nanti saja
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <!-- Header -->
    <header class="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <NuxtLink to="/history" class="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Kembali ke Riwayat
      </NuxtLink>
      <div class="flex items-center gap-2">
        <button class="btn-secondary px-4 py-2 text-sm" @click="sendViaWa" :disabled="waSending">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          {{ waSending ? 'Mengirim...' : 'WhatsApp' }}
        </button>
        <button class="btn-primary px-4 py-2 text-sm" @click="downloadPdf">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Unduh PDF
        </button>
      </div>
    </header>

    <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6">

      <!-- Loading / Processing -->
      <div v-if="pending || result?.status === 'processing'" class="flex flex-col items-center gap-4 py-24 text-center">
        <svg class="h-8 w-8 animate-spin text-brand-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <div>
          <p class="text-sm font-medium text-gray-900">Hasil sedang disusun...</p>
          <p class="text-sm text-gray-500">Sistem sedang menganalisa potensi kamu.</p>
          <p class="mt-2 text-xs text-gray-400">Analisis ini membutuhkan waktu 2–5 menit. Kamu boleh menutup halaman ini; hasil bisa dilihat kapan saja melalui menu Riwayat.</p>
        </div>
      </div>

      <template v-else-if="result && result.status === 'completed'">

        <!-- Persona Banner -->
        <div class="mb-6 overflow-hidden rounded-2xl border border-brand-200 bg-brand-50">
          <div class="px-6 py-6 sm:flex sm:items-start sm:gap-6">
            <div class="mb-4 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-400 text-2xl sm:mb-0">
              🌟
            </div>
            <div class="flex-1">
              <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-600">Persona Potensi Anak</p>
              <h1 class="text-2xl font-bold text-gray-950 sm:text-3xl">{{ result.personaLabel }}</h1>
              <!-- Karakter Menonjol badges -->
              <div v-if="karakterMenonjol.length" class="mt-2 flex flex-wrap gap-1.5">
                <span
                  v-for="k in karakterMenonjol"
                  :key="k"
                  class="inline-flex items-center rounded-full bg-brand-400/20 px-2.5 py-0.5 text-xs font-semibold text-brand-800"
                >{{ k }}</span>
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
            <li
              v-for="(k, i) in kekuatanUtama"
              :key="i"
              class="flex items-start gap-3"
            >
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
            <div
              v-for="(p, i) in potensiProfesi"
              :key="i"
              class="flex gap-3 rounded-xl border border-gray-100 bg-gray-25 px-4 py-3.5"
            >
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

        <!-- Disclaimer collapsible -->
        <div class="mb-6 rounded-xl border border-gray-200 bg-gray-50">
          <button
            type="button"
            class="flex w-full items-center justify-between px-4 py-3 text-left"
            @click="showDisclaimer = !showDisclaimer"
          >
            <span class="text-xs font-medium text-gray-500">⚠️ Disclaimer — baca sebelum mengambil keputusan</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-4 w-4 shrink-0 text-gray-400 transition-transform"
              :class="{ 'rotate-180': showDisclaimer }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="showDisclaimer" class="border-t border-gray-200 px-4 py-3">
            <ul class="space-y-1.5 text-xs leading-relaxed text-gray-500">
              <li>• Hasil ini <strong class="text-gray-600">bukan diagnosis profesional</strong> — bukan pengganti asesmen psikolog, dokter anak, atau konselor pendidikan.</li>
              <li>• Analisis dihasilkan oleh <strong class="text-gray-600">AI</strong> berdasarkan framework Nasab &amp; Hasab, bukan oleh pakar bersertifikat.</li>
              <li>• Hasil bersifat <strong class="text-gray-600">indikatif</strong> — gambaran awal, bukan vonis final tentang masa depan anak.</li>
              <li>• Akurasi bergantung pada kejujuran pengisian. Orang tua tetap penentu terbaik dalam mengenali potensi anaknya.</li>
              <li>• Data survei tidak dibagikan ke pihak ketiga dan hanya digunakan untuk menghasilkan laporan ini.</li>
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
            <div
              v-for="item in scoreItems"
              :key="item.code"
              class="card p-4"
              :class="{ 'border-brand-300 bg-brand-25': item.code === result.dominantHasab }"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <span class="text-lg">{{ item.icon }}</span>
                  <span class="text-sm font-medium text-gray-700">{{ item.label }}</span>
                </div>
                <span
                  v-if="item.code === result.dominantHasab"
                  class="rounded-full bg-brand-400 px-2 py-0.5 text-xs font-semibold text-black"
                >
                  Dominan
                </span>
              </div>
              <div class="mt-3 flex items-end gap-2">
                <span class="text-2xl font-bold text-gray-950">{{ result[item.scoreKey] }}</span>
                <span class="mb-0.5 text-sm text-gray-400">/ 25</span>
                <span class="mb-0.5 ml-auto text-sm font-semibold text-brand-600">{{ result[item.pctKey] }}%</span>
              </div>
              <div class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  class="h-1.5 rounded-full bg-brand-400 transition-all"
                  :style="{ width: `${(result[item.scoreKey] / 25) * 100}%` }"
                />
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
            <div
              v-for="(item, idx) in result.microdosingPlan?.schedule || []"
              :key="idx"
              class="rounded-xl border border-gray-100 bg-gray-25 px-4 py-3.5"
            >
              <div class="flex items-center gap-2 flex-wrap">
                <span class="inline-block rounded-lg bg-brand-400 px-2.5 py-1 text-xs font-semibold text-black">{{ item.day }}</span>
                <span v-if="item.figureInvolved" class="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                  {{ FIGURE_ICONS[item.figureInvolved] ?? '👥' }} bersama {{ FIGURE_ACTION_LABELS[item.figureInvolved] ?? item.figureInvolved }}
                </span>
              </div>
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

        <!-- Fit-Gap Narrative + Bridging Actions (muncul hanya jika ada data keluarga) -->
        <template v-if="result.fitGapNarrative || bridgingActions.length">
          <div class="card mt-6 overflow-hidden p-0">
            <div class="border-b border-gray-100 bg-emerald-50 px-5 py-4">
              <p class="text-xs font-semibold uppercase tracking-wider text-emerald-600">Ekosistem Keluarga</p>
              <h2 class="mt-0.5 text-base font-semibold text-gray-900">Keselarasan & Strategi Keluarga</h2>
            </div>
            <div class="p-5 space-y-5">
              <!-- Narasi Fit-Gap -->
              <p v-if="result.fitGapNarrative" class="text-sm leading-relaxed text-gray-700">
                {{ result.fitGapNarrative }}
              </p>
              <!-- Bridging Actions per figur -->
              <div v-if="bridgingActions.length">
                <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">Action per Figur</p>
                <div class="space-y-3">
                  <div
                    v-for="(action, i) in bridgingActions"
                    :key="i"
                    class="flex gap-3 rounded-xl border border-gray-100 bg-gray-25 px-4 py-3.5"
                  >
                    <span class="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base">
                      {{ FIGURE_ICONS[action.target] ?? '👥' }}
                    </span>
                    <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 flex-wrap">
                        <span class="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                          {{ FIGURE_ACTION_LABELS[action.target] ?? action.target }}
                        </span>
                        <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
                          {{ action.frequency }}
                        </span>
                      </div>
                      <p class="mt-1 text-sm font-medium text-gray-800">{{ action.action }}</p>
                      <p class="mt-0.5 text-xs leading-relaxed text-gray-500">{{ action.rationale }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Rekomendasi Les & Aktivitas (dari AI) -->
        <div v-if="lesRecs" class="card mt-6 p-6">
          <h2 class="mb-1 text-base font-semibold text-gray-900">Rekomendasi Aktivitas & Les</h2>
          <p class="mb-5 text-xs text-gray-400">Dipilih AI berdasarkan rumpun dominan, usia, dan minat anak. Coba satu dulu — trial sebelum komitmen.</p>

          <div class="mb-5">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Jalur Utama</p>
            <div class="space-y-2">
              <div
                v-for="(les, i) in lesRecs.jalurUtama"
                :key="i"
                class="flex gap-3 rounded-xl border border-gray-100 bg-gray-25 px-4 py-3"
              >
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
              <div
                v-for="(les, i) in lesRecs.jalurPendukung"
                :key="i"
                class="flex gap-3 rounded-xl border border-dashed border-gray-200 px-4 py-3"
              >
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
              <span
                v-for="(s, i) in lesRecs.belumPrioritas"
                :key="i"
                class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-500"
              >{{ s }}</span>
            </div>
          </div>
        </div>

        <!-- ── Fit-Gap Section ─────────────────────────────────────────────── -->
        <div id="fit-gap" class="mt-8">

          <!-- Sudah ada hasil Fit-Gap -->
          <template v-if="familyResult">
            <div class="rounded-2xl border p-6"
              :class="familyResult.fitGapStatus === 'OPTIMAL'
                ? 'border-emerald-200 bg-emerald-50'
                : 'border-amber-200 bg-amber-50'">
              <p class="text-xs font-semibold uppercase tracking-wider"
                :class="familyResult.fitGapStatus === 'OPTIMAL' ? 'text-emerald-600' : 'text-amber-600'">
                Analisis Hasab Keluarga
              </p>
              <div class="mt-2 flex items-center gap-3">
                <span class="text-2xl">{{ familyResult.fitGapStatus === 'OPTIMAL' ? '✅' : '⚡' }}</span>
                <h2 class="text-lg font-bold text-gray-950">
                  {{ familyResult.fitGapStatus === 'OPTIMAL' ? 'Ekosistem OPTIMAL' : 'Ada Celah (GAP)' }}
                </h2>
              </div>

              <!-- Fit-Gap meter -->
              <div class="mt-4">
                <div class="mb-1 flex justify-between text-xs text-gray-500">
                  <span>Fit-Gap Score</span>
                  <span class="font-semibold">{{ Math.round(Number(familyResult.fitGapScore) * 100) }}%</span>
                </div>
                <div class="h-2.5 w-full overflow-hidden rounded-full bg-white/60">
                  <div class="h-2.5 rounded-full transition-all"
                    :class="familyResult.fitGapStatus === 'OPTIMAL' ? 'bg-emerald-500' : 'bg-amber-400'"
                    :style="{ width: `${Math.round(Number(familyResult.fitGapScore) * 100)}%` }" />
                </div>
              </div>

              <!-- Top 3 badges keluarga -->
              <div class="mt-4">
                <p class="mb-2 text-xs font-medium text-gray-500">Top-3 Kekuatan Hasab Keluarga</p>
                <div class="flex flex-wrap gap-2">
                  <span v-for="(dim, i) in familyResult.top3Hasab" :key="dim"
                    class="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-gray-800 shadow-sm">
                    <span>{{ ['🥇','🥈','🥉'][i] }}</span>
                    {{ DIM_SHORT_LABELS[dim] ?? dim }}
                  </span>
                </div>
              </div>

              <!-- Rekomendasi -->
              <p class="mt-4 text-sm leading-relaxed text-gray-700">{{ familyResult.recommendation }}</p>

              <p class="mt-3 text-xs text-gray-400">
                Berdasarkan {{ familyResult.figuresIncluded }} figur keluarga yang diisi
              </p>
            </div>

            <!-- Radar Chart 5 Arah Hasab Keluarga -->
            <div class="card mt-4 p-5">
              <p class="mb-1 text-sm font-semibold text-gray-800">Profil 5 Dimensi Hasab Keluarga</p>
              <p class="mb-4 text-xs text-gray-400">Akumulasi tertimbang dari semua figur yang diisi</p>
              <client-only>
                <apexchart
                  type="radar"
                  height="300"
                  :options="familyChartOptions"
                  :series="familyChartSeries"
                />
              </client-only>
            </div>

            <!-- Comparison Card: Minat Anak vs Hasab Keluarga -->
            <div class="card mt-4 overflow-hidden p-0">
              <div class="border-b border-gray-100 px-5 py-4">
                <p class="text-sm font-semibold text-gray-800">Perbandingan Potensi Anak vs Ekosistem Keluarga</p>
              </div>
              <div class="grid grid-cols-2 divide-x divide-gray-100">
                <!-- Kolom kiri: Minat Anak -->
                <div class="p-4">
                  <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-brand-600">Minat Anak</p>
                  <div class="space-y-2">
                    <div v-for="(item, i) in childDimRanking" :key="item.code" class="flex items-center gap-2">
                      <span class="w-4 shrink-0 text-center text-xs text-gray-400">{{ i + 1 }}</span>
                      <div class="flex-1">
                        <div class="mb-0.5 flex justify-between text-xs">
                          <span class="font-medium text-gray-700">{{ item.label }}</span>
                          <span class="text-gray-400">{{ item.pct }}%</span>
                        </div>
                        <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div class="h-1.5 rounded-full bg-brand-400"
                            :style="{ width: `${item.pct}%` }" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- Kolom kanan: Hasab Keluarga -->
                <div class="p-4">
                  <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-emerald-600">Hasab Keluarga</p>
                  <div class="space-y-2">
                    <div v-for="(item, i) in familyDimRanking" :key="item.code" class="flex items-center gap-2">
                      <span class="w-4 shrink-0 text-center text-xs text-gray-400">{{ i + 1 }}</span>
                      <div class="flex-1">
                        <div class="mb-0.5 flex justify-between text-xs">
                          <span class="font-medium text-gray-700">{{ item.label }}</span>
                          <span class="text-gray-400">{{ item.pct }}%</span>
                        </div>
                        <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div class="h-1.5 rounded-full"
                            :class="item.matched ? 'bg-emerald-500' : 'bg-gray-300'"
                            :style="{ width: `${item.pct}%` }" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <p class="mt-3 text-xs text-gray-400">
                    <span class="inline-block h-2 w-2 rounded-full bg-emerald-500"></span>
                    = selaras dengan Top-2 minat anak
                  </p>
                </div>
              </div>
            </div>
          </template>

          <!-- Belum ada — CTA -->
          <template v-else>
            <div class="rounded-2xl border border-brand-200 bg-brand-50 p-6">
              <p class="text-xs font-semibold uppercase tracking-wider text-brand-600">Modul Tambahan</p>
              <h2 class="mt-1 text-lg font-bold text-gray-950">Ukur Dukungan Keluarga</h2>
              <p class="mt-2 text-sm leading-relaxed text-gray-700">
                Seberapa kuat ekosistem keluarga mendukung potensi
                <strong>{{ result?.survey?.child?.name || 'anak' }}</strong>?
                Isi penilaian Hasab 6 figur keluarga untuk mendapatkan
                <strong>Fit-Gap Ratio</strong> — gratis, ~15 menit.
              </p>
              <div class="mt-4 flex flex-wrap gap-2">
                <span v-for="d in ['Rekam jejak 6 figur keluarga','5 dimensi Hasab','Analisis deterministik']" :key="d"
                  class="rounded-full border border-brand-200 bg-white px-3 py-1 text-xs text-brand-700">
                  ✓ {{ d }}
                </span>
              </div>
              <NuxtLink :to="`/family-survey/${resultId}`"
                class="btn-primary mt-5 inline-flex w-full justify-center sm:w-auto">
                Mulai Penilaian Hasab Keluarga →
              </NuxtLink>
            </div>
          </template>

        </div>

        <!-- Actions bottom -->
        <div class="mt-8 flex flex-col gap-3">
          <div class="flex flex-col gap-3 sm:flex-row">
            <button class="btn-primary-full sm:flex-1" @click="downloadPdf">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Unduh Laporan PDF
            </button>
            <button class="btn-secondary-full sm:flex-1" @click="sendViaWa" :disabled="waSending">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              {{ waSending ? 'Mengirim...' : 'Kirim ke WhatsApp' }}
            </button>
          </div>
          <button class="btn-secondary-full" @click="downloadStoryCard">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Unduh Card Story 9:16
          </button>
        </div>

      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const resultId = route.params.id

const { data: result, pending, refresh } = await useFetch(`/api/results/${resultId}`)
const waSending = ref(false)
const showWakafPopup = ref(false)
const showDisclaimer = ref(false)

// ── Hasab Keluarga / Fit-Gap ──────────────────────────────────────────────────
const { data: familyData } = useFetch(`/api/family-assessment/${resultId}`, { server: false })
const familyResult = computed(() => {
  const d = familyData.value as { exists?: boolean; assessment?: { result: unknown; status: string } } | null
  if (!d?.exists || !d.assessment?.result || d.assessment.status !== 'completed') return null
  return d.assessment.result as {
    fitGapStatus: string
    fitGapScore: number
    top3Hasab: string[]
    recommendation: string
    figuresIncluded: number
  }
})

const DIM_SHORT_LABELS: Record<string, string> = {
  ilmi: 'Hasab Ilmi',
  qiyadah: 'Hasab Qiyadah',
  amali: 'Hasab Amali',
  wajdan: 'Hasab Wajdan',
  tarbiyah: 'Hasab Tarbiyah',
}

// ── Chart & Comparison: Hasab Keluarga ───────────────────────────────────────
const FAMILY_DIMS = ['ilmi', 'qiyadah', 'amali', 'wajdan', 'tarbiyah'] as const
const FAMILY_DIM_LABELS = ['Ilmi', 'Qiyadah', 'Amali', 'Wajdan', 'Tarbiyah']

const familyScores = computed(() => {
  const r = familyResult.value
  if (!r) return null
  const full = r as typeof r & {
    scoreIlmi?: number; scoreQiyadah?: number; scoreAmali?: number; scoreWajdan?: number; scoreTarbiyah?: number
  }
  return {
    ilmi: Number(full.scoreIlmi ?? 0),
    qiyadah: Number(full.scoreQiyadah ?? 0),
    amali: Number(full.scoreAmali ?? 0),
    wajdan: Number(full.scoreWajdan ?? 0),
    tarbiyah: Number(full.scoreTarbiyah ?? 0),
  }
})

const familyChartSeries = computed(() => {
  const s = familyScores.value
  if (!s) return []
  return [{ name: 'Hasab Keluarga', data: FAMILY_DIMS.map((d) => +(s[d].toFixed(1))) }]
})

const familyChartOptions = computed(() => ({
  chart: { type: 'radar', toolbar: { show: false }, fontFamily: '"Inter Tight", sans-serif' },
  xaxis: { categories: FAMILY_DIM_LABELS },
  yaxis: { show: false, min: 0 },
  colors: ['#10b981'],
  fill: { opacity: 0.18 },
  markers: { size: 4 },
  plotOptions: { radar: { polygons: { strokeColors: '#e9eaeb', fill: { colors: ['#f9fafb', '#fff'] } } } },
  dataLabels: { enabled: true, style: { fontSize: '11px', colors: ['#374151'] } },
  tooltip: { y: { formatter: (v: number) => v.toFixed(1) } },
}))

// Ranking untuk Comparison Card
const CHILD_DIM_LABELS: Record<string, string> = {
  asyiha: 'Al-Qiyadah', ilmi: 'Ilmi', amali: 'Amali', wajdan: 'Wajdan',
}
const childDimRanking = computed(() => {
  const r = result.value as null | {
    pctAsyiha?: number; pctIlmi?: number; pctAmali?: number; pctWajdan?: number
  }
  if (!r) return []
  const raw = [
    { code: 'asyiha', label: 'Al-Qiyadah', pct: Math.round(Number(r.pctAsyiha ?? 0)) },
    { code: 'ilmi',   label: 'Ilmi',        pct: Math.round(Number(r.pctIlmi ?? 0)) },
    { code: 'amali',  label: 'Amali',        pct: Math.round(Number(r.pctAmali ?? 0)) },
    { code: 'wajdan', label: 'Wajdan',       pct: Math.round(Number(r.pctWajdan ?? 0)) },
  ]
  return raw.sort((a, b) => b.pct - a.pct)
})

const familyDimRanking = computed(() => {
  const s = familyScores.value
  if (!s) return []
  // Max possible per dimensi = 6 soal × 5 skor × bobot max ≈ ~36; normalise ke 100
  const MAX = Math.max(...FAMILY_DIMS.map((d) => s[d]), 1)
  const top2ChildCodes = childDimRanking.value.slice(0, 2).map((x) => x.code)
  // map child code → family dim
  const childToFamily: Record<string, string> = { asyiha: 'qiyadah', ilmi: 'ilmi', amali: 'amali', wajdan: 'wajdan' }
  const matchedFamilyDims = new Set(top2ChildCodes.map((c) => childToFamily[c]).filter(Boolean))

  const raw = FAMILY_DIMS.map((d) => ({
    code: d,
    label: DIM_SHORT_LABELS[d] ?? d,
    pct: Math.round((s[d] / MAX) * 100),
    matched: matchedFamilyDims.has(d),
  }))
  return raw.sort((a, b) => b.pct - a.pct)
})

let pollTimer = null
function startPolling() {
  stopPolling()
  pollTimer = setInterval(async () => {
    await refresh()
    if (result.value?.status === 'completed') {
      stopPolling()
      // setTimeout(() => { showWakafPopup.value = true }, 1800)
    }
  }, 3000)
}
function stopPolling() {
  if (pollTimer) clearInterval(pollTimer)
}

onMounted(() => {
  if (result.value?.status === 'processing') startPolling()
})
onUnmounted(stopPolling)

watch(pending, (val) => {
  if (!val && result.value?.status === 'completed') {
    // setTimeout(() => { showWakafPopup.value = true }, 1800)
  }
})

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
  plotOptions: {
    radar: {
      polygons: {
        strokeColors: '#e9eaeb',
        fill: { colors: ['#fafafa', '#fff'] },
      },
    },
  },
}))

const chartSeries = computed(() => [{
  name: 'Skor Hasab',
  data: result.value
    ? [result.value.scoreAsyiha, result.value.scoreIlmi, result.value.scoreAmali, result.value.scoreWajdan]
    : [0, 0, 0, 0],
}])

const lesRecs = computed(() => {
  if (!result.value) return null
  return result.value.lesRecommendations || null
})

const FIGURE_ICONS: Record<string, string> = {
  ayah: '👨', ibu: '👩', kakek: '👴', nenek: '👵', keluarga: '🏠', anak: '🧒',
}
const FIGURE_ACTION_LABELS: Record<string, string> = {
  ayah: 'Ayah', ibu: 'Ibu', kakek: 'Kakek', nenek: 'Nenek',
  keluarga: 'Seluruh Keluarga', anak: 'Anak',
}

const bridgingActions = computed(() => {
  if (!result.value) return []
  const raw = (result.value as Record<string, unknown>).bridgingActions
  if (!Array.isArray(raw)) return []
  return raw as { target: string; action: string; frequency: string; rationale: string }[]
})

const kekuatanUtama = computed(() => (lesRecs.value?.kekuatanUtama as string[]) || [])
const potensiProfesi = computed(() => (lesRecs.value?.potensiProfesi as { nama: string; alasan: string }[]) || [])
const karakterMenonjol = computed(() => (lesRecs.value?.karakterMenonjol as string[]) || [])

function downloadPdf() {
  window.open(`/api/reports/${resultId}/pdf`, '_blank')
}

async function sendViaWa() {
  waSending.value = true
  try {
    await $fetch(`/api/reports/${resultId}/send`, { method: 'POST' })
    alert('Link PDF berhasil dikirim ke WhatsApp')
  } catch {
    alert('Gagal mengirim WhatsApp')
  } finally {
    waSending.value = false
  }
}

function downloadStoryCard() {
  if (!result.value) return

  const W = 1080
  const H = 1920
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')
  // ponytail: roundRect polyfill for older Safari/Chrome
  if (!ctx.roundRect) {
    ctx.roundRect = function(x, y, w, h, r) {
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + w - r, y)
      ctx.arcTo(x + w, y, x + w, y + r, r)
      ctx.lineTo(x + w, y + h - r)
      ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
      ctx.lineTo(x + r, y + h)
      ctx.arcTo(x, y + h, x, y + h - r, r)
      ctx.lineTo(x, y + r)
      ctx.arcTo(x, y, x + r, y, r)
      ctx.closePath()
    }
  }

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, 0, H)
  bg.addColorStop(0, '#fffbf0')
  bg.addColorStop(1, '#fef3c7')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Top accent bar
  ctx.fillStyle = '#fabc3f'
  ctx.fillRect(0, 0, W, 12)

  // Brand name
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 52px system-ui, sans-serif'
  ctx.fillText('PetaMinatBakat', 90, 130)
  ctx.fillStyle = '#78716c'
  ctx.font = '34px system-ui, sans-serif'
  ctx.fillText('Peta Potensi Anak — Nasab & Hasab', 90, 185)

  // Divider
  ctx.strokeStyle = '#e7e5e4'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(90, 220)
  ctx.lineTo(W - 90, 220)
  ctx.stroke()

  // Child name + persona label — rv escapes TS union narrowing (result can be processing|completed)
  const rv = Object.assign({}, result.value)
  const childName = rv?.survey?.child?.name || 'Anak'
  ctx.fillStyle = '#78716c'
  ctx.font = '36px system-ui, sans-serif'
  ctx.fillText(`Hasil Analisis untuk ${childName}`, 90, 295)

  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 72px system-ui, sans-serif'
  const personaLabel = rv.personaLabel || ''
  // wrap if long
  const maxW = W - 180
  const words = personaLabel.split(' ')
  let line = ''
  let yL = 400
  for (const word of words) {
    const test = line ? `${line} ${word}` : word
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, 90, yL)
      line = word
      yL += 88
    } else {
      line = test
    }
  }
  ctx.fillText(line, 90, yL)
  const afterPersona = yL + 60

  // Radar polygon (manual)
  const cx = W / 2
  const cy = afterPersona + 340
  const maxR = 280
  const scores = [
    rv.scoreAsyiha || 0,
    rv.scoreIlmi   || 0,
    rv.scoreAmali  || 0,
    rv.scoreWajdan || 0,
  ]
  const labels = ['Al-Qiyadah', 'Ilmi', 'Amali', 'Wajdan']
  const icons  = ['🤝', '📚', '🛠️', '🎨']
  const angles = [Math.PI * 1.5, 0, Math.PI * 0.5, Math.PI] // top, right, bottom, left

  // Grid rings
  ctx.strokeStyle = '#e7e5e4'
  ctx.lineWidth = 1.5
  for (const pct of [0.25, 0.5, 0.75, 1]) {
    ctx.beginPath()
    for (let i = 0; i < 4; i++) {
      const x = cx + Math.cos(angles[i]) * maxR * pct
      const y = cy + Math.sin(angles[i]) * maxR * pct
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.stroke()
  }
  // Axis lines
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    ctx.moveTo(cx, cy)
    ctx.lineTo(cx + Math.cos(angles[i]) * maxR, cy + Math.sin(angles[i]) * maxR)
    ctx.stroke()
  }
  // Data polygon
  ctx.fillStyle = 'rgba(250,188,63,0.25)'
  ctx.strokeStyle = '#e4ab39'
  ctx.lineWidth = 4
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const r = (scores[i] / 25) * maxR
    const x = cx + Math.cos(angles[i]) * r
    const y = cy + Math.sin(angles[i]) * r
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
  }
  ctx.closePath()
  ctx.fill()
  ctx.stroke()
  // Dots
  for (let i = 0; i < 4; i++) {
    const r = (scores[i] / 25) * maxR
    ctx.fillStyle = '#e4ab39'
    ctx.beginPath()
    ctx.arc(cx + Math.cos(angles[i]) * r, cy + Math.sin(angles[i]) * r, 10, 0, Math.PI * 2)
    ctx.fill()
  }
  // Labels
  ctx.fillStyle = '#44403c'
  ctx.font = 'bold 36px system-ui, sans-serif'
  for (let i = 0; i < 4; i++) {
    const labelR = maxR + 60
    const lx = cx + Math.cos(angles[i]) * labelR
    const ly = cy + Math.sin(angles[i]) * labelR
    ctx.textAlign = 'center'
    ctx.fillText(`${icons[i]} ${labels[i]}`, lx, ly + 12)
  }
  ctx.textAlign = 'left'

  // Score bars below radar
  const barTop = cy + maxR + 130
  const barAreaW = W - 180
  ctx.fillStyle = '#1c1917'
  ctx.font = 'bold 38px system-ui, sans-serif'
  ctx.fillText('Skor Rumpun', 90, barTop)

  const sortedScores = scores
    .map((s, i) => {
      const key = `pct${['Asyiha','Ilmi','Amali','Wajdan'][i]}`
      return { label: labels[i], icon: icons[i], score: s, pct: parseFloat(rv[key]) || (s / 25) * 100 }
    })
    .sort((a, b) => b.score - a.score)

  for (let i = 0; i < 4; i++) {
    const item = sortedScores[i]
    const by = barTop + 70 + i * 110
    ctx.fillStyle = '#57534e'
    ctx.font = '34px system-ui, sans-serif'
    ctx.fillText(`${item.icon} ${item.label}`, 90, by)
    const pct = parseFloat(item.pct) || 0
    ctx.fillStyle = '#e5e7eb'
    ctx.beginPath()
    ctx.roundRect(90, by + 14, barAreaW, 30, 15)
    ctx.fill()
    ctx.fillStyle = i === 0 ? '#fabc3f' : '#fde68a'
    ctx.beginPath()
    ctx.roundRect(90, by + 14, barAreaW * (pct / 100), 30, 15)
    ctx.fill()
    ctx.fillStyle = '#44403c'
    ctx.font = 'bold 28px system-ui, sans-serif'
    ctx.fillText(`${Math.round(pct)}%`, 90 + barAreaW * (pct / 100) + 10, by + 36)
  }

  // Footer
  ctx.fillStyle = '#a8a29e'
  ctx.font = '30px system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillText('petaminatbakat.vercel.app · Framework Nasab & Hasab', W / 2, H - 80)
  ctx.fillText('Kenali potensi anakmu dari akar keluarga', W / 2, H - 40)
  ctx.textAlign = 'left'

  // Bottom accent bar
  ctx.fillStyle = '#fabc3f'
  ctx.fillRect(0, H - 12, W, 12)

  const a = document.createElement('a')
  a.href = canvas.toDataURL('image/png')
  a.download = `petaminatbakat-${childName.replace(/\s+/g, '-')}-story.png`
  a.click()
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
