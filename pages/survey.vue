<template>
  <div class="min-h-screen bg-gray-25 font-body">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <NuxtLink to="/" class="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        PetaMinatBakat
      </NuxtLink>
      <span class="text-xs font-medium text-gray-500">Langkah {{ currentStep + 1 }} dari {{ totalSteps }}</span>
    </header>

    <!-- Loading overlay -->
    <Transition name="fade-overlay">
      <div v-if="loading" class="fixed inset-0 z-50 flex flex-col items-center justify-center bg-gray-950/95 px-6 text-white">
        <div class="w-full max-w-sm">
          <p class="mb-8 text-center text-sm font-semibold tracking-widest text-brand-400 uppercase">PetaMinatBakat</p>
          <div class="space-y-4">
            <div
              v-for="(step, i) in loadingSteps"
              :key="i"
              class="flex items-center gap-3 transition-opacity duration-500"
              :class="i > loadingStep ? 'opacity-25' : 'opacity-100'"
            >
              <div class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full">
                <svg v-if="i < loadingStep" class="h-5 w-5 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <svg v-else-if="i === loadingStep" class="h-5 w-5 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <div v-else class="h-2 w-2 rounded-full bg-gray-600" />
              </div>
              <span class="text-sm" :class="i === loadingStep ? 'font-semibold text-white' : i < loadingStep ? 'text-brand-400' : 'text-gray-500'">
                {{ step }}
              </span>
            </div>
          </div>
          <div class="mt-10 rounded-xl border border-white/10 bg-white/5 px-4 py-4">
            <p class="mb-1 text-xs font-semibold uppercase tracking-wider text-brand-400">Tahukah kamu?</p>
            <Transition name="fact-swap" mode="out-in">
              <p :key="currentFact" class="text-sm leading-relaxed text-gray-300">{{ loadingFacts[currentFact] }}</p>
            </Transition>
          </div>
        </div>
      </div>
    </Transition>

    <main class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">

      <!-- Progress bar -->
      <div class="mb-8">
        <div class="mb-2 flex justify-between text-xs font-medium text-gray-500">
          <span>{{ stepTitle }}</span>
          <span>{{ Math.round(((currentStep + 1) / totalSteps) * 100) }}%</span>
        </div>
        <div class="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
          <div
            class="h-1.5 rounded-full bg-brand-400 transition-all duration-300"
            :style="{ width: `${((currentStep + 1) / totalSteps) * 100}%` }"
          />
        </div>
      </div>

      <form @submit.prevent="submitSurvey">

        <!-- STEP 0: Data Anak + Minat -->
        <section v-if="currentStep === 0" class="space-y-5">
          <div>
            <h2 class="text-xl font-bold text-gray-950">Data Anak</h2>
            <p class="mt-1 text-sm text-gray-500">Informasi ini digunakan untuk personalisasi laporan analisis potensi.</p>
          </div>

          <div class="card p-5 space-y-4">
            <div>
              <label class="label-text">Nama Anak</label>
              <input v-model="form.childName" required placeholder="Nama anak" class="input-field" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label class="label-text">Tanggal Lahir</label>
                <input v-model="form.childBirthDate" type="date" required class="input-field" />
              </div>
              <div>
                <label class="label-text">Jenis Kelamin</label>
                <select v-model="form.childGender" required class="input-field">
                  <option value="">Pilih</option>
                  <option value="L">Laki-laki</option>
                  <option value="P">Perempuan</option>
                </select>
              </div>
            </div>
          </div>

          <div class="card p-5 space-y-5">
            <div class="flex items-baseline justify-between gap-2">
              <label class="label-text">Minat / Respon Alami Anak <span class="font-normal text-gray-400">(pilih semua yang sesuai, min. 3)</span></label>
              <span class="shrink-0 text-xs font-medium" :class="form.naturalResponses.length < 3 ? 'text-gray-400' : 'text-brand-600'">{{ form.naturalResponses.length }} dipilih</span>
            </div>

            <div v-for="group in dimensionGroups" :key="group.key" class="space-y-2">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">{{ group.label }}</p>
              <div class="grid gap-2 sm:grid-cols-2">
                <label
                  v-for="option in optionsByDimension[group.key]"
                  :key="option.label"
                  class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-brand-300 hover:bg-brand-25"
                  :class="{ 'border-brand-400 bg-brand-50': form.naturalResponses.includes(option.label) }"
                >
                  <input v-model="form.naturalResponses" type="checkbox" :value="option.label" class="h-4 w-4 accent-black shrink-0" />
                  <span class="text-sm text-gray-700">{{ option.label }}</span>
                </label>
              </div>

              <!-- Custom inputs untuk grup ini -->
              <template v-for="(item, i) in form.customResponses" :key="`c-${i}`">
                <div v-if="item.dimension === group.key" class="flex gap-2">
                  <input v-model="item.text" placeholder="Tulis minat spesifik..." class="input-field flex-1 text-sm" />
                  <button type="button" class="shrink-0 p-2 text-gray-400 hover:text-red-500 transition-colors" @click="removeCustomResponse(i)">
                    <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                </div>
              </template>

              <button type="button" class="flex items-center gap-1.5 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors" @click="addCustomResponse(group.key)">
                <svg class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/></svg>
                Tambah minat lainnya
              </button>
            </div>
          </div>

          <div class="card p-5">
            <label class="label-text mb-1 block">Ceritakan satu momen anak paling antusias <span class="font-normal text-gray-400">(opsional)</span></label>
            <p class="mb-3 text-xs text-gray-400">Misalnya: "Pernah menghafal 10 hadis dalam seminggu tanpa dipaksa", "Selalu minta beli LEGO setiap ulang tahun", dsb.</p>
            <textarea
              v-model="form.momentAntusias"
              rows="3"
              placeholder="Tulis momen konkret yang menunjukkan kegemaran terbesar anak..."
              class="input-field resize-none"
            />
          </div>
        </section>

        <!-- STEP 1: Data Orang Tua + Voucher -->
        <section v-else-if="currentStep === 1" class="space-y-5">
          <div>
            <h2 class="text-xl font-bold text-gray-950">Data Orang Tua & Kode Voucher</h2>
            <p class="mt-1 text-sm text-gray-500">Laporan akan dikirim ke nomor WhatsApp kamu setelah survei selesai.</p>
          </div>

          <div class="card p-5 space-y-4">
            <div>
              <label class="label-text">Nama Orang Tua / Wali</label>
              <input v-model="form.parentName" required placeholder="Nama lengkap" class="input-field" />
            </div>
            <div>
              <label class="label-text">Nomor WhatsApp</label>
              <input v-model="form.parentPhone" type="tel" required placeholder="0812xxxxxxxx" class="input-field" />
            </div>
            <div>
              <label class="label-text">Email <span class="font-normal text-gray-400">(opsional)</span></label>
              <input v-model="form.parentEmail" type="email" placeholder="email@contoh.com" class="input-field" />
            </div>
          </div>

          <!-- Kode Sekolah (opsional) -->
          <div class="card p-5 space-y-3">
            <div>
              <label class="label-text">Kode Sekolah <span class="font-normal text-gray-400">(opsional)</span></label>
              <input
                v-model="form.schoolCode"
                placeholder="Contoh: SDIT-ALFATIH-2026"
                class="input-field uppercase tracking-widest"
                :class="schoolStatus === 'valid' ? 'border-green-400 bg-green-50' : schoolStatus === 'invalid' ? 'border-red-300' : ''"
                @input="resetSchool"
              />
              <p class="mt-1 text-xs text-gray-400">Isi jika anak bersekolah di sekolah yang bermitra dengan PetaMinatBakat.</p>
            </div>
            <button
              v-if="form.schoolCode.trim()"
              type="button"
              class="btn-secondary px-4 py-2 text-sm"
              :disabled="schoolValidating"
              @click="validateSchool"
            >{{ schoolValidating ? 'Mengecek...' : 'Cek Kode Sekolah' }}</button>
            <p v-if="schoolStatus === 'valid'" class="flex items-center gap-1.5 text-sm font-medium text-green-600">
              <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
              Kode sekolah valid — {{ validatedSchoolName }}
            </p>
            <p v-if="schoolStatus === 'invalid'" class="text-sm text-red-600">{{ schoolError }}</p>
            <label v-if="schoolStatus === 'valid'" class="flex items-start gap-3 cursor-pointer rounded-xl border border-green-200 bg-green-50 p-3">
              <input v-model="form.schoolConsent" type="checkbox" class="mt-0.5 h-4 w-4 accent-black shrink-0" />
              <span class="text-xs text-green-800">Saya setuju data hasil survei anak saya dibagikan ke <strong>{{ validatedSchoolName }}</strong> untuk keperluan pendidikan.</span>
            </label>
          </div>

          <!-- Voucher -->
          <div class="card p-5 space-y-4">
            <div>
              <label class="label-text">Kode Voucher</label>
              <div class="flex gap-2 mt-1.5">
                <input
                  v-model="form.voucherCode"
                  placeholder="Contoh: PMB-AB12CD34"
                  class="input-field flex-1 uppercase tracking-widest"
                  :class="voucherStatus === 'valid' ? 'border-green-400 bg-green-50' : voucherStatus === 'invalid' ? 'border-red-300' : ''"
                  @input="resetVoucher"
                />
                <button
                  type="button"
                  class="btn-secondary px-4 shrink-0"
                  :disabled="voucherValidating || !form.voucherCode.trim()"
                  @click="validateVoucher"
                >
                  <svg v-if="voucherValidating" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span v-else>Cek</span>
                </button>
              </div>
              <p v-if="voucherStatus === 'valid'" class="mt-2 flex items-center gap-1.5 text-sm font-medium text-green-600">
                <svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
                Voucher valid — kamu bisa melanjutkan survei
              </p>
              <p v-else-if="voucherStatus === 'invalid'" class="mt-2 text-sm text-red-600">{{ voucherError }}</p>
            </div>

            <div class="rounded-xl border border-amber-100 bg-amber-50 p-4">
              <p class="text-sm font-medium text-amber-800">Belum punya voucher?</p>
              <p class="mt-1 text-xs text-amber-700">Voucher didapatkan setelah melakukan pembayaran Rp 99.000 melalui WhatsApp admin.</p>
              <a
                href="https://wa.me/6281586245143?text=Halo%2C%20saya%20ingin%20mendapatkan%20voucher%20PetaMinatBakat"
                target="_blank"
                rel="noopener noreferrer"
                class="mt-3 inline-flex items-center gap-2 rounded-lg bg-green-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-600"
              >
                <svg class="h-4 w-4" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Chat WhatsApp Admin
              </a>
            </div>
          </div>
        </section>

        <!-- STEP 2: Pertanyaan Nasab -->
        <section v-else-if="currentStep === 2" class="space-y-5">
          <div>
            <h2 class="text-xl font-bold text-gray-950">Pertanyaan Nasab</h2>
            <p class="mt-1 text-sm text-gray-500">Menggali kejelasan garis keturunan dan silaturahim keluarga.</p>
          </div>

          <div v-if="questionsPending" class="flex items-center gap-2 py-8 text-center text-sm text-gray-400">
            <svg class="h-4 w-4 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Memuat soal...
          </div>

          <div
            v-for="question in data?.nasabQuestions || []"
            :key="question.id"
            class="card p-5"
          >
            <p class="mb-4 text-sm font-medium text-gray-900">{{ question.order }}. {{ question.text }}</p>
            <div class="flex gap-4">
              <label class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-4 py-2.5 transition-colors hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                <input v-model="form.nasabAnswers[question.id]" type="radio" :name="`nasab-${question.id}`" :value="1" required class="accent-black" />
                <span class="text-sm font-medium text-gray-700">Ya</span>
              </label>
              <label class="flex cursor-pointer items-center gap-2.5 rounded-lg border border-gray-200 px-4 py-2.5 transition-colors hover:border-brand-300 has-[:checked]:border-brand-400 has-[:checked]:bg-brand-50">
                <input v-model="form.nasabAnswers[question.id]" type="radio" :name="`nasab-${question.id}`" :value="0" required class="accent-black" />
                <span class="text-sm font-medium text-gray-700">Tidak</span>
              </label>
            </div>
          </div>
        </section>

        <!-- Validation error -->
        <p v-if="validationError" class="mt-6 rounded-xl border border-error-100 bg-error-50 px-4 py-3 text-sm text-error-600">
          {{ validationError }}
        </p>

        <!-- Navigation — hanya untuk steps 0-2 -->
        <div v-if="currentStep <= 2" class="mt-4 flex items-center justify-between">
          <button
            v-if="currentStep > 0"
            type="button"
            class="btn-secondary px-5 py-2.5"
            @click="prevStep"
          >
            ← Sebelumnya
          </button>
          <div v-else />

          <!-- Steps 0-1: tombol Lanjut -->
          <button
            v-if="currentStep < 2"
            type="button"
            class="btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentStep === 1 && voucherStatus !== 'valid'"
            @click="nextStep"
          >
            Lanjut →
          </button>

          <!-- Step 2 (nasab): submit ke server lalu lanjut family -->
          <button
            v-else-if="currentStep === 2"
            type="submit"
            :disabled="loading || submitting"
            class="btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg v-if="loading || submitting" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading || submitting ? 'Memproses...' : 'Lanjut ke Penilaian Keluarga →' }}
          </button>
        </div>

      </form>

      <!-- ══ STEP 3: Intro Penilaian Keluarga ══════════════════════════════════ -->
      <section v-if="currentStep === 3" class="space-y-5">
        <div class="rounded-2xl border border-brand-200 bg-brand-50 p-6">
          <p class="text-xs font-semibold uppercase tracking-wider text-brand-600">Modul Tambahan</p>
          <h1 class="mt-1 text-xl font-bold text-gray-950">Analisis Hasab Keluarga</h1>
          <p class="mt-3 text-sm leading-relaxed text-gray-700">
            Seberapa kuat ekosistem keluarga mendukung potensi anak? Modul ini menilai rekam jejak 6 figur keluarga
            untuk menghasilkan <strong>Fit-Gap Ratio</strong> antara kecenderungan alami anak dan kapasitas Hasab keluarga.
          </p>
        </div>
        <div class="card p-5 space-y-3 text-sm text-gray-700">
          <p class="font-semibold text-gray-900">Yang perlu Anda lakukan:</p>
          <div v-for="fig in FIGURES" :key="fig.role" class="flex items-center gap-3">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm">{{ fig.icon }}</span>
            <span>{{ fig.label }}</span>
          </div>
          <p class="pt-2 text-xs text-gray-400">
            Estimasi waktu: <strong>15–20 menit</strong> · Figur yang tidak dikenal atau sudah meninggal dapat di-skip · Jawaban disimpan otomatis
          </p>
        </div>
        <button
          @click="currentStep = 4; $nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))"
          class="btn-primary w-full justify-center"
        >
          Mulai Penilaian →
        </button>
      </section>

      <!-- ══ STEPS 4–9: Satu figur per step ════════════════════════════════════ -->
      <section v-else-if="currentStep >= 4 && currentStep <= 9">
        <div class="mb-5 flex items-center gap-3">

          <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-400 text-xl">
            {{ currentFigure.icon }}
          </span>
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Figur {{ currentStep - 3 }} dari 6</p>
            <h2 class="text-lg font-bold text-gray-900">{{ currentFigure.label }}</h2>
          </div>
        </div>

        <!-- Tombol skip figur -->
        <div v-if="!figureSkipped[currentFigure.role]" class="mb-4">
          <button type="button" @click="skipFigure(currentFigure.role)"
            class="text-xs text-gray-400 underline underline-offset-2 hover:text-gray-600">
            Figur ini tidak dikenal / sudah meninggal — lewati
          </button>
        </div>
        <div v-else class="mb-4 rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500">
          Figur ini di-skip.
          <button type="button" @click="unskipFigure(currentFigure.role)" class="ml-2 text-brand-600 underline">Batalkan</button>
        </div>

        <!-- Soal per dimensi -->
        <template v-if="!figureSkipped[currentFigure.role]">
          <div v-if="familyQuestionsPending" class="flex items-center justify-center py-12 text-sm text-gray-400">
            <svg class="mr-2 h-4 w-4 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Memuat soal...
          </div>
          <div v-for="dim in DIMENSION_ORDER" :key="dim" class="mb-6">
            <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
              {{ DIM_LABELS[dim] }}
            </p>
            <div class="space-y-4">
              <div v-for="q in questionsByDim[dim]" :key="q.id" class="card p-4">
                <p class="mb-3 text-sm leading-relaxed text-gray-800">{{ q.text }}</p>
                <div class="space-y-2">
                  <div class="flex gap-2">
                    <button
                      v-for="score in [1, 2, 3, 4, 5]" :key="score"
                      type="button"
                      @click="setAnswer(currentFigure.role, q.id, score)"
                      class="flex h-9 w-9 items-center justify-center rounded-xl border text-sm font-semibold transition-all"
                      :class="getDraftAnswer(currentFigure.role, q.id) === score
                        ? 'border-brand-400 bg-brand-400 text-black shadow-sm scale-110'
                        : 'border-gray-200 bg-white text-gray-500 hover:border-brand-300'">
                      {{ score }}
                    </button>
                  </div>
                  <div class="flex flex-wrap justify-between gap-x-2 text-xs text-gray-400">
                    <span>1 = Sangat tidak sesuai</span>
                    <span>5 = Sangat sesuai</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>

        <!-- Navigasi figur -->
        <div class="mt-6 flex gap-3">
          <button @click="currentStep--; $nextTick(() => window.scrollTo({ top: 0, behavior: 'smooth' }))" type="button"
            class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
            ← Kembali
          </button>
          <button @click="saveFigureAndNext" :disabled="familySaving"
            class="btn-primary flex-1 justify-center">
            <svg v-if="familySaving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>{{ currentStep < 9 ? 'Simpan & Lanjut →' : 'Simpan Figur Terakhir →' }}</span>
          </button>
        </div>
        <p v-if="familySaveError" class="mt-2 text-xs text-red-500">{{ familySaveError }}</p>
      </section>

      <!-- ══ STEP 10: Review & Submit ═══════════════════════════════════════════ -->
      <section v-else-if="currentStep === 10" class="space-y-5">
        <div class="card p-5">
          <h2 class="mb-4 text-base font-bold text-gray-900">Ringkasan Pengisian</h2>
          <div class="space-y-2">
            <div v-for="fig in FIGURES" :key="fig.role"
              class="flex items-center justify-between rounded-lg px-3 py-2"
              :class="figureSummary[fig.role]?.done ? 'bg-emerald-50' : figureSummary[fig.role]?.skipped ? 'bg-gray-50' : 'bg-amber-50'">
              <div class="flex items-center gap-2">
                <span>{{ fig.icon }}</span>
                <span class="text-sm text-gray-800">{{ fig.label }}</span>
              </div>
              <span class="text-xs font-semibold"
                :class="figureSummary[fig.role]?.done ? 'text-emerald-600' : figureSummary[fig.role]?.skipped ? 'text-gray-400' : 'text-amber-600'">
                {{ figureSummary[fig.role]?.done ? '✓ Selesai' : figureSummary[fig.role]?.skipped ? 'Di-skip' : '● Belum' }}
              </span>
            </div>
          </div>
        </div>

        <div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          Pastikan minimal 1 figur telah diisi sebelum submit. Hasil tidak dapat diubah setelah dikirim.
        </div>

        <div class="flex gap-3">
          <button @click="currentStep = 9" type="button"
            class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
            ← Kembali
          </button>
          <button @click="submitAssessment" :disabled="familySubmitting || !hasAnyFigureDone"
            class="btn-primary flex-1 justify-center disabled:opacity-40">
            <svg v-if="familySubmitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <span>{{ familySubmitting ? 'Menghitung Fit-Gap...' : 'Submit & Lihat Hasil' }}</span>
          </button>
        </div>
        <p v-if="familySubmitError" class="text-xs text-red-500">{{ familySubmitError }}</p>
      </section>

    </main>
  </div>
