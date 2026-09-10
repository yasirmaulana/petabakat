<template>
  <div class="min-h-screen bg-gray-25 font-body">
    <!-- Header -->
    <header class="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <div>
        <span class="text-sm font-semibold text-gray-900">{{ me?.school?.name }}</span>
        <span class="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700 capitalize">{{ me?.school?.plan }}</span>
      </div>
      <div class="flex items-center gap-3">
        <span class="text-xs text-gray-400 font-mono hidden sm:block">{{ me?.school?.code }}</span>
        <button class="btn-secondary px-3 py-1.5 text-xs" @click="logout">Keluar</button>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-8 space-y-6">

      <!-- Tabs -->
      <div class="flex gap-1 border-b border-gray-200">
        <button v-for="tab in tabs" :key="tab.key"
          class="px-4 py-2.5 text-sm font-medium transition-colors"
          :class="activeTab === tab.key ? 'border-b-2 border-brand-400 text-gray-900' : 'text-gray-400 hover:text-gray-700'"
          @click="activeTab = tab.key">{{ tab.label }}</button>
      </div>

      <!-- Overview -->
      <div v-if="activeTab === 'overview' && stats">
        <!-- Stats cards -->
        <div class="grid gap-4 sm:grid-cols-3 mb-6">
          <div class="card p-5">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Siswa</p>
            <p class="mt-2 text-3xl font-bold text-gray-950">{{ stats.totalSiswa }}</p>
            <p class="text-xs text-gray-400 mt-1">dari maks. {{ me?.school?.studentCap }}</p>
          </div>
          <div class="card p-5">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Sudah Survei</p>
            <p class="mt-2 text-3xl font-bold text-green-600">{{ stats.sudahSurvei }}</p>
            <p class="text-xs text-gray-400 mt-1">{{ stats.totalSiswa > 0 ? Math.round(stats.sudahSurvei / stats.totalSiswa * 100) : 0 }}% dari total</p>
          </div>
          <div class="card p-5">
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">Belum Survei</p>
            <p class="mt-2 text-3xl font-bold text-amber-500">{{ stats.belumSurvei }}</p>
          </div>
        </div>

        <!-- Sebaran Rumpun -->
        <div class="card p-5 mb-6">
          <h3 class="font-semibold text-gray-900 mb-4">Sebaran Rumpun Dominan</h3>
          <div class="space-y-3">
            <div v-for="r in rumpunList" :key="r.key">
              <div class="flex justify-between text-sm mb-1">
                <span class="font-medium text-gray-700">{{ r.label }}</span>
                <span class="text-gray-400">{{ stats.sebaranRumpun[r.key] || 0 }} siswa ({{ stats.totalSiswa > 0 ? ((stats.sebaranRumpun[r.key] || 0) / stats.sudahSurvei * 100).toFixed(1) : 0 }}%)</span>
              </div>
              <div class="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div class="h-2 rounded-full transition-all" :class="r.color"
                  :style="{ width: stats.sudahSurvei > 0 ? `${((stats.sebaranRumpun[r.key] || 0) / stats.sudahSurvei * 100)}%` : '0%' }" />
              </div>
            </div>
          </div>
        </div>

        <!-- Fit-Gap Summary -->
        <div v-if="stats.fitGapSummary?.total > 0" class="card p-5 mb-6">
          <h3 class="font-semibold text-gray-900 mb-1">Hasab Keluarga — Fit-Gap Ratio</h3>
          <p class="text-xs text-gray-400 mb-4">{{ stats.fitGapSummary.total }} siswa sudah menyelesaikan analisis keluarga</p>
          <div class="grid grid-cols-2 gap-3 mb-4">
            <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-center">
              <p class="text-2xl font-bold text-emerald-700">{{ stats.fitGapSummary.optimal }}</p>
              <p class="text-xs text-emerald-600 mt-0.5">OPTIMAL</p>
              <p class="text-xs text-gray-400">{{ stats.fitGapSummary.total > 0 ? Math.round(stats.fitGapSummary.optimal / stats.fitGapSummary.total * 100) : 0 }}%</p>
            </div>
            <div class="rounded-xl border border-amber-200 bg-amber-50 p-3 text-center">
              <p class="text-2xl font-bold text-amber-700">{{ stats.fitGapSummary.gap }}</p>
              <p class="text-xs text-amber-600 mt-0.5">GAP</p>
              <p class="text-xs text-gray-400">{{ stats.fitGapSummary.total > 0 ? Math.round(stats.fitGapSummary.gap / stats.fitGapSummary.total * 100) : 0 }}%</p>
            </div>
          </div>
          <!-- Per kelas -->
          <div v-if="stats.fitGapSummary.perKelas.length > 1" class="space-y-2">
            <p class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Per Kelas</p>
            <div v-for="k in stats.fitGapSummary.perKelas" :key="k.kelasId"
              class="flex items-center gap-3 text-sm">
              <span class="w-24 shrink-0 truncate text-gray-700">{{ k.kelasName }}</span>
              <div class="flex-1 flex gap-1 items-center">
                <div class="h-2 rounded-full bg-emerald-400 transition-all"
                  :style="{ width: k.total > 0 ? `${Math.round(k.optimal / k.total * 100)}%` : '0%' }" />
                <div class="h-2 rounded-full bg-amber-300 transition-all"
                  :style="{ width: k.total > 0 ? `${Math.round(k.gap / k.total * 100)}%` : '0%' }" />
              </div>
              <span class="shrink-0 text-xs text-gray-400">{{ k.total }} siswa</span>
            </div>
          </div>
        </div>

        <!-- Kode Sekolah info -->
        <div class="rounded-xl border border-brand-100 bg-brand-50 p-4 flex items-start gap-3">
          <div class="text-2xl">📋</div>
          <div>
            <p class="text-sm font-semibold text-brand-900">Kode Sekolah: <code class="font-mono">{{ me?.school?.code }}</code></p>
            <p class="text-xs text-brand-700 mt-1">Bagikan kode ini ke orang tua. Saat mengisi survei, mereka masukkan kode ini agar data siswa terhubung ke dashboard kamu.</p>
          </div>
        </div>
      </div>

      <!-- Daftar Siswa -->
      <div v-if="activeTab === 'siswa'" class="space-y-4">
        <div class="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div class="flex gap-2 flex-wrap">
            <select v-model="filterKelas" class="input-field text-sm py-2 w-auto" @change="loadSiswa">
              <option value="">Semua Kelas</option>
              <option v-for="k in kelasList" :key="k.id" :value="k.id">{{ k.name }}</option>
            </select>
            <select v-model="filterRumpun" class="input-field text-sm py-2 w-auto" @change="loadSiswa">
              <option value="">Semua Rumpun</option>
              <option value="qiyadah">Al-Qiyadah</option>
              <option value="ilmi">Al-Ilmi</option>
              <option value="amali">Al-Amali</option>
              <option value="wajdan">Al-Wajdan</option>
            </select>
          </div>
          <button class="btn-secondary px-3 py-2 text-xs shrink-0" @click="exportCSV">Export CSV</button>
        </div>

        <div v-if="!siswaList?.length" class="card p-10 text-center text-sm text-gray-400">
          Belum ada data siswa. Pastikan orang tua sudah mengisi survei dengan kode sekolah <strong>{{ me?.school?.code }}</strong>.
        </div>
        <div v-else class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
                <tr>
                  <th class="px-4 py-3 text-left">Nama Anak</th>
                  <th class="px-4 py-3 text-left">Kelas</th>
                  <th class="px-4 py-3 text-left">Rumpun</th>
                  <th class="px-4 py-3 text-left">Fit-Gap</th>
                  <th class="px-4 py-3 text-left">Persona</th>
                  <th class="px-4 py-3 text-left">Tanggal</th>
                  <th class="px-4 py-3 text-left"></th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                <tr v-for="s in siswaList" :key="s.survey.publicId" class="hover:bg-gray-50">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ s.survey.child.name }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ s.schoolClass.name }}</td>
                  <td class="px-4 py-3">
                    <span v-if="s.survey.result?.dominantCategory" class="rounded-full px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 capitalize">{{ s.survey.result.dominantCategory }}</span>
                    <span v-else class="text-gray-300">—</span>
                  </td>
                  <td class="px-4 py-3">
                    <span v-if="s.survey.familyAssessment?.result?.fitGapStatus"
                      class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="s.survey.familyAssessment.result.fitGapStatus === 'OPTIMAL'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'">
                      {{ s.survey.familyAssessment.result.fitGapStatus }}
                    </span>
                    <span v-else class="text-xs text-gray-300">—</span>
                  </td>
                  <td class="px-4 py-3 text-gray-600 text-xs">{{ s.survey.result?.personaLabel || '—' }}</td>
                  <td class="px-4 py-3 text-gray-400 text-xs">{{ new Date(s.survey.createdAt).toLocaleDateString('id-ID') }}</td>
                  <td class="px-4 py-3">
                    <NuxtLink :to="`/results/${s.survey.publicId}`" class="text-xs text-brand-600 hover:underline" target="_blank">Lihat →</NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Kelas -->
      <div v-if="activeTab === 'kelas'" class="space-y-4">
        <!-- Tambah kelas (admin only) -->
        <div v-if="me?.role === 'admin'" class="card p-5 space-y-3">
          <p class="text-sm font-semibold text-gray-900">Tambah Kelas</p>
          <div class="flex gap-3 flex-wrap">
            <input v-model="newKelas.name" placeholder="Kelas 3A" class="input-field flex-1 min-w-32" />
            <input v-model.number="newKelas.grade" type="number" placeholder="Tingkat (3)" min="1" max="12" class="input-field w-28" />
            <input v-model="newKelas.year" placeholder="2026/2027" class="input-field w-36" />
            <button class="btn-primary px-4 py-2.5 shrink-0" :disabled="addingKelas" @click="addKelas">
              {{ addingKelas ? '...' : 'Tambah' }}
            </button>
          </div>
          <p v-if="kelasError" class="text-xs text-red-600">{{ kelasError }}</p>
        </div>

        <div v-if="!kelasList?.length" class="card p-10 text-center text-sm text-gray-400">Belum ada kelas. Tambah kelas di atas.</div>
        <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <NuxtLink v-for="k in kelasList" :key="k.id" :to="`/sekolah/kelas/${k.id}`"
            class="card p-5 hover:border-brand-300 transition-colors">
            <p class="font-semibold text-gray-900">{{ k.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">Tingkat {{ k.grade }} · {{ k.year }}</p>
            <p class="mt-3 text-2xl font-bold text-gray-950">{{ k.totalSiswa }}</p>
            <p class="text-xs text-gray-400">siswa sudah survei</p>
          </NuxtLink>
        </div>
      </div>

      <!-- Analytics -->
      <div v-if="activeTab === 'analytics' && analytics" class="space-y-6">
        <!-- Bar chart per kelas -->
        <div class="card p-5">
          <h3 class="font-semibold text-gray-900 mb-4">Distribusi Rumpun per Kelas</h3>
          <div v-if="analytics.perKelas.length === 0" class="text-sm text-gray-400 text-center py-4">Belum ada data.</div>
          <div v-else class="space-y-5 overflow-x-auto">
            <div v-for="k in analytics.perKelas" :key="k.kelasId">
              <p class="text-xs font-semibold text-gray-600 mb-2">{{ k.kelasName }} · {{ k.totalSiswa }} siswa</p>
              <div class="flex h-6 w-full rounded-lg overflow-hidden">
                <div class="bg-blue-400" :style="{ width: `${k.avgQiyadah}%` }" :title="`Al-Qiyadah ${k.avgQiyadah.toFixed(1)}%`" />
                <div class="bg-green-400" :style="{ width: `${k.avgIlmi}%` }" :title="`Al-Ilmi ${k.avgIlmi.toFixed(1)}%`" />
                <div class="bg-amber-400" :style="{ width: `${k.avgAmali}%` }" :title="`Al-Amali ${k.avgAmali.toFixed(1)}%`" />
                <div class="bg-purple-400" :style="{ width: `${k.avgWajdan}%` }" :title="`Al-Wajdan ${k.avgWajdan.toFixed(1)}%`" />
              </div>
            </div>
          </div>
          <!-- Legend -->
          <div class="mt-4 flex flex-wrap gap-4 text-xs">
            <span class="flex items-center gap-1.5"><span class="h-3 w-3 rounded bg-blue-400" />Al-Qiyadah</span>
            <span class="flex items-center gap-1.5"><span class="h-3 w-3 rounded bg-green-400" />Al-Ilmi</span>
            <span class="flex items-center gap-1.5"><span class="h-3 w-3 rounded bg-amber-400" />Al-Amali</span>
            <span class="flex items-center gap-1.5"><span class="h-3 w-3 rounded bg-purple-400" />Al-Wajdan</span>
          </div>
        </div>

        <!-- Top personas -->
        <div class="card p-5">
          <h3 class="font-semibold text-gray-900 mb-4">Top Persona di Sekolah Ini</h3>
          <div v-if="!analytics.topPersonas.length" class="text-sm text-gray-400">Belum ada data.</div>
          <div v-else class="space-y-2">
            <div v-for="(p, i) in analytics.topPersonas" :key="p.label" class="flex items-center gap-3">
              <span class="text-xs font-bold text-gray-400 w-5">{{ i + 1 }}</span>
              <span class="flex-1 text-sm text-gray-800">{{ p.label }}</span>
              <span class="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">{{ p.count }} siswa</span>
            </div>
          </div>
        </div>
      </div>

    </main>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'sekolah-auth' })
