<template>
  <div class="min-h-screen bg-gray-25 font-body">
    <!-- Header -->
    <header class="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <NuxtLink to="/" class="flex items-center gap-2 text-sm font-semibold text-gray-900 hover:text-gray-600 transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Beranda
      </NuxtLink>
      <button
        v-if="step === 'result'"
        type="button"
        class="text-sm font-medium text-gray-500 hover:text-gray-900"
        @click="logout"
      >
        Ganti nomor
      </button>
    </header>

    <main class="mx-auto max-w-2xl px-4 py-8 sm:px-6 sm:py-12">
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-950">Riwayat Hasil Survey</h1>
        <p class="mt-1 text-sm text-gray-500">
          {{ step === 'phone' ? 'Masukkan nomor WhatsApp yang digunakan saat survey.' : step === 'otp' ? 'Masukkan kode OTP yang dikirim ke WhatsApp Anda.' : '' }}
        </p>
      </div>

      <!-- Error -->
      <p v-if="errorMsg" class="mb-5 rounded-xl border border-error-100 bg-error-50 px-4 py-3 text-sm text-error-600">
        {{ errorMsg }}
      </p>

      <!-- Step 1: Input nomor HP -->
      <form v-if="step === 'phone'" class="mb-8 flex gap-3" @submit.prevent="sendOtp">
        <input
          v-model="phone"
          type="tel"
          placeholder="0812xxxxxxxx"
          required
          class="input-field flex-1"
        />
        <button
          type="submit"
          :disabled="loading"
          class="btn-primary px-5 py-2.5 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg v-if="loading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Mengirim...' : 'Kirim OTP' }}
        </button>
      </form>

      <!-- Step 2: Input OTP -->
      <form v-else-if="step === 'otp'" class="mb-8 space-y-4" @submit.prevent="verifyOtp">
        <div class="rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          Kode OTP dikirim ke WhatsApp <strong>{{ phone }}</strong>.
          <button type="button" class="ml-1 underline hover:no-underline" @click="reset">Ganti nomor</button>
        </div>

        <!-- 6 kotak OTP -->
        <div class="flex justify-center gap-2 sm:gap-3">
          <input
            v-for="(_, i) in otpDigits"
            :key="i"
            :ref="el => { if (el) otpRefs[i] = el }"
            v-model="otpDigits[i]"
            type="text"
            inputmode="numeric"
            maxlength="1"
            class="h-14 w-12 rounded-xl border border-gray-200 bg-white text-center text-xl font-bold text-gray-950 outline-none transition-all focus:border-brand-400 focus:ring-2 focus:ring-brand-200 sm:h-16 sm:w-14"
            :class="{ 'border-brand-400 bg-brand-50': otpDigits[i] }"
            @input="onOtpInput(i, $event)"
            @keydown="onOtpKeydown(i, $event)"
            @paste="onOtpPaste($event)"
          />
        </div>

        <button
          type="submit"
          :disabled="loading || otpCode.length < 6"
          class="btn-primary-full disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg v-if="loading" class="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          {{ loading ? 'Memverifikasi...' : 'Verifikasi' }}
        </button>

        <p class="text-center text-xs text-gray-400">
          Tidak dapat OTP?
          <button
            v-if="resendCountdown > 0"
            type="button"
            disabled
            class="text-gray-400"
          >Kirim ulang ({{ resendCountdown }}s)</button>
          <button
            v-else
            type="button"
            class="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2"
            @click="resendOtp"
          >Kirim ulang</button>
        </p>
      </form>

      <!-- Results -->
      <template v-if="step === 'result' && result?.found">
        <p class="mb-4 text-sm text-gray-600">
          Halo <strong class="text-gray-900">{{ result.parent.name }}</strong>,
          ditemukan <strong class="text-gray-900">{{ result.surveys.length }}</strong> hasil survey.
        </p>

        <div class="space-y-4">
          <div
            v-for="survey in result.surveys"
            :key="survey.surveyId"
            class="card p-5 transition-shadow hover:shadow-md"
          >
            <div class="mb-4 flex items-start justify-between gap-4">
              <div>
                <h3 class="font-semibold text-gray-950">{{ survey.childName }}</h3>
                <p class="mt-0.5 text-xs text-gray-400">{{ formatDate(survey.completedAt) }}</p>
              </div>
              <NuxtLink
                v-if="survey.status === 'completed'"
                :to="`/results/${survey.surveyId}`"
                class="btn-secondary shrink-0 px-3 py-1.5 text-xs"
              >
                Lihat Detail →
              </NuxtLink>
              <span
                v-else
                class="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700"
              >
                <svg class="h-3 w-3 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Diproses
              </span>
            </div>

            <div v-if="survey.result" class="grid grid-cols-4 gap-2">
              <div
                v-for="item in scoreItems"
                :key="item.code"
                class="rounded-xl border border-gray-100 bg-gray-25 p-3 text-center"
                :class="{ 'border-brand-300 bg-brand-50': item.code === survey.result.dominantHasab }"
              >
                <div class="text-base">{{ item.icon }}</div>
                <div class="mt-1 text-xs text-gray-500">{{ item.label }}</div>
                <div class="text-lg font-bold text-gray-950">{{ survey.result[item.scoreKey] }}</div>
              </div>
            </div>

            <div v-if="survey.result?.personaLabel" class="mt-3">
              <span class="inline-flex items-center rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                {{ survey.result.personaLabel }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
