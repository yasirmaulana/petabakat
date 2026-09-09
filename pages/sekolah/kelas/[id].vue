<template>
  <div class="min-h-screen bg-gray-25 font-body">
    <header class="sticky top-0 z-40 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
      <NuxtLink to="/sekolah/dashboard" class="text-sm font-semibold text-gray-900 hover:text-gray-600">← Dashboard</NuxtLink>
    </header>

    <main class="mx-auto max-w-4xl px-4 py-8 space-y-6">

      <div v-if="kelas">
        <h1 class="text-2xl font-bold text-gray-950">{{ kelas.name }}</h1>
        <p class="text-sm text-gray-400 mt-1">Tingkat {{ kelas.grade }} · {{ kelas.year }} · {{ kelas.students.length }} siswa</p>
      </div>

      <!-- Rata-rata radar (bar sederhana) -->
      <div v-if="kelas?.avgScores" class="card p-5">
        <h2 class="font-semibold text-gray-900 mb-4">Rata-rata Skor Kelas</h2>
        <div class="space-y-3">
          <div v-for="r in rumpunList" :key="r.key">
            <div class="flex justify-between text-sm mb-1">
              <span class="font-medium text-gray-700">{{ r.label }}</span>
              <span class="text-gray-400">{{ kelas.avgScores[r.key]?.toFixed(1) }}%</span>
            </div>
            <div class="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
              <div class="h-2 rounded-full transition-all" :class="r.color"
                :style="{ width: `${kelas.avgScores[r.key] || 0}%` }" />
            </div>
          </div>
        </div>
      </div>

      <!-- Daftar siswa -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100">
          <h2 class="font-semibold text-gray-900">Daftar Siswa</h2>
        </div>
        <div v-if="!kelas?.students.length" class="p-8 text-center text-sm text-gray-400">Belum ada siswa di kelas ini.</div>
        <div v-else class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-xs font-semibold uppercase text-gray-400">
              <tr>
                <th class="px-4 py-3 text-left">Nama Anak</th>
                <th class="px-4 py-3 text-left">Rumpun</th>
                <th class="px-4 py-3 text-left">Persona</th>
                <th class="px-4 py-3 text-left">Tanggal</th>
                <th class="px-4 py-3 text-left"></th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr v-for="s in kelas.students" :key="s.survey.publicId" class="hover:bg-gray-50">
                <td class="px-4 py-3 font-medium text-gray-900">{{ s.survey.child.name }}</td>
                <td class="px-4 py-3">
                  <span v-if="s.survey.result?.dominantCategory"
                    class="rounded-full px-2 py-0.5 text-xs font-medium bg-brand-100 text-brand-700 capitalize">
                    {{ s.survey.result.dominantCategory }}
                  </span>
                  <span v-else class="text-gray-300">—</span>
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

    </main>
  </div>
</template>

<script setup>
definePageMeta({ middleware: 'sekolah-auth' })

const route = useRoute()
const { data: kelas } = await useFetch(`/api/sekolah/kelas/${route.params.id}`)

useSeoMeta({ title: () => kelas.value ? `${kelas.value.name} — Dashboard Sekolah` : 'Kelas' })

const rumpunList = [
  { key: 'qiyadah', label: 'Al-Qiyadah', color: 'bg-blue-400' },
  { key: 'ilmi', label: 'Al-Ilmi', color: 'bg-green-400' },
  { key: 'amali', label: 'Al-Amali', color: 'bg-amber-400' },
  { key: 'wajdan', label: 'Al-Wajdan', color: 'bg-purple-400' },
]
</script>