</template>

<script setup>
const { data, pending: questionsPending } = await useFetch('/api/questions', { key: 'survey-questions', dedupe: 'cancel' })
const router = useRouter()
const { loadScript, executeRecaptcha } = useRecaptcha()

onMounted(loadScript)

// ── Family Assessment Constants ──────────────────────────────────────────────
const FIGURES = [
  { role: 'kakek_ayah', label: 'Kakek (dari pihak Ayah)', icon: '👴' },
  { role: 'nenek_ayah', label: 'Nenek (dari pihak Ayah)', icon: '👵' },
  { role: 'kakek_ibu',  label: 'Kakek (dari pihak Ibu)',  icon: '👴' },
  { role: 'nenek_ibu',  label: 'Nenek (dari pihak Ibu)',  icon: '👵' },
  { role: 'ayah',       label: 'Ayah',                     icon: '👨' },
  { role: 'ibu',        label: 'Ibu',                      icon: '👩' },
]
const DIMENSION_ORDER = ['ilmi', 'qiyadah', 'amali', 'karam', 'tarbiyah']
const DIM_LABELS = {
  ilmi:     'D1 · Hasab Ilmi — Tradisi Keilmuan',
  qiyadah:  'D2 · Hasab Qiyadah — Kepemimpinan & Ketahanan Mental',
  amali:    'D3 · Hasab Amali — Etos Kerja & Eksekusi',
  karam:    'D4 · Hasab Al-Karam — Kedermawanan, Empati & Filantropi',
  tarbiyah: 'D5 · Hasab Tarbiyah — Atmosfer Rumah & Pengasuhan',
}

