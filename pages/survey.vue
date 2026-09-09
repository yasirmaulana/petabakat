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

          <div class="card p-5">
            <label class="label-text mb-3 block">Minat / Respon Alami Anak <span class="font-normal text-gray-400">(pilih semua yang sesuai)</span></label>
            <div class="grid gap-2.5 sm:grid-cols-2">
              <label
                v-for="option in naturalResponseOptions"
                :key="option"
                class="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 transition-colors hover:border-brand-300 hover:bg-brand-25"
                :class="{ 'border-brand-400 bg-brand-50': form.naturalResponses.includes(option) }"
              >
                <input v-model="form.naturalResponses" type="checkbox" :value="option" class="h-4 w-4 accent-black shrink-0" />
                <span class="text-sm text-gray-700">{{ option }}</span>
              </label>
            </div>
            <input v-model="form.naturalResponseOther" placeholder="Lainnya..." class="input-field mt-3" />
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

        <!-- STEP 3+: Satu pertanyaan Hasab per step -->
        <section v-else-if="currentHasabQuestion" class="space-y-5">
          <div>
            <div class="mb-2 flex items-center gap-2">
              <span class="rounded-full border border-brand-300 bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                {{ currentHasabQuestion.categoryName }}
              </span>
            </div>
            <h2 class="text-xl font-bold text-gray-950">{{ currentHasabQuestion.text }}</h2>
            <p class="mt-2 text-sm text-gray-500">Nilai 1 = sangat tidak setuju &nbsp;·&nbsp; 5 = sangat setuju</p>
          </div>

          <div class="card p-6">
            <div class="flex items-center justify-center gap-2">
              <div class="flex gap-3">
                <button
                  v-for="score in [1, 2, 3, 4, 5]"
                  :key="score"
                  type="button"
                  class="flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 transition-all hover:border-brand-400 hover:bg-brand-50 active:scale-95"
                  :class="{ 'border-brand-400 bg-brand-400 text-black shadow-xs scale-105': form.hasabAnswers[currentHasabQuestion.id] === score }"
                  @click="selectHasabScore(currentHasabQuestion.id, score)"
                >
                  {{ score }}
                </button>
              </div>
            </div>
          </div>
        </section>

        <!-- Validation error -->
        <p v-if="validationError" class="mt-6 rounded-xl border border-error-100 bg-error-50 px-4 py-3 text-sm text-error-600">
          {{ validationError }}
        </p>

        <!-- Navigation -->
        <div class="mt-4 flex items-center justify-between">
          <button
            v-if="currentStep > 0"
            type="button"
            class="btn-secondary px-5 py-2.5"
            @click="prevStep"
          >
            ← Sebelumnya
          </button>
          <div v-else />

          <!-- Hasab steps: auto-advance hint -->
          <p v-if="currentHasabQuestion && currentStep < totalSteps - 1" class="text-xs text-gray-400">
            Pilih untuk lanjut otomatis
          </p>

          <!-- Step 0, 1, 2: tombol manual Lanjut -->
          <button
            v-else-if="!currentHasabQuestion && currentStep < totalSteps - 1"
            type="button"
            class="btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
            :disabled="currentStep === 1 && voucherStatus !== 'valid'"
            @click="nextStep"
          >
            Lanjut →
          </button>

          <!-- Submit step terakhir -->
          <button
            v-else-if="currentStep === totalSteps - 1"
            type="submit"
            :disabled="loading || submitting"
            class="btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg v-if="loading || submitting" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading || submitting ? 'Memproses...' : 'Lihat Hasil' }}
          </button>
        </div>

      </form>
    </main>
  </div>
</template>

<script setup>
const { data } = await useFetch('/api/questions')
const router = useRouter()