// step: 'phone' | 'otp' | 'result'
const step = ref('phone')
const phone = ref('')
const otpDigits = ref(['', '', '', '', '', ''])
const otpRefs = ref([])
const loading = ref(false)
const errorMsg = ref('')
const result = ref(null)
const resendCountdown = ref(0)

let countdownTimer = null

const otpCode = computed(() => otpDigits.value.join(''))

const scoreItems = [
  { code: 'asyiha', label: 'Asyiha', icon: '🤝', scoreKey: 'scoreAsyiha' },
  { code: 'ilmi',   label: 'Ilmi',   icon: '📚', scoreKey: 'scoreIlmi'   },
  { code: 'amali',  label: 'Amali',  icon: '🛠️', scoreKey: 'scoreAmali'  },
  { code: 'wajdan', label: 'Wajdan', icon: '🎨', scoreKey: 'scoreWajdan' },
]

onMounted(async () => {
  loading.value = true
  try {
    const data = await $fetch('/api/history')
    if (data.authenticated && data.found) {
      result.value = data
      step.value = 'result'
    }
  } catch (err) {
    console.error('Failed to restore history session', err)
  } finally {
    loading.value = false
  }
})

function onOtpInput(i, event) {
  const val = event.target.value.replace(/\D/g, '')
  otpDigits.value[i] = val.slice(-1) // ambil 1 digit saja
  event.target.value = otpDigits.value[i]
  if (otpDigits.value[i] && i < 5) otpRefs.value[i + 1]?.focus()
  // auto-submit saat digit ke-6 terisi
  if (otpCode.value.length === 6) verifyOtp()
}

function onOtpKeydown(i, event) {
  if (event.key === 'Backspace') {
    if (otpDigits.value[i]) {
      otpDigits.value[i] = ''
    } else if (i > 0) {
      otpDigits.value[i - 1] = ''
      otpRefs.value[i - 1]?.focus()
    }
    event.preventDefault()
  } else if (event.key === 'ArrowLeft' && i > 0) {
    otpRefs.value[i - 1]?.focus()
  } else if (event.key === 'ArrowRight' && i < 5) {
    otpRefs.value[i + 1]?.focus()
  }
}

function onOtpPaste(event) {
  event.preventDefault()
  const text = (event.clipboardData || window.clipboardData).getData('text').replace(/\D/g, '').slice(0, 6)
  text.split('').forEach((ch, i) => { otpDigits.value[i] = ch })
  const next = Math.min(text.length, 5)
  otpRefs.value[next]?.focus()
  if (text.length === 6) verifyOtp()
}

async function sendOtp() {
  errorMsg.value = ''
  loading.value = true
  try {
    await $fetch('/api/otp/send', { method: 'POST', body: { phone: phone.value } })
    step.value = 'otp'
    startResendCountdown()
  } catch (err) {
    errorMsg.value = err?.data?.statusMessage || 'Nomor tidak ditemukan atau gagal mengirim OTP.'
  } finally {
    loading.value = false
  }
}

async function verifyOtp() {
  errorMsg.value = ''
  loading.value = true
  try {
    result.value = await $fetch('/api/otp/verify', { method: 'POST', body: { phone: phone.value, code: otpCode.value } })
    step.value = 'result'
    clearInterval(countdownTimer)
  } catch (err) {
    errorMsg.value = err?.data?.statusMessage || 'Kode OTP salah atau sudah kadaluarsa.'
  } finally {
    loading.value = false
  }
}

function startResendCountdown() {
  resendCountdown.value = 60
  clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    resendCountdown.value--
    if (resendCountdown.value <= 0) clearInterval(countdownTimer)
  }, 1000)
}

async function resendOtp() {
  otpDigits.value = ['', '', '', '', '', '']
  await sendOtp()
}

async function logout() {
  loading.value = true
  try {
    await $fetch('/api/history/logout', { method: 'POST' })
  } catch (err) {
    console.error('Logout failed', err)
  } finally {
    reset()
    loading.value = false
  }
}

function reset() {
  step.value = 'phone'
  phone.value = ''
  otpDigits.value = ['', '', '', '', '', '']
  errorMsg.value = ''
  result.value = null
  clearInterval(countdownTimer)
}

function formatDate(date) {
  if (!date) return '-'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long' }).format(new Date(date))
}
</script>
