<template>
  <div class="min-h-screen bg-gray-50 font-body">

    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-2xl items-center justify-between px-4 py-3 sm:px-6">
        <NuxtLink :to="`/results/${surveyId}`"
          class="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Laporan Anak
        </NuxtLink>
        <span class="text-xs text-gray-400">Hasab Keluarga</span>
      </div>
      <!-- Progress bar -->
      <div class="h-1 bg-gray-100">
        <div class="h-1 bg-brand-400 transition-all duration-300"
          :style="{ width: `${progressPct}%` }" />
      </div>
    </header>

    <main class="mx-auto max-w-2xl px-4 py-6 sm:px-6">

      <!-- ── Error auth ── -->
      <div v-if="assessmentFetchError" class="rounded-2xl border border-red-100 bg-red-50 px-6 py-8 text-center">
        <p class="text-sm font-medium text-red-600">{{ assessmentFetchError }}</p>
        <NuxtLink to="/survey" class="btn-primary mt-4 inline-flex">Mulai Survey Baru</NuxtLink>
      </div>

      <!-- ── Loading soal ── -->
      <div v-else-if="questionsPending || assessmentPending" class="flex flex-col items-center gap-3 py-24 text-center">
        <svg class="h-7 w-7 animate-spin text-brand-400" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p class="text-sm text-gray-400">Menyiapkan formulir...</p>
      </div>

      <!-- ── Sudah selesai ── -->
      <div v-else-if="isDone" class="py-16 text-center">
        <div class="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-3xl">✅</div>
        <h2 class="text-xl font-bold text-gray-900">Penilaian Keluarga Selesai!</h2>
        <p class="mt-2 text-sm text-gray-500">Hasil Fit-Gap sudah dihitung dan tersedia di laporan anak.</p>
        <NuxtLink :to="`/results/${surveyId}#fit-gap`"
          class="btn-primary mt-6 inline-flex">Lihat Hasil Fit-Gap</NuxtLink>
      </div>

      <template v-else-if="questions.length && assessment">

        <!-- ── Step 0: Intro ── -->
        <section v-if="currentStep === 0" class="space-y-5">
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
            @click="currentStep = 1"
            :disabled="questionsPending || assessmentPending || !assessment"
            class="btn-primary w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg v-if="questionsPending || assessmentPending || !assessment" class="mr-2 h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ (questionsPending || assessmentPending || !assessment) ? 'Memuat...' : 'Mulai Penilaian →' }}
          </button>
        </section>

        <!-- ── Step 1–6: Satu figur per step ── -->
        <section v-else-if="currentStep >= 1 && currentStep <= 6">
          <div class="mb-5 flex items-center gap-3">
            <span class="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-400 text-xl">
              {{ currentFigure.icon }}
            </span>
            <div>
              <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Figur {{ currentStep }} dari 6</p>
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
            <div v-for="dim in DIMENSION_ORDER" :key="dim" class="mb-6">
              <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400">
                {{ DIM_LABELS[dim] }}
              </p>
              <div class="space-y-4">
                <div v-for="q in questionsByDim[dim]" :key="q.id"
                  class="card p-4">
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
                    <div class="flex justify-between text-xs text-gray-400">
                      <span>1 = Sangat tidak sesuai</span>
                      <span>2 = Tidak sesuai</span>
                      <span>3 = Cukup sesuai</span>
                      <span>4 = Sesuai</span>
                      <span>5 = Sangat sesuai</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </template>

          <!-- Navigasi figur -->
          <div class="mt-6 flex gap-3">
            <button @click="currentStep--" type="button"
              class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
              ← Kembali
            </button>
            <button @click="saveFigureAndNext" :disabled="saving"
              class="btn-primary flex-1 justify-center">
              <svg v-if="saving" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>{{ currentStep < 6 ? 'Simpan & Lanjut →' : 'Simpan Figur Terakhir →' }}</span>
            </button>
          </div>
          <p v-if="saveError" class="mt-2 text-xs text-red-500">{{ saveError }}</p>
        </section>

        <!-- ── Step 7: Review & Submit ── -->
        <section v-else-if="currentStep === 7" class="space-y-5">
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
            <button @click="currentStep = 6" type="button"
              class="rounded-xl border border-gray-200 px-5 py-2.5 text-sm text-gray-600 hover:bg-gray-50">
              ← Kembali
            </button>
            <button @click="submitAssessment" :disabled="submitting || !hasAnyFigureDone"
              class="btn-primary flex-1 justify-center disabled:opacity-40">
              <svg v-if="submitting" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              <span>{{ submitting ? 'Menghitung Fit-Gap...' : 'Submit & Lihat Hasil' }}</span>
            </button>
          </div>
          <p v-if="submitError" class="text-xs text-red-500">{{ submitError }}</p>
        </section>

      </template>
    </main>
  </div>