const naturalResponseOptions = [
  // Kepemimpinan & Sosial (Qiyadah)
  'Suka bercerita atau berpidato di depan orang',
  'Suka menjadi pemimpin dalam permainan kelompok',
  'Senang membantu dan peduli terhadap teman',
  'Suka mengorganisir kegiatan atau acara',
  'Mudah bergaul dan cepat punya teman baru',
  // Intelektual & Keilmuan (Ilmi)
  'Kritis dan banyak bertanya "kenapa"',
  'Senang membaca atau mencari tahu hal baru',
  'Suka teka-teki, strategi, atau permainan logika',
  'Suka berdebat atau berargumentasi',
  'Senang menghafal (Quran, fakta, data)',
  // Bisnis & Teknis (Amali)
  'Suka bongkar-pasang atau merakit barang',
  'Suka membuat sesuatu dengan tangan (prakarya, masak, berkebun)',
  'Semangat kalau ada proyek atau tantangan nyata',
  'Suka berdagang / jual-beli kecil-kecilan',
  'Teliti dan suka merapikan barang atau jadwal',
  // Seni & Spiritual (Wajdan)
  'Suka menggambar, mewarnai, atau berkarya visual',
  'Peka dengan musik, suara, atau irama',
  'Mudah merasakan suasana hati orang lain / peka secara emosi',
  'Suka bercerita lewat tulisan atau gambar komik',
  'Senang dengan kegiatan rohani (mengaji, dzikir, doa)',
  // Olahraga & Fisik
  'Aktif bergerak dan suka olahraga tim',
  'Suka tantangan fisik (panjat, lari, renang)',
  // Teknologi & Digital
  'Tertarik dengan komputer, robotik, atau coding',
  'Suka bermain game strategi atau simulasi',
]

const form = reactive({
  // Step 0
  childName: '',
  childBirthDate: '',
  childGender: '',
  naturalResponses: [],
  naturalResponseOther: '',
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
  hasabAnswers: {},
})

const currentStep = ref(0)
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

// Flatten & shuffle all hasab questions, order fixed for the session
const shuffledHasabQuestions = ref([])
watch(data, (val) => {
  if (!val?.categories) return
  const all = val.categories.flatMap(cat =>
    cat.questions.map(q => ({ ...q, categoryName: cat.name, categoryCode: cat.code }))
  )
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]]
  }
  shuffledHasabQuestions.value = all
}, { immediate: true })

// Step 0 = child data, step 1 = parent+voucher, step 2 = nasab, step 3..N = hasab
const totalSteps = computed(() => 3 + shuffledHasabQuestions.value.length)

const currentHasabQuestion = computed(() => {
  if (currentStep.value < 3) return null
  return shuffledHasabQuestions.value[currentStep.value - 3] || null
})

const stepTitle = computed(() => {
  if (currentStep.value === 0) return 'Data Anak'
  if (currentStep.value === 1) return 'Data Orang Tua & Voucher'
  if (currentStep.value === 2) return 'Pertanyaan Nasab'
  return currentHasabQuestion.value?.categoryName || 'Pertanyaan Hasab'
})

const validationError = ref('')

function validateCurrentStep() {
  if (currentStep.value === 0) {
    if (!form.childName.trim()) return 'Nama anak wajib diisi.'
    if (!form.childBirthDate) return 'Tanggal lahir anak wajib diisi.'
    if (!form.childGender) return 'Jenis kelamin anak wajib dipilih.'
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

function selectHasabScore(questionId, score) {
  form.hasabAnswers[questionId] = score
  setTimeout(() => {
    if (currentStep.value < totalSteps.value - 1) {
      nextStep()
    }
  }, 300)
}

async function submitSurvey() {
  if (submitting.value) return
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
        form.naturalResponseOther,
        form.momentAntusias ? `Momen antusias: ${form.momentAntusias}` : '',
      ].filter(Boolean),
      nasabAnswers: form.nasabAnswers,
      hasabAnswers: form.hasabAnswers,
    }
    const { surveyId } = await $fetch('/api/surveys', { method: 'POST', body: payload })
    await router.push(`/results/${surveyId}`)
  } catch (err) {
    const message = err?.statusMessage || err?.message || 'Gagal menyimpan survey. Silakan coba lagi.'
    alert(message)
    console.error(err)
  } finally {
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