// ── Family Assessment State ───────────────────────────────────────────────────
const RESUME_KEY = 'survey_resume_id'
// Init dari localStorage synchronous — cegah flash step 0 saat resume
const _storedId = import.meta.client ? (localStorage.getItem(RESUME_KEY) ?? '') : ''
const surveyPublicId = ref(_storedId)
const currentStep = ref(_storedId ? 3 : 0)

// ── Resume recovery ───────────────────────────────────────────────────────────
onMounted(async () => {
  if (!surveyPublicId.value) return
  // Restore draft figur dari localStorage
  const draftKey = `family-draft-${surveyPublicId.value}`
  const saved = localStorage.getItem(draftKey)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(familyDraft, parsed.draft ?? {})
      Object.assign(figureSkipped, parsed.skipped ?? {})
    } catch {}
  }
  // Verifikasi cookie masih valid; kalau sudah expired → reset ke step 0
  try {
    await $fetch(`/api/family-assessment/${surveyPublicId.value}/start`, { method: 'POST' })
  } catch (e) {
    const status = e?.response?.status ?? e?.statusCode
    if (status === 401 || status === 403 || status === 404) {
      localStorage.removeItem(RESUME_KEY)
      localStorage.removeItem(draftKey)
      surveyPublicId.value = ''
      currentStep.value = 0
    }
    // error lain (jaringan) — biarkan tetap di step 3, bisa retry
  }
})

