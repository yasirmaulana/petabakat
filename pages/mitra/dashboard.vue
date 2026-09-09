<template>
  <div class="min-h-screen bg-gray-25 font-body">
    <!-- Header -->
    <header class="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <span class="text-sm font-semibold text-gray-900">Dashboard Mitra</span>
        <span v-if="mitra" class="ml-2 text-xs text-gray-400">{{ mitra.institution || mitra.name }}</span>
      </div>
      <button class="btn-secondary px-3 py-1.5 text-xs" @click="logout">Keluar</button>
    </header>

    <main class="mx-auto max-w-4xl px-4 py-8 space-y-6">

      <!-- Stats -->
      <div v-if="stats" class="grid gap-4 sm:grid-cols-3">
        <div class="card p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ mitra?.type === 'institutional' ? 'Kredit Sisa' : 'Total Komisi' }}</p>
          <p class="mt-2 text-3xl font-bold text-gray-950">
            <template v-if="mitra?.type === 'institutional'">{{ stats.creditBalance }} <span class="text-sm font-normal text-gray-400">laporan</span></template>
            <template v-else>Rp {{ stats.totalKomisi.toLocaleString('id-ID') }}</template>
          </p>
        </div>
        <div class="card p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Laporan Digunakan</p>
          <p class="mt-2 text-3xl font-bold text-gray-950">{{ stats.totalLaporan }}</p>
        </div>
        <div class="card p-5">
          <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ mitra?.type === 'institutional' ? 'Kode Referral' : 'Komisi Pending' }}</p>
          <p class="mt-2 text-lg font-bold text-gray-950 break-all">
            <template v-if="mitra?.type === 'institutional'">{{ mitra?.referralCode }}</template>
            <template v-else>Rp {{ stats.komisiPending.toLocaleString('id-ID') }}</template>
          </p>
        </div>
      </div>

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-gray-200">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="px-4 py-2.5 text-sm font-medium transition-colors"
          :class="activeTab === tab.key ? 'border-b-2 border-brand-400 text-gray-900' : 'text-gray-400 hover:text-gray-700'"
          @click="activeTab = tab.key"
        >{{ tab.label }}</button>
      </div>

      <!-- Tab: Laporan -->
      <div v-if="activeTab === 'laporan'">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">Laporan Digunakan</h2>
          <button class="btn-secondary px-3 py-1.5 text-xs" @click="exportCSV">Export CSV</button>
        </div>
        <div v-if="laporan.length === 0" class="card p-8 text-center text-sm text-gray-400">Belum ada laporan.</div>
        <div v-else class="card overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
              <tr>
                <th class="px-4 py-3 text-left">Nama Anak</th>
                <th class="px-4 py-3 text-left">Voucher</th>
                <th class="px-4 py-3 text-left">Persona</th>
                <th class="px-4 py-3 text-left">Tanggal</th>
                <th class="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="l in laporan" :key="l.publicId" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ l.child.name }}</td>
                <td class="px-4 py-3 text-gray-500 font-mono text-xs">{{ l.voucher?.code || '-' }}</td>
                <td class="px-4 py-3 text-gray-600">{{ l.result?.personaLabel || '—' }}</td>
                <td class="px-4 py-3 text-gray-400 text-xs">{{ new Date(l.createdAt).toLocaleDateString('id-ID') }}</td>
                <td class="px-4 py-3">
                  <NuxtLink :to="`/results/${l.publicId}`" class="text-xs text-brand-600 hover:underline" target="_blank">Lihat →</NuxtLink>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Voucher (hanya Tipe A) -->
      <div v-if="activeTab === 'voucher' && mitra?.type === 'institutional'" class="space-y-4">
        <div class="flex items-center justify-between">
          <h2 class="font-semibold text-gray-900">Kode Voucher</h2>
        </div>

        <!-- Generate form -->
        <div class="card p-5 space-y-3">
          <p class="text-sm font-medium text-gray-900">Generate Kode Baru</p>
          <div class="flex gap-3 items-end">
            <div class="flex-1">
              <label class="label-text">Jumlah</label>
              <input v-model.number="genCount" type="number" min="1" max="50" class="input-field" />
            </div>
            <div class="flex-1">
              <label class="label-text">Kadaluarsa <span class="text-gray-400">(opsional)</span></label>
              <input v-model="genExpiry" type="date" class="input-field" />
            </div>
            <button class="btn-primary px-4 py-2.5 shrink-0" :disabled="generatingVoucher" @click="generateVoucher">
              {{ generatingVoucher ? '...' : 'Generate' }}
            </button>
          </div>
          <p v-if="genError" class="text-xs text-red-600">{{ genError }}</p>
          <div v-if="generatedCodes.length" class="rounded-lg bg-green-50 border border-green-200 p-3">
            <p class="text-xs font-semibold text-green-700 mb-2">{{ generatedCodes.length }} kode berhasil dibuat:</p>
            <div class="flex flex-wrap gap-2">
              <code v-for="c in generatedCodes" :key="c" class="rounded bg-white border border-green-200 px-2 py-0.5 text-xs font-mono text-green-800">{{ c }}</code>
            </div>
          </div>
        </div>

        <!-- Daftar voucher -->
        <div v-if="vouchers.length === 0" class="card p-8 text-center text-sm text-gray-400">Belum ada voucher.</div>
        <div v-else class="card overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
              <tr>
                <th class="px-4 py-3 text-left">Kode</th>
                <th class="px-4 py-3 text-left">Status</th>
                <th class="px-4 py-3 text-left">Terpakai</th>
                <th class="px-4 py-3 text-left">Kadaluarsa</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="v in vouchers" :key="v.id">
                <td class="px-4 py-3 font-mono text-xs font-medium text-gray-900">{{ v.code }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="v.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'">{{ v.status }}</span>
                </td>
                <td class="px-4 py-3 text-gray-500">{{ v.usedCount }} / {{ v.quota }}</td>
                <td class="px-4 py-3 text-gray-400 text-xs">{{ v.expiresAt ? new Date(v.expiresAt).toLocaleDateString('id-ID') : '—' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Tab: Komisi (hanya Tipe B) -->
      <div v-if="activeTab === 'komisi' && mitra?.type === 'affiliate'" class="space-y-4">
        <div v-if="commissions" class="grid gap-4 sm:grid-cols-3">
          <div class="card p-4 text-center">
            <p class="text-xs text-gray-400">Total Komisi</p>
            <p class="text-xl font-bold text-gray-900 mt-1">Rp {{ commissions.total.toLocaleString('id-ID') }}</p>
          </div>
          <div class="card p-4 text-center">
            <p class="text-xs text-gray-400">Pending</p>
            <p class="text-xl font-bold text-amber-600 mt-1">Rp {{ commissions.pending.toLocaleString('id-ID') }}</p>
          </div>
          <div class="card p-4 text-center">
            <p class="text-xs text-gray-400">Sudah Cair</p>
            <p class="text-xl font-bold text-green-600 mt-1">Rp {{ commissions.paid.toLocaleString('id-ID') }}</p>
          </div>
        </div>

        <!-- Request pencairan -->
        <div class="card p-5 space-y-3">
          <p class="text-sm font-semibold text-gray-900">Request Pencairan</p>
          <div class="grid gap-3 sm:grid-cols-3">
            <div>
              <label class="label-text">Nama Bank</label>
              <input v-model="payoutForm.bankName" placeholder="BCA / Mandiri / dst" class="input-field" />
            </div>
            <div>
              <label class="label-text">Nomor Rekening</label>
              <input v-model="payoutForm.accountNumber" placeholder="1234567890" class="input-field" />
            </div>
            <div>
              <label class="label-text">Atas Nama</label>
              <input v-model="payoutForm.accountName" placeholder="Nama sesuai rekening" class="input-field" />
            </div>
          </div>
          <p v-if="payoutError" class="text-xs text-red-600">{{ payoutError }}</p>
          <p v-if="payoutSuccess" class="text-xs text-green-600">{{ payoutSuccess }}</p>
          <button class="btn-primary px-4 py-2 text-sm" :disabled="payoutLoading" @click="requestPayout">
            {{ payoutLoading ? 'Mengirim...' : 'Request Pencairan' }}
          </button>
        </div>

        <!-- Riwayat komisi -->
        <div v-if="commissions?.items.length" class="card overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
              <tr>
                <th class="px-4 py-3 text-left">Jumlah</th>
                <th class="px-4 py-3 text-left">Status</th>
                <th class="px-4 py-3 text-left">Tanggal</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="c in commissions.items" :key="c.id">
                <td class="px-4 py-3 font-medium">Rp {{ c.amount.toLocaleString('id-ID') }}</td>
                <td class="px-4 py-3">
                  <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="c.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'">{{ c.status }}</span>
                </td>
                <td class="px-4 py-3 text-gray-400 text-xs">{{ new Date(c.createdAt).toLocaleDateString('id-ID') }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'mitra-auth' })
useSeoMeta({ title: 'Dashboard Mitra — PetaMinatBakat' })

const router = useRouter()

const { data: mitra } = await useFetch('/api/mitra/auth/me')
const { data: stats, refresh: refreshStats } = await useFetch('/api/mitra/dashboard')
const { data: laporan, refresh: refreshLaporan } = await useFetch('/api/mitra/laporan')
const { data: vouchers, refresh: refreshVouchers } = useFetch('/api/mitra/vouchers')
const { data: commissions } = useFetch(
  () => mitra.value?.type === 'affiliate' ? '/api/mitra/commissions' : null
)

const tabs = computed(() => {
  const t = [{ key: 'laporan', label: 'Laporan' }]
  if (mitra.value?.type === 'institutional') t.push({ key: 'voucher', label: 'Kode Voucher' })
  if (mitra.value?.type === 'affiliate') t.push({ key: 'komisi', label: 'Komisi' })
  return t
})
const activeTab = ref('laporan')

// Generate voucher
const genCount = ref(1)
const genExpiry = ref('')
const generatingVoucher = ref(false)
const genError = ref('')
const generatedCodes = ref([])

async function generateVoucher() {
  generatingVoucher.value = true
  genError.value = ''
  generatedCodes.value = []
  try {
    const res = await $fetch('/api/mitra/vouchers', {
      method: 'POST',
      body: { count: genCount.value, expiresAt: genExpiry.value || null },
    })
    generatedCodes.value = res.codes
    await refreshVouchers()
    await refreshStats()
  } catch (err) {
    genError.value = err?.data?.message || 'Gagal generate voucher.'
  } finally {
    generatingVoucher.value = false
  }
}

// Export CSV
function exportCSV() {
  if (!laporan.value?.length) return
  const rows = [
    ['Nama Anak', 'Gender', 'Voucher', 'Persona', 'Qiyadah%', 'Ilmi%', 'Amali%', 'Wajdan%', 'Tanggal'],
    ...laporan.value.map(l => [
      l.child.name,
      l.child.gender,
      l.voucher?.code || '',
      l.result?.personaLabel || '',
      l.result?.pctAsyiha || '',
      l.result?.pctIlmi || '',
      l.result?.pctAmali || '',
      l.result?.pctWajdan || '',
      new Date(l.createdAt).toLocaleDateString('id-ID'),
    ]),
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `laporan-mitra-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Payout
const payoutForm = reactive({ bankName: '', accountNumber: '', accountName: '' })
const payoutLoading = ref(false)
const payoutError = ref('')
const payoutSuccess = ref('')

async function requestPayout() {
  payoutLoading.value = true
  payoutError.value = ''
  payoutSuccess.value = ''
  try {
    const res = await $fetch('/api/mitra/commissions/request', { method: 'POST', body: payoutForm })
    payoutSuccess.value = res.message
  } catch (err) {
    payoutError.value = err?.data?.message || 'Gagal mengirim request.'
  } finally {
    payoutLoading.value = false
  }
}

async function logout() {
  await $fetch('/api/mitra/auth/logout', { method: 'POST' })
  await router.push('/mitra/login')
}
</script>