useSeoMeta({ title: 'Dashboard Sekolah — PetaMinatBakat' })

const router = useRouter()

const { data: me } = await useFetch('/api/sekolah/auth/me')
const { data: stats } = await useFetch('/api/sekolah/dashboard')
const { data: kelasList, refresh: refreshKelas } = await useFetch('/api/sekolah/kelas')
const { data: analytics } = useFetch('/api/sekolah/analytics')

const activeTab = ref('overview')
const tabs = [
  { key: 'overview', label: 'Overview' },
  { key: 'siswa', label: 'Daftar Siswa' },
  { key: 'kelas', label: 'Kelas' },
  { key: 'analytics', label: 'Analytics' },
]

const rumpunList = [
  { key: 'qiyadah', label: 'Al-Qiyadah', color: 'bg-blue-400' },
  { key: 'ilmi', label: 'Al-Ilmi', color: 'bg-green-400' },
  { key: 'amali', label: 'Al-Amali', color: 'bg-amber-400' },
  { key: 'wajdan', label: 'Al-Wajdan', color: 'bg-purple-400' },
]

// Siswa
const filterKelas = ref('')
const filterRumpun = ref('')
const siswaList = ref([])

async function loadSiswa() {
  const params = new URLSearchParams()
  if (filterKelas.value) params.set('kelasId', filterKelas.value)
  if (filterRumpun.value) params.set('rumpun', filterRumpun.value)
  siswaList.value = await $fetch(`/api/sekolah/siswa?${params}`)
}