const familyDraft = reactive({})  // { [role]: { [questionId]: score } }
const figureSkipped = reactive({})
const familySaving = ref(false)
const familySaveError = ref('')
const familySubmitting = ref(false)
const familySubmitError = ref('')
const familyIsDone = ref(false)
// Fetch family questions (client-side only, lazy)
const { data: familyQuestions, pending: familyQuestionsPending } = useFetch(
  '/api/family-assessment/questions',
  { server: false, lazy: true },
)

const questionsByDim = computed(() => {
  const qs = familyQuestions.value ?? []
  const map = {}
  for (const dim of DIMENSION_ORDER) map[dim] = qs.filter(q => q.dimension === dim)
  return map
})

const currentFigure = computed(() => FIGURES[currentStep.value - 4] ?? FIGURES[0])

const figureSummary = computed(() => {
  const result = {}
  for (const fig of FIGURES) {
    const skipped = !!figureSkipped[fig.role]
    const answered = Object.keys(familyDraft[fig.role] ?? {}).length
    result[fig.role] = { done: !skipped && answered > 0, skipped }
  }
  return result
})

const hasAnyFigureDone = computed(() => FIGURES.some(f => figureSummary.value[f.role]?.done))

function getDraftAnswer(role, questionId) {
  return familyDraft[role]?.[questionId]
}