</template>

<script setup lang="ts">
const route = useRoute()
const router = useRouter()
const surveyId = route.params.surveyId as string

useSeoMeta({
  title: 'Penilaian Hasab Keluarga — PetaMinatBakat',
  robots: 'noindex',
})

// ── Konstanta ──────────────────────────────────────────────────────────────────

const FIGURES = [
  { role: 'kakek_ayah', label: 'Kakek (dari pihak Ayah)', icon: '👴' },
  { role: 'nenek_ayah', label: 'Nenek (dari pihak Ayah)', icon: '👵' },
  { role: 'kakek_ibu',  label: 'Kakek (dari pihak Ibu)',  icon: '👴' },
  { role: 'nenek_ibu',  label: 'Nenek (dari pihak Ibu)',  icon: '👵' },
  { role: 'ayah',       label: 'Ayah',                     icon: '👨' },
  { role: 'ibu',        label: 'Ibu',                      icon: '👩' },
]

const DIMENSION_ORDER = ['ilmi', 'qiyadah', 'amali', 'wajdan', 'tarbiyah'] as const
const DIM_LABELS: Record<string, string> = {
  ilmi:     'D1 · Hasab Ilmi — Tradisi Keilmuan',
  qiyadah:  'D2 · Hasab Qiyadah — Kepemimpinan & Ketahanan Mental',
  amali:    'D3 · Hasab Amali — Etos Kerja & Eksekusi',
  wajdan:   'D4 · Hasab Wajdan — Nilai Moral, Empati & Spiritual',
  nurture:  'D5 · Hasab Nurture — Atmosfer Rumah & Pengasuhan',
}

// ── State ──────────────────────────────────────────────────────────────────────

const currentStep = ref(0) // 0=intro, 1-6=figur, 7=review
const saving = ref(false)
const saveError = ref('')
const submitting = ref(false)
const submitError = ref('')
const isDone = ref(false)

// Draft jawaban per figur: { [role]: { [questionId]: score } }
const draft = reactive<Record<string, Record<number, number>>>({})
// Figur yang di-skip
const figureSkipped = reactive<Record<string, boolean>>({})

// ── Fetch data ─────────────────────────────────────────────────────────────────

const { data: questions, pending: questionsPending } = useFetch<{
  id: number; code: string; dimension: string; order: number; text: string
}[]>('/api/family-assessment/questions', { server: false })

// Mulai / resume assessment
const assessmentFetchError = ref<string | null>(null)
const { data: assessmentData, pending: assessmentPending } = useFetch(
  `/api/family-assessment/${surveyId}`,
  {
    server: false,
    onResponseError({ response }) {
      if (response.status === 401) {
        assessmentFetchError.value = 'Sesi tidak ditemukan. Silakan ulangi pengisian survey dari awal.'
      } else {
        assessmentFetchError.value = `Gagal memuat data (${response.status}). Coba muat ulang halaman.`
      }
    },
  },
)

// Ambil ID figur dari server setelah start
const assessment = ref<{ figures: { id: number; role: string }[] } | null>(null)