watch(activeTab, (val) => {
  if (val === 'siswa') loadSiswa()
})

function exportCSV() {
  if (!siswaList.value?.length) return
  const rows = [
    ['Nama Anak', 'Gender', 'Kelas', 'Rumpun Dominan', 'Persona', 'Qiyadah%', 'Ilmi%', 'Amali%', 'Wajdan%', 'Tanggal'],
    ...siswaList.value.map(s => [
      s.survey.child.name,
      s.survey.child.gender,
      s.schoolClass.name,
      s.survey.result?.dominantCategory || '',
      s.survey.result?.personaLabel || '',
      s.survey.result?.pctAsyiha || '',
      s.survey.result?.pctIlmi || '',
      s.survey.result?.pctAmali || '',
      s.survey.result?.pctWajdan || '',
      new Date(s.survey.createdAt).toLocaleDateString('id-ID'),
    ]),
  ]
  const csv = rows.map(r => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `siswa-${me.value?.school?.code}-${Date.now()}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

// Tambah kelas
const newKelas = reactive({ name: '', grade: null, year: `${new Date().getFullYear()}/${new Date().getFullYear() + 1}` })
const addingKelas = ref(false)
const kelasError = ref('')

async function addKelas() {
  if (!newKelas.name || !newKelas.grade || !newKelas.year) {
    kelasError.value = 'Semua field kelas wajib diisi.'
    return
  }
  addingKelas.value = true
  kelasError.value = ''
  try {
    await $fetch('/api/sekolah/kelas', { method: 'POST', body: newKelas })
    await refreshKelas()
    newKelas.name = ''
    newKelas.grade = null
  } catch (err) {
    kelasError.value = err?.data?.message || 'Gagal menambah kelas.'
  } finally {
    addingKelas.value = false
  }
}

async function logout() {
  await $fetch('/api/sekolah/auth/logout', { method: 'POST' })
  await router.push('/sekolah/login')
}
</script>