function setAnswer(role, questionId, value) {
  if (!familyDraft[role]) familyDraft[role] = {}
  familyDraft[role][questionId] = value
  saveFamilyDraftToLocal()
}

function saveFamilyDraftToLocal() {
  if (!surveyPublicId.value) return
  localStorage.setItem(`family-draft-${surveyPublicId.value}`, JSON.stringify({
    draft: { ...familyDraft },
    skipped: { ...figureSkipped },
  }))
}

function skipFigure(role) {
  figureSkipped[role] = true
  saveFamilyDraftToLocal()
}

function unskipFigure(role) {
  figureSkipped[role] = false
  saveFamilyDraftToLocal()
}

async function saveFigureAndNext() {
  familySaveError.value = ''
  familySaving.value = true
  const role = currentFigure.value.role
  try {
    if (figureSkipped[role]) {
      await $fetch(`/api/family-assessment/${surveyPublicId.value}/figure/${role}`, {
        method: 'PUT',
        body: { isKnown: false, answers: [] },
      })
    } else {
      const answers = Object.entries(familyDraft[role] ?? {}).map(([qId, value]) => ({
        questionId: Number(qId),
        value,
      }))
      await $fetch(`/api/family-assessment/${surveyPublicId.value}/figure/${role}`, {
        method: 'PUT',
        body: { isKnown: true, answers },
      })
    }
    currentStep.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (e) {
    familySaveError.value = e?.data?.message ?? 'Gagal menyimpan. Coba lagi.'
  } finally {
    familySaving.value = false
  }
}

async function submitAssessment() {
  familySubmitError.value = ''
  familySubmitting.value = true
  try {
    await $fetch(`/api/family-assessment/${surveyPublicId.value}/submit`, { method: 'POST' })
    localStorage.removeItem(`family-draft-${surveyPublicId.value}`)
    localStorage.removeItem(RESUME_KEY)
    familyIsDone.value = true
    await router.push(`/results/${surveyPublicId.value}#fit-gap`)
  } catch (e) {
    familySubmitError.value = e?.data?.message ?? 'Gagal submit. Coba lagi.'
  } finally {
    familySubmitting.value = false
  }
}

// { label, dimension } — 6 item per dimensi, 24 total
const naturalResponseOptions = [
  // Kepemimpinan & Sosial (Qiyadah)
  { label: 'Suka bercerita atau berpidato di depan orang', dimension: 'qiyadah' },
  { label: 'Suka menjadi pemimpin dalam permainan kelompok', dimension: 'qiyadah' },
  { label: 'Senang membantu dan peduli terhadap teman', dimension: 'qiyadah' },
  { label: 'Suka mengorganisir kegiatan atau acara', dimension: 'qiyadah' },
  { label: 'Mudah bergaul dan cepat punya teman baru', dimension: 'qiyadah' },
  { label: 'Pandai meyakinkan atau mengajak orang lain', dimension: 'qiyadah' },
  // Intelektual & Keilmuan (Ilmi)
  { label: 'Kritis dan banyak bertanya "kenapa"', dimension: 'ilmi' },
  { label: 'Senang membaca atau mencari tahu hal baru', dimension: 'ilmi' },
  { label: 'Suka teka-teki, strategi, atau permainan logika', dimension: 'ilmi' },
  { label: 'Suka berdebat atau berargumentasi', dimension: 'ilmi' },
  { label: 'Senang menghafal (Quran, fakta, data)', dimension: 'ilmi' },
  { label: 'Tertarik dengan komputer, robotik, atau coding', dimension: 'ilmi' },
  // Praktikal & Teknis (Amali)
  { label: 'Suka bongkar-pasang atau merakit barang', dimension: 'amali' },
  { label: 'Suka membuat sesuatu dengan tangan (prakarya, masak, berkebun)', dimension: 'amali' },
  { label: 'Semangat kalau ada proyek atau tantangan nyata', dimension: 'amali' },
  { label: 'Suka berdagang / jual-beli kecil-kecilan', dimension: 'amali' },
  { label: 'Teliti dan suka merapikan barang atau jadwal', dimension: 'amali' },
  { label: 'Aktif bergerak dan suka olahraga atau tantangan fisik', dimension: 'amali' },
  // Seni & Spiritual (Wajdan)
  { label: 'Senang membantu teman yang kesusahan tanpa diminta', dimension: 'karam' },
  { label: 'Suka berbagi makanan, mainan, atau barang miliknya', dimension: 'karam' },
  { label: 'Mudah merasakan sedih atau senang bersama orang lain (empati)', dimension: 'karam' },
  { label: 'Sering menjadi penengah saat teman-temannya berselisih', dimension: 'karam' },
  { label: 'Senang berkontribusi dalam kegiatan sosial atau bakti sosial', dimension: 'karam' },
  { label: 'Rela mengalah demi menjaga kerukunan bersama', dimension: 'karam' },
]

const dimensionGroups = [
  { key: 'qiyadah', label: 'Kepemimpinan & Sosial' },
  { key: 'ilmi', label: 'Intelektual & Keilmuan' },
  { key: 'amali', label: 'Praktikal & Teknis' },
  { key: 'karam', label: 'Empati & Filantropi' },
]

const optionsByDimension = computed(() =>
  Object.fromEntries(
    dimensionGroups.map(g => [g.key, naturalResponseOptions.filter(o => o.dimension === g.key)])
  )
)

const form = reactive({
  // Step 0
  childName: '',
  childBirthDate: '',
  childGender: '',
  naturalResponses: [],
  customResponses: [], // [{ dimension: 'qiyadah'|'ilmi'|'amali'|'karam', text: string }]
  momentAntusias: '',
  // Step 1
  parentName: '',
  parentPhone: '',
  parentEmail: '',
  schoolCode: '',
  schoolConsent: false,
  voucherCode: '',
  // Survey
  nasabAnswers: {},
})

const loading = ref(false)
const submitting = ref(false)

// Voucher state
const voucherStatus = ref('') // '' | 'valid' | 'invalid'
const voucherError = ref('')
const voucherValidating = ref(false)
const validatedVoucherId = ref(null)

// School validation
const schoolStatus = ref('')
const schoolError = ref('')
const schoolValidating = ref(false)
const validatedSchoolName = ref('')
const validatedSchoolId = ref(null)

function resetSchool() {
  schoolStatus.value = ''
  schoolError.value = ''
  validatedSchoolName.value = ''
  validatedSchoolId.value = null
  form.schoolConsent = false
}

async function validateSchool() {
  const code = form.schoolCode.trim().toUpperCase()
  if (!code) return
  schoolValidating.value = true
  schoolStatus.value = ''
  schoolError.value = ''
  try {
    const res = await $fetch('/api/sekolah/validate-code', { method: 'POST', body: { code } })
    schoolStatus.value = 'valid'
    validatedSchoolName.value = res.schoolName
    validatedSchoolId.value = res.schoolId
  } catch (err) {
    schoolStatus.value = 'invalid'
    schoolError.value = err?.data?.message || 'Kode sekolah tidak ditemukan.'
    validatedSchoolId.value = null
  } finally {
    schoolValidating.value = false
  }
}

function resetVoucher() {
  voucherStatus.value = ''
  voucherError.value = ''
  validatedVoucherId.value = null
}

async function validateVoucher() {
  const code = form.voucherCode.trim()
  if (!code) return
  voucherValidating.value = true
  voucherStatus.value = ''
  voucherError.value = ''
  try {
    const res = await $fetch('/api/vouchers/validate', {
      method: 'POST',
      body: { code },
    })
    voucherStatus.value = 'valid'
    validatedVoucherId.value = res.voucherId
  } catch (err) {
    voucherStatus.value = 'invalid'
    voucherError.value = err?.data?.message || err?.message || 'Voucher tidak valid.'
    validatedVoucherId.value = null
  } finally {
    voucherValidating.value = false
  }
}

const loadingSteps = [
  'Membaca jawaban kamu...',
  'Menganalisis pola Nasab & Hasab...',
  'Menyusun persona potensi...',
  'Merancang rencana stimulasi mingguan...',
  'Menyiapkan laporan akhir...',
]
const loadingStep = ref(0)

const loadingFacts = [
  'Anak yang sering diajak berdiskusi tumbuh dengan kemampuan berpikir kritis lebih tinggi.',
  'Minat belajar anak terbentuk paling kuat antara usia 3–8 tahun — masa emas stimulasi.',
  'Framework Hasab mengelompokkan potensi ke dalam 4 dimensi: Al-Qiyadah, Al-Ilmi, Al-Amali, dan Al-Wajdan.',
  'Nasab bukan hanya silsilah darah — ia adalah warisan karakter dan kecenderungan jiwa.',
  'Stimulasi 20–30 menit per hari lebih efektif daripada satu sesi panjang seminggu sekali.',
  'Anak dengan dimensi Amali tinggi belajar paling baik melalui tangan — membuat dan merancang.',
  'Musik instrumental terbukti membantu anak dengan dimensi Wajdan memproses emosi dan ide.',
]
const currentFact = ref(0)
let stepTimer = null
let factTimer = null

function startLoadingAnimation() {
  loadingStep.value = 0
  currentFact.value = 0
  stepTimer = setInterval(() => {
    if (loadingStep.value < loadingSteps.length - 1) loadingStep.value++
  }, 2800)
  factTimer = setInterval(() => {
    currentFact.value = (currentFact.value + 1) % loadingFacts.length
  }, 4000)
}

function stopLoadingAnimation() {
  if (stepTimer) clearInterval(stepTimer)
  if (factTimer) clearInterval(factTimer)
}

onUnmounted(stopLoadingAnimation)

// Step 0-2 = survey form, step 3 = family intro, step 4-9 = 6 figur, step 10 = review & submit
const totalSteps = 11

const stepTitle = computed(() => {
  if (currentStep.value === 0) return 'Data Anak'
  if (currentStep.value === 1) return 'Data Orang Tua & Voucher'
  if (currentStep.value === 2) return 'Pertanyaan Nasab'
  if (currentStep.value === 3) return 'Analisis Hasab Keluarga'
  if (currentStep.value >= 4 && currentStep.value <= 9) return `Figur ${currentStep.value - 3} dari 6`
  return 'Ringkasan & Submit'
})

const validationError = ref('')

function addCustomResponse(dimension) {
  form.customResponses.push({ dimension, text: '' })
}

function removeCustomResponse(index) {
  form.customResponses.splice(index, 1)
}

function validateCurrentStep() {
  if (currentStep.value === 0) {
    if (!form.childName.trim()) return 'Nama anak wajib diisi.'
    if (!form.childBirthDate) return 'Tanggal lahir anak wajib diisi.'
    if (!form.childGender) return 'Jenis kelamin anak wajib dipilih.'
    if (form.naturalResponses.length < 3) return 'Pilih minimal 3 minat/respon alami anak.'
    return ''
  }
  if (currentStep.value === 1) {
    if (!form.parentName.trim()) return 'Nama orang tua / wali wajib diisi.'
    if (!form.parentPhone.trim()) return 'Nomor WhatsApp wajib diisi.'
    if (voucherStatus.value !== 'valid') return 'Masukkan kode voucher yang valid untuk melanjutkan.'
    return ''
  }
  if (currentStep.value === 2) {
    const questions = data.value?.nasabQuestions || []
    const unanswered = questions.find(q => form.nasabAnswers[q.id] === undefined)
    if (unanswered) return 'Semua pertanyaan nasab wajib dijawab.'
    return ''
  }
  return ''
}

function nextStep() {
  const err = validateCurrentStep()
  if (err) {
    validationError.value = err
    return
  }
  validationError.value = ''
  currentStep.value++
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function prevStep() {
  validationError.value = ''
  currentStep.value--
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

async function submitSurvey() {
  if (submitting.value) return
  // Survey sudah dibuat — langsung lanjut ke family assessment tanpa re-submit
  if (surveyPublicId.value) {
    currentStep.value = 3
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  submitting.value = true
  loading.value = true
  startLoadingAnimation()
  try {
    const payload = {
      parentName: form.parentName,
      parentPhone: form.parentPhone,
      parentEmail: form.parentEmail || null,
      voucherId: validatedVoucherId.value,
      voucherCode: form.voucherCode.trim().toUpperCase(),
      schoolId: validatedSchoolId.value,
      schoolCode: form.schoolCode.trim().toUpperCase() || null,
      schoolConsent: form.schoolConsent,
      childName: form.childName,
      childBirthDate: form.childBirthDate,
      childGender: form.childGender,
      naturalResponses: [
        ...form.naturalResponses,
        ...form.customResponses.filter(c => c.text.trim()).map(c => `[${c.dimension}] ${c.text.trim()}`),
        form.momentAntusias ? `Momen antusias: ${form.momentAntusias}` : '',
      ].filter(Boolean),
      nasabAnswers: form.nasabAnswers,
    }
    const recaptchaToken = await executeRecaptcha('survey_submit')
    const { surveyId } = await $fetch('/api/surveys', { method: 'POST', body: { ...payload, recaptchaToken } })
    surveyPublicId.value = surveyId
    localStorage.setItem(RESUME_KEY, surveyId)
    // Start family assessment on the server (same session, no redirect needed)
    await $fetch(`/api/family-assessment/${surveyId}/start`, { method: 'POST' })
    stopLoadingAnimation()
    loading.value = false
    submitting.value = false
    currentStep.value = 3
    window.scrollTo({ top: 0, behavior: 'smooth' })
  } catch (err) {
    const message = err?.data?.message || err?.statusMessage || err?.message || 'Gagal menyimpan survey. Silakan coba lagi.'
    console.error('[submitSurvey]', err)
    alert(message)
    stopLoadingAnimation()
    loading.value = false
    submitting.value = false
  }
}
</script>

<style scoped>
.fade-overlay-enter-active,
.fade-overlay-leave-active {
  transition: opacity 0.3s ease;
}
.fade-overlay-enter-from,
.fade-overlay-leave-to {
  opacity: 0;
}

.fact-swap-enter-active,
.fact-swap-leave-active {
  transition: opacity 0.4s ease, transform 0.4s ease;
}
.fact-swap-enter-from {
  opacity: 0;
  transform: translateY(6px);
}
.fact-swap-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
