<template>
  <div class="min-h-screen bg-gray-25 font-body">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <NuxtLink to="/" class="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        PetaBakat
      </NuxtLink>
      <span class="text-xs font-medium text-gray-500">Langkah {{ currentStep + 1 }} dari {{ totalSteps }}</span>
    </header>

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

        <!-- STEP 0: Data Orang Tua & Anak -->
        <section v-if="currentStep === 0" class="space-y-5">
          <div>
            <h2 class="text-xl font-bold text-gray-950">Data Orang Tua & Anak</h2>
            <p class="mt-1 text-sm text-gray-500">Informasi ini digunakan untuk personalisasi laporan.</p>
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
        </section>

        <!-- STEP 1: Pertanyaan Nasab -->
        <section v-else-if="currentStep === 1" class="space-y-5">
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

        <!-- STEP 2+: Satu pertanyaan Hasab per step -->
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
            <div class="flex items-center justify-between gap-2">
              <span class="text-xs text-gray-400">Tidak setuju</span>
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
              <span class="text-xs text-gray-400">Setuju</span>
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

          <!-- Hasab steps: auto-advance, hanya tampil hint -->
          <p v-if="currentHasabQuestion && currentStep < totalSteps - 1" class="text-xs text-gray-400">
            Pilih untuk lanjut otomatis
          </p>

          <!-- Step data & nasab: tombol manual -->
          <button
            v-else-if="!currentHasabQuestion && currentStep < totalSteps - 1"
            type="button"
            class="btn-primary px-5 py-2.5"
            @click="nextStep"
          >
            Lanjut →
          </button>

          <!-- Submit step terakhir -->
          <button
            v-else-if="currentStep === totalSteps - 1"
            type="submit"
            :disabled="loading"
            class="btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg v-if="loading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ loading ? 'Memproses...' : 'Lihat Hasil' }}
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
  'Suka bongkar-pasang barang',
  'Suka menggambar/mewarnai',
  'Suka bercerita/berpidato',
  'Kritis banyak bertanya',
  'Supel dan senang bergaul',
  'Suka menyusun/membuat sesuatu',
  'Peka dengan musik/suara',
  'Senang membantu orang lain',
]

const form = reactive({
  parentName: '',
  parentPhone: '',
  childName: '',
  childBirthDate: '',
  childGender: '',
  naturalResponses: [],
  naturalResponseOther: '',
  nasabAnswers: {},
  hasabAnswers: {},
})

const currentStep = ref(0)
const loading = ref(false)

// Flatten & shuffle semua hasab questions saat data tersedia, order tetap selama sesi
const shuffledHasabQuestions = ref([])
watch(data, (val) => {
  if (!val?.categories) return
  const all = val.categories.flatMap(cat =>
    cat.questions.map(q => ({ ...q, categoryName: cat.name, categoryCode: cat.code }))
  )
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]]
  }
  shuffledHasabQuestions.value = all
}, { immediate: true })

// Step 0 = data, step 1 = nasab, step 2..N = satu hasab per step
const totalSteps = computed(() => 2 + shuffledHasabQuestions.value.length)

const currentHasabQuestion = computed(() => {
  if (currentStep.value < 2) return null
  return shuffledHasabQuestions.value[currentStep.value - 2] || null
})

const stepTitle = computed(() => {
  if (currentStep.value === 0) return 'Data Orang Tua & Anak'
  if (currentStep.value === 1) return 'Pertanyaan Nasab'
  return currentHasabQuestion.value?.categoryName || 'Pertanyaan Hasab'
})

const validationError = ref('')

function validateCurrentStep() {
  if (currentStep.value === 0) {
    if (!form.parentName.trim()) return 'Nama orang tua / wali wajib diisi.'
    if (!form.parentPhone.trim()) return 'Nomor WhatsApp wajib diisi.'
    if (!form.childName.trim()) return 'Nama anak wajib diisi.'
    if (!form.childBirthDate) return 'Tanggal lahir anak wajib diisi.'
    if (!form.childGender) return 'Jenis kelamin anak wajib dipilih.'
    return ''
  }
  if (currentStep.value === 1) {
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
  // auto-advance setelah 300ms
  setTimeout(() => {
    if (currentStep.value < totalSteps.value - 1) {
      nextStep()
    }
  }, 300)
}

async function submitSurvey() {
  loading.value = true
  try {
    const payload = {
      parentName: form.parentName,
      parentPhone: form.parentPhone,
      childName: form.childName,
      childBirthDate: form.childBirthDate,
      childGender: form.childGender,
      naturalResponses: [...form.naturalResponses, form.naturalResponseOther].filter(Boolean),
      nasabAnswers: form.nasabAnswers,
      hasabAnswers: form.hasabAnswers,
    }
    const { surveyId } = await $fetch('/api/surveys', { method: 'POST', body: payload })
    await router.push(`/results/${surveyId}`)
  } catch (err) {
    alert('Gagal menyimpan survey. Silakan coba lagi.')
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>