// Auto-start dan hydrate draft dari localStorage
onMounted(async () => {
  // Coba load draft dari localStorage
  const saved = localStorage.getItem(`family-draft-${surveyId}`)
  if (saved) {
    try {
      const parsed = JSON.parse(saved)
      Object.assign(draft, parsed.draft ?? {})
      Object.assign(figureSkipped, parsed.skipped ?? {})
    } catch {}
  }

  // Tunggu fetch selesai
  await until(assessmentPending).toBe(false)

  if (assessmentData.value?.exists && assessmentData.value.assessment) {
    const a = assessmentData.value.assessment
    if (a.status === 'completed') { isDone.value = true; return }
    assessment.value = { figures: a.figures.map((f: { id: number; role: string }) => ({ id: f.id, role: f.role })) }
    // Hydrate existing server answers into draft
    for (const fig of a.figures as { role: string; answers: { question: { id: number }; value: number }[] }[]) {
      if (!draft[fig.role]) draft[fig.role] = {}
      for (const ans of fig.answers) {
        if (!draft[fig.role][ans.question.id]) draft[fig.role][ans.question.id] = ans.value
      }
    }
  } else {
    // Buat baru
    try {
      const res = await $fetch<{ assessmentPublicId: string; figures: { id: number; role: string }[] }>(
        `/api/family-assessment/${surveyId}/start`,
        { method: 'POST' },
      )
      assessment.value = { figures: res.figures }
    } catch (e: unknown) {
      const msg = (e as { data?: { message?: string } })?.data?.message ?? 'Gagal memulai assessment.'
      saveError.value = msg
    }
  }
})

// ── Computed ───────────────────────────────────────────────────────────────────

const currentFigure = computed(() => FIGURES[currentStep.value - 1] ?? FIGURES[0])

const questionsByDim = computed(() => {
  const qs = questions.value ?? []
  const map: Record<string, typeof qs> = {}
  for (const dim of DIMENSION_ORDER) map[dim] = qs.filter((q) => q.dimension === dim)
  return map
})

const progressPct = computed(() => Math.round((currentStep.value / 7) * 100))

const figureSummary = computed(() => {
  const result: Record<string, { done: boolean; skipped: boolean }> = {}
  for (const fig of FIGURES) {
    const skipped = !!figureSkipped[fig.role]
    const answered = Object.keys(draft[fig.role] ?? {}).length
    result[fig.role] = { done: !skipped && answered > 0, skipped }
  }
  return result
})

const hasAnyFigureDone = computed(() =>
  FIGURES.some((f) => figureSummary.value[f.role]?.done),
)

// ── Methods ────────────────────────────────────────────────────────────────────

function getDraftAnswer(role: string, questionId: number): number | undefined {
  return draft[role]?.[questionId]
}

function setAnswer(role: string, questionId: number, value: number) {
  if (!draft[role]) draft[role] = {}
  draft[role][questionId] = value
  saveDraftToLocal()
}

function saveDraftToLocal() {
  localStorage.setItem(`family-draft-${surveyId}`, JSON.stringify({
    draft: toRaw(draft),
    skipped: toRaw(figureSkipped),
  }))
}

function skipFigure(role: string) {
  figureSkipped[role] = true
  saveDraftToLocal()
}

function unskipFigure(role: string) {
  figureSkipped[role] = false
  saveDraftToLocal()
}

async function saveFigureAndNext() {
  saveError.value = ''
  saving.value = true
  const role = currentFigure.value.role
  try {
    if (figureSkipped[role]) {
      await $fetch(`/api/family-assessment/${surveyId}/figure/${role}`, {
        method: 'PUT',
        body: { isKnown: false, answers: [] },
      })
    } else {
      const answers = Object.entries(draft[role] ?? {}).map(([qId, value]) => ({
        questionId: Number(qId),
        value,
      }))
      await $fetch(`/api/family-assessment/${surveyId}/figure/${role}`, {
        method: 'PUT',
        body: { isKnown: true, answers },
      })
    }
    currentStep.value++
  } catch (e: unknown) {
    saveError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Gagal menyimpan. Coba lagi.'
  } finally {
    saving.value = false
  }
}

async function submitAssessment() {
  submitError.value = ''
  submitting.value = true
  try {
    await $fetch(`/api/family-assessment/${surveyId}/submit`, { method: 'POST' })
    localStorage.removeItem(`family-draft-${surveyId}`)
    isDone.value = true
    await router.push(`/results/${surveyId}#fit-gap`)
  } catch (e: unknown) {
    submitError.value = (e as { data?: { message?: string } })?.data?.message ?? 'Gagal submit. Coba lagi.'
  } finally {
    submitting.value = false
  }
}

// Helper: until (pakai polling sederhana tanpa VueUse)
function until(flag: Ref<boolean>) {
  return {
    toBe: (val: boolean) =>
      new Promise<void>((resolve) => {
        if (flag.value === val) { resolve(); return }
        const stop = watch(flag, (v) => { if (v === val) { stop(); resolve() } })
      }),
  }
}
</script>
