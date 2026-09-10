<template>
  <div class="min-h-screen bg-gray-50 font-body">

    <!-- Top bar -->
    <header class="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <div class="flex items-center gap-3">
          <span class="flex h-8 w-8 items-center justify-center rounded-xl bg-brand-400 text-sm font-bold text-black">P</span>
          <span class="text-sm font-semibold text-gray-900">Owner Dashboard</span>
        </div>
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="text-xs text-gray-400 hover:text-gray-600">← Beranda</NuxtLink>
          <button @click="logout" class="text-xs text-red-400 hover:text-red-600">Keluar</button>
        </div>
      </div>
      <!-- Tabs -->
      <div class="mx-auto max-w-7xl overflow-x-auto px-4 sm:px-6">
        <div class="flex gap-1 pb-0 text-sm">
          <button v-for="tab in TABS" :key="tab.key" @click="activeTab = tab.key"
            class="shrink-0 border-b-2 px-3 py-2.5 text-sm font-medium transition-colors"
            :class="activeTab === tab.key
              ? 'border-brand-400 text-gray-900'
              : 'border-transparent text-gray-400 hover:text-gray-600'">
            {{ tab.label }}
          </button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-6 sm:px-6">

      <!-- ───────── RINGKASAN ───────── -->
      <section v-if="activeTab === 'ringkasan'">
        <div v-if="statsPending" class="py-16 text-center text-sm text-gray-400">
          Memuat statistik...
          <button class="ml-2 text-xs underline text-gray-500" @click="refreshStats()">refresh manual</button>
        </div>
        <div v-else-if="statsError" class="py-8 rounded-xl border border-red-200 bg-red-50 px-4 text-center text-sm text-red-600">
          Gagal memuat data: {{ statsError?.data?.message || statsError?.message }} —
          <button class="underline" @click="refreshStats()">coba lagi</button>
        </div>
        <template v-else-if="stats">
          <!-- KPI cards -->
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <div class="card p-4">
              <p class="text-xs text-gray-400">Total Survei</p>
              <p class="mt-1 text-2xl font-bold text-gray-900">{{ stats.surveys.total.toLocaleString() }}</p>
              <p class="text-xs text-gray-500">+{{ stats.surveys.thisMonth }} bulan ini</p>
            </div>
            <div class="card p-4">
              <p class="text-xs text-gray-400">Selesai</p>
              <p class="mt-1 text-2xl font-bold text-gray-900">{{ stats.surveys.completed.toLocaleString() }}</p>
            </div>
            <div class="card p-4">
              <p class="text-xs text-gray-400">Estimasi Pendapatan</p>
              <p class="mt-1 text-lg font-bold text-gray-900">{{ fmtRp(stats.estimatedRevenue) }}</p>
              <p class="text-xs text-gray-400">@Rp99.000/laporan</p>
            </div>
            <div class="card p-4">
              <p class="text-xs text-gray-400">Mitra</p>
              <p class="mt-1 text-2xl font-bold text-gray-900">{{ stats.mitra.total }}</p>
              <p v-if="stats.mitra.pending" class="text-xs text-amber-600">{{ stats.mitra.pending }} pending</p>
            </div>
            <div class="card p-4">
              <p class="text-xs text-gray-400">Komisi Pending</p>
              <p class="mt-1 text-lg font-bold text-gray-900">{{ fmtRp(stats.commissions.pendingTotal) }}</p>
              <p class="text-xs text-gray-400">{{ stats.commissions.pendingCount }} transaksi</p>
            </div>
          </div>

          <!-- Hasab Keluarga stats -->
          <div v-if="stats.familyAssessments" class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div class="card p-4">
              <p class="text-xs text-gray-400">Hasab Keluarga</p>
              <p class="mt-1 text-2xl font-bold text-gray-900">{{ stats.familyAssessments.total }}</p>
              <p class="text-xs text-gray-500">assessment dimulai</p>
            </div>
            <div class="card p-4">
              <p class="text-xs text-gray-400">Selesai</p>
              <p class="mt-1 text-2xl font-bold text-gray-900">{{ stats.familyAssessments.completed }}</p>
              <p class="text-xs text-gray-500">
                {{ stats.familyAssessments.total > 0 ? Math.round(stats.familyAssessments.completed / stats.familyAssessments.total * 100) : 0 }}% completion rate
              </p>
            </div>
            <div class="card p-4 border-emerald-200 bg-emerald-50">
              <p class="text-xs text-emerald-600">OPTIMAL</p>
              <p class="mt-1 text-2xl font-bold text-emerald-700">{{ stats.familyAssessments.optimal }}</p>
              <p class="text-xs text-emerald-600">
                {{ stats.familyAssessments.completed > 0 ? Math.round(stats.familyAssessments.optimal / stats.familyAssessments.completed * 100) : 0 }}% dari selesai
              </p>
            </div>
            <div class="card p-4 border-amber-200 bg-amber-50">
              <p class="text-xs text-amber-600">GAP</p>
              <p class="mt-1 text-2xl font-bold text-amber-700">{{ stats.familyAssessments.gap }}</p>
              <p class="text-xs text-amber-600">perlu intervensi</p>
            </div>
          </div>

          <!-- Trend chart (simple SVG sparkline) -->
          <div class="card mt-4 p-5">
            <p class="mb-4 text-sm font-semibold text-gray-700">Survei 30 Hari Terakhir</p>
            <div class="overflow-x-auto">
              <svg :width="trendWidth" height="80" class="block" style="min-width:300px">
                <polyline
                  :points="trendPoints"
                  fill="none"
                  stroke="#fabc3f"
                  stroke-width="2"
                  stroke-linejoin="round"
                />
                <circle
                  v-for="(pt, i) in trendCoords" :key="i"
                  :cx="pt.x" :cy="pt.y" r="3"
                  fill="#fabc3f"
                />
              </svg>
            </div>
            <div class="mt-2 flex justify-between text-xs text-gray-400">
              <span>{{ stats.trend[0]?.date }}</span>
              <span>{{ stats.trend[stats.trend.length - 1]?.date }}</span>
            </div>
          </div>
        </template>
      </section>

      <!-- ───────── VOUCHER ───────── -->
      <section v-else-if="activeTab === 'voucher'">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-gray-900">Manajemen Voucher</h2>
          <div class="flex flex-wrap items-center gap-2">
            <input v-model="voucherSearch" type="search" placeholder="Cari kode / mitra..."
              class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm w-48 focus:border-brand-400 focus:outline-none" />
            <button @click="showGenModal = true" class="btn-primary text-sm">+ Generate Kode</button>
          </div>
        </div>

        <div v-if="voucherPending" class="py-16 text-center text-sm text-gray-400">Memuat voucher...</div>
        <div v-else class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-400">
                  <th class="px-4 py-3 font-medium">Kode</th>
                  <th class="px-4 py-3 font-medium">Kuota</th>
                  <th class="px-4 py-3 font-medium">Terpakai</th>
                  <th class="px-4 py-3 font-medium">Mitra</th>
                  <th class="px-4 py-3 font-medium">Status</th>
                  <th class="px-4 py-3 font-medium">Kadaluarsa</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="v in voucherData?.vouchers" :key="v.id"
                  class="border-b border-gray-50 hover:bg-gray-25">
                  <td class="px-4 py-3 font-mono text-xs font-semibold text-gray-800">{{ v.code }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ v.quota }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ v.usedCount }}</td>
                  <td class="px-4 py-3 text-gray-500">{{ v.partner?.name ?? '—' }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="v.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'">
                      {{ v.status }}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-400">{{ v.expiresAt ? fmtDate(v.expiresAt) : '∞' }}</td>
                  <td class="px-4 py-3">
                    <button v-if="v.status === 'active'"
                      @click="deactivateVoucher(v.id)"
                      class="text-xs text-red-400 hover:text-red-600">Nonaktifkan</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
            <span>{{ voucherData?.total ?? 0 }} voucher</span>
            <div class="flex gap-2">
              <button :disabled="voucherPage <= 1" @click="voucherPage--" class="disabled:opacity-40">←</button>
              <span>{{ voucherPage }} / {{ voucherData?.pages ?? 1 }}</span>
              <button :disabled="voucherPage >= (voucherData?.pages ?? 1)" @click="voucherPage++" class="disabled:opacity-40">→</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ───────── MITRA ───────── -->
      <section v-else-if="activeTab === 'mitra'">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-gray-900">Manajemen Mitra</h2>
          <div class="flex flex-wrap items-center gap-2">
            <input v-model="mitraSearch" type="search" placeholder="Cari nama / email / kode..."
              class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm w-52 focus:border-brand-400 focus:outline-none" />
            <select v-model="mitraStatus" class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
              <option value="">Semua</option>
              <option value="pending">Pending</option>
              <option value="active">Aktif</option>
              <option value="suspended">Disuspend</option>
            </select>
          </div>
        </div>

        <div v-if="mitraPending" class="py-16 text-center text-sm text-gray-400">Memuat mitra...</div>
        <div v-else class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-400">
                  <th class="px-4 py-3 font-medium">Nama</th>
                  <th class="px-4 py-3 font-medium">Tipe</th>
                  <th class="px-4 py-3 font-medium">Kode Referral</th>
                  <th class="px-4 py-3 font-medium">Voucher</th>
                  <th class="px-4 py-3 font-medium">Komisi</th>
                  <th class="px-4 py-3 font-medium">Status</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="m in mitraData?.partners" :key="m.id"
                  class="border-b border-gray-50 hover:bg-gray-25">
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-900">{{ m.name }}</p>
                    <p class="text-xs text-gray-400">{{ m.email }}</p>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500">{{ m.type }}</td>
                  <td class="px-4 py-3 font-mono text-xs">{{ m.referralCode }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ m._count.vouchers }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ m._count.commissions }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="{
                        'bg-amber-100 text-amber-700': m.status === 'pending',
                        'bg-emerald-100 text-emerald-700': m.status === 'active',
                        'bg-red-100 text-red-600': m.status === 'suspended',
                      }">{{ m.status }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-2">
                      <button v-if="m.status === 'pending'" @click="approveMitra(m.id)"
                        class="text-xs text-emerald-600 hover:text-emerald-800">Approve</button>
                      <button v-if="m.status === 'active'" @click="suspendMitra(m.id, 'suspend')"
                        class="text-xs text-red-400 hover:text-red-600">Suspend</button>
                      <button v-if="m.status === 'suspended'" @click="suspendMitra(m.id, 'unsuspend')"
                        class="text-xs text-brand-600 hover:text-brand-800">Aktifkan</button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
            <span>{{ mitraData?.total ?? 0 }} mitra</span>
            <div class="flex gap-2">
              <button :disabled="mitraPage <= 1" @click="mitraPage--" class="disabled:opacity-40">←</button>
              <span>{{ mitraPage }} / {{ mitraData?.pages ?? 1 }}</span>
              <button :disabled="mitraPage >= (mitraData?.pages ?? 1)" @click="mitraPage++" class="disabled:opacity-40">→</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ───────── SEKOLAH ───────── -->
      <section v-else-if="activeTab === 'sekolah'">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-gray-900">Manajemen Sekolah</h2>
          <input v-model="sekolahSearch" type="search" placeholder="Cari nama / kode / kota..."
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm w-52 focus:border-brand-400 focus:outline-none" />
        </div>
        <div v-if="sekolahPending" class="py-16 text-center text-sm text-gray-400">Memuat sekolah...</div>
        <div v-else class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-400">
                  <th class="px-4 py-3 font-medium">Nama</th>
                  <th class="px-4 py-3 font-medium">Kode</th>
                  <th class="px-4 py-3 font-medium">Plan</th>
                  <th class="px-4 py-3 font-medium">Survei</th>
                  <th class="px-4 py-3 font-medium">Billing</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in sekolahData?.schools" :key="s.id"
                  class="border-b border-gray-50 hover:bg-gray-25">
                  <td class="px-4 py-3">
                    <p class="font-medium text-gray-900">{{ s.name }}</p>
                    <p class="text-xs text-gray-400">{{ s.city }}</p>
                  </td>
                  <td class="px-4 py-3 font-mono text-xs">{{ s.code }}</td>
                  <td class="px-4 py-3 text-xs text-gray-600">{{ s.plan }}</td>
                  <td class="px-4 py-3 text-gray-600">{{ s._count.surveys }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="{
                        'bg-blue-100 text-blue-700': s.billingStatus === 'trial',
                        'bg-emerald-100 text-emerald-700': s.billingStatus === 'active',
                        'bg-gray-100 text-gray-500': s.billingStatus === 'inactive',
                      }">{{ s.billingStatus }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <button v-if="s.billingStatus !== 'active'" @click="activateSekolah(s.id)"
                      class="text-xs text-emerald-600 hover:text-emerald-800">Aktifkan</button>
                    <button v-else @click="activateSekolah(s.id, 'inactive')"
                      class="text-xs text-red-400 hover:text-red-600">Nonaktifkan</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
            <span>{{ sekolahData?.total ?? 0 }} sekolah</span>
            <div class="flex gap-2">
              <button :disabled="sekolahPage <= 1" @click="sekolahPage--" class="disabled:opacity-40">←</button>
              <span>{{ sekolahPage }} / {{ sekolahData?.pages ?? 1 }}</span>
              <button :disabled="sekolahPage >= (sekolahData?.pages ?? 1)" @click="sekolahPage++" class="disabled:opacity-40">→</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ───────── SURVEI ───────── -->
      <section v-else-if="activeTab === 'survei'">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-gray-900">Daftar Survei</h2>
          <div class="flex flex-wrap items-center gap-2">
            <input v-model="surveySearch" type="search" placeholder="Cari nama anak / orang tua / no HP..."
              class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm w-60 focus:border-brand-400 focus:outline-none" />
            <select v-model="surveyStatus" class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
              <option value="">Semua</option>
              <option value="in_progress">In Progress</option>
              <option value="processing">Processing</option>
              <option value="completed">Selesai</option>
              <option value="failed">Gagal</option>
            </select>
          </div>
        </div>
        <div v-if="surveyPending" class="py-16 text-center text-sm text-gray-400">Memuat survei...</div>
        <div v-else class="card overflow-hidden">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-400">
                  <th class="px-4 py-3 font-medium">Anak</th>
                  <th class="px-4 py-3 font-medium">Orang Tua</th>
                  <th class="px-4 py-3 font-medium">Persona</th>
                  <th class="px-4 py-3 font-medium">Voucher</th>
                  <th class="px-4 py-3 font-medium">Status</th>
                  <th class="px-4 py-3 font-medium">Fit-Gap</th>
                  <th class="px-4 py-3 font-medium">Tanggal</th>
                  <th class="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="s in surveyData?.surveys" :key="s.id"
                  class="border-b border-gray-50 hover:bg-gray-25">
                  <td class="px-4 py-3 font-medium text-gray-900">{{ s.child.name }}</td>
                  <td class="px-4 py-3">
                    <p class="text-gray-800">{{ s.parent.name }}</p>
                    <p class="text-xs text-gray-400">{{ s.parent.phone }}</p>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-500">{{ s.result?.personaLabel ?? '—' }}</td>
                  <td class="px-4 py-3 font-mono text-xs">{{ s.voucher?.code ?? '—' }}</td>
                  <td class="px-4 py-3">
                    <span class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="{
                        'bg-gray-100 text-gray-500': s.status === 'in_progress',
                        'bg-blue-100 text-blue-600': s.status === 'processing',
                        'bg-emerald-100 text-emerald-700': s.status === 'completed',
                        'bg-red-100 text-red-600': s.status === 'failed',
                      }">{{ s.status }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <span v-if="s.familyAssessment?.result?.fitGapStatus"
                      class="rounded-full px-2 py-0.5 text-xs font-semibold"
                      :class="s.familyAssessment.result.fitGapStatus === 'OPTIMAL'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'">
                      {{ s.familyAssessment.result.fitGapStatus }}
                    </span>
                    <span v-else-if="s.familyAssessment" class="text-xs text-gray-400">Belum selesai</span>
                    <span v-else class="text-xs text-gray-300">—</span>
                  </td>
                  <td class="px-4 py-3 text-xs text-gray-400">{{ fmtDate(s.createdAt) }}</td>
                  <td class="px-4 py-3">
                    <NuxtLink v-if="s.status === 'completed'" :to="`/results/${s.publicId}`"
                      target="_blank" class="text-xs text-brand-600 hover:underline">Lihat</NuxtLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
            <span>{{ surveyData?.total ?? 0 }} survei</span>
            <div class="flex gap-2">
              <button :disabled="surveyPage <= 1" @click="surveyPage--" class="disabled:opacity-40">←</button>
              <span>{{ surveyPage }} / {{ surveyData?.pages ?? 1 }}</span>
              <button :disabled="surveyPage >= (surveyData?.pages ?? 1)" @click="surveyPage++" class="disabled:opacity-40">→</button>
            </div>
          </div>
        </div>
      </section>

      <!-- ───────── KEUANGAN ───────── -->
      <section v-else-if="activeTab === 'keuangan'">
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 class="text-base font-semibold text-gray-900">Keuangan & Payout Mitra</h2>
          <div class="flex flex-wrap items-center gap-2">
            <input v-model="commSearch" type="search" placeholder="Cari nama / email / no HP mitra..."
              class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm w-60 focus:border-brand-400 focus:outline-none" />
            <select v-model="commStatus" class="rounded-lg border border-gray-200 px-3 py-1.5 text-sm">
              <option value="">Semua</option>
              <option value="pending">Pending</option>
              <option value="paid">Dibayar</option>
            </select>
          </div>
        </div>
        <div v-if="commPending" class="py-16 text-center text-sm text-gray-400">Memuat komisi...</div>
        <template v-else>
          <div v-if="commData?.pendingTotal" class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p class="text-sm font-semibold text-amber-800">
              Komisi belum dibayar: <span class="text-amber-900">{{ fmtRp(commData.pendingTotal) }}</span>
              ({{ commData.pendingCount }} transaksi)
            </p>
          </div>
          <div class="card overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full text-sm">
                <thead>
                  <tr class="border-b border-gray-100 bg-gray-50 text-left text-xs text-gray-400">
                    <th class="px-4 py-3 font-medium">Mitra</th>
                    <th class="px-4 py-3 font-medium">Jumlah</th>
                    <th class="px-4 py-3 font-medium">Status</th>
                    <th class="px-4 py-3 font-medium">Tanggal</th>
                    <th class="px-4 py-3 font-medium">Dibayar</th>
                    <th class="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="c in commData?.commissions" :key="c.id"
                    class="border-b border-gray-50 hover:bg-gray-25">
                    <td class="px-4 py-3">
                      <p class="font-medium text-gray-900">{{ c.partner.name }}</p>
                      <p class="text-xs text-gray-400">{{ c.partner.phone }}</p>
                    </td>
                    <td class="px-4 py-3 font-semibold text-gray-900">{{ fmtRp(c.amount) }}</td>
                    <td class="px-4 py-3">
                      <span class="rounded-full px-2 py-0.5 text-xs font-semibold"
                        :class="c.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'">
                        {{ c.status === 'paid' ? 'Dibayar' : 'Pending' }}
                      </span>
                    </td>
                    <td class="px-4 py-3 text-xs text-gray-400">{{ fmtDate(c.createdAt) }}</td>
                    <td class="px-4 py-3 text-xs text-gray-400">{{ c.paidAt ? fmtDate(c.paidAt) : '—' }}</td>
                    <td class="px-4 py-3">
                      <button v-if="c.status === 'pending'" @click="payCommission(c.id)"
                        class="text-xs text-emerald-600 hover:text-emerald-800 font-medium">Tandai Dibayar</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="flex items-center justify-between border-t border-gray-100 px-4 py-3 text-xs text-gray-400">
              <span>{{ commData?.total ?? 0 }} transaksi</span>
              <div class="flex gap-2">
                <button :disabled="commPage <= 1" @click="commPage--" class="disabled:opacity-40">←</button>
                <span>{{ commPage }} / {{ commData?.pages ?? 1 }}</span>
                <button :disabled="commPage >= (commData?.pages ?? 1)" @click="commPage++" class="disabled:opacity-40">→</button>
              </div>
            </div>
          </div>
        </template>
      </section>

    </main>

    <!-- ───────── GENERATE VOUCHER MODAL ───────── -->
    <div v-if="showGenModal" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div class="card w-full max-w-sm p-6">
        <h3 class="mb-4 text-base font-semibold text-gray-900">Generate Voucher Baru</h3>
        <form @submit.prevent="generateVouchers">
          <div class="space-y-3">
            <div>
              <label class="text-xs font-medium text-gray-600">Prefix</label>
              <input v-model="genForm.prefix" maxlength="10"
                class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="PMB" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600">Jumlah Kode</label>
              <input v-model.number="genForm.count" type="number" min="1" max="100"
                class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600">Kuota per Kode</label>
              <input v-model.number="genForm.quota" type="number" min="1"
                class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="text-xs font-medium text-gray-600">Kadaluarsa (opsional)</label>
              <input v-model="genForm.expiresAt" type="date"
                class="mt-1 block w-full rounded-lg border border-gray-200 px-3 py-2 text-sm" />
            </div>
          </div>
          <div v-if="genResult" class="mt-3 rounded-lg bg-gray-50 p-3 text-xs">
            <p class="font-semibold text-gray-700">{{ genResult.created }} kode dibuat:</p>
            <p v-for="code in genResult.codes" :key="code" class="font-mono text-gray-600">{{ code }}</p>
          </div>
          <div class="mt-4 flex gap-2">
            <button type="button" @click="closeGenModal" class="flex-1 rounded-xl border border-gray-200 py-2 text-sm text-gray-600 hover:bg-gray-50">Tutup</button>
            <button type="submit" :disabled="genLoading" class="btn-primary flex-1 justify-center text-sm">
              {{ genLoading ? 'Membuat...' : 'Generate' }}
            </button>
          </div>
        </form>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'owner-auth' })
useSeoMeta({ title: 'Owner Dashboard — PetaMinatBakat', robots: 'noindex' })

const TABS = [
  { key: 'ringkasan', label: 'Ringkasan' },
  { key: 'voucher', label: 'Voucher' },
  { key: 'mitra', label: 'Mitra' },
  { key: 'sekolah', label: 'Sekolah' },
  { key: 'survei', label: 'Survei' },
  { key: 'keuangan', label: 'Keuangan' },
]

const activeTab = ref<string>('ringkasan')

// ── Stats ──
const { data: stats, pending: statsPending, error: statsError, refresh: refreshStats } = useFetch('/api/owner/stats', { server: false })
watch(statsError, (e) => { if (e) console.error('[owner/stats]', e) })

const trendWidth = 600
const trendCoords = computed(() => {
  const pts = stats.value?.trend ?? []
  if (!pts.length) return []
  const maxCount = Math.max(1, ...pts.map((p: { count: number }) => p.count))
  return pts.map((p: { count: number }, i: number) => ({
    x: (i / (pts.length - 1)) * trendWidth,
    y: 70 - (p.count / maxCount) * 60,
  }))
})
const trendPoints = computed(() =>
  trendCoords.value.map((p: { x: number; y: number }) => `${p.x},${p.y}`).join(' '),
)

// ── Voucher ──
const voucherPage = ref(1)
const voucherSearch = ref('')
const voucherQ = useDebounce(voucherSearch, 400)
watch(voucherQ, () => { voucherPage.value = 1 })
const { data: voucherData, pending: voucherPending, refresh: refreshVouchers } = useFetch(
  () => {
    const qs = new URLSearchParams({ page: String(voucherPage.value) })
    if (voucherQ.value) qs.set('q', voucherQ.value)
    return `/api/owner/vouchers?${qs}`
  },
  { server: false },
)

async function deactivateVoucher(id: number) {
  await $fetch(`/api/owner/vouchers/${id}/deactivate`, { method: 'POST' })
  refreshVouchers()
}

// ── Voucher modal ──
const showGenModal = ref(false)
const genLoading = ref(false)
const genResult = ref<{ created: number; codes: string[] } | null>(null)
const genForm = reactive({ prefix: 'PMB', count: 1, quota: 1, expiresAt: '' })

async function generateVouchers() {
  genLoading.value = true
  try {
    genResult.value = await $fetch('/api/owner/vouchers/generate', {
      method: 'POST',
      body: {
        prefix: genForm.prefix || 'PMB',
        count: genForm.count,
        quota: genForm.quota,
        expiresAt: genForm.expiresAt || undefined,
      },
    }) as { created: number; codes: string[] }
    refreshVouchers()
  } finally {
    genLoading.value = false
  }
}

function closeGenModal() {
  showGenModal.value = false
  genResult.value = null
  Object.assign(genForm, { prefix: 'PMB', count: 1, quota: 1, expiresAt: '' })
}

// ── Mitra ──
const mitraStatus = ref('')
const mitraSearch = ref('')
const mitraQ = useDebounce(mitraSearch, 400)
const mitraPage = ref(1)
watch([mitraStatus, mitraQ], () => { mitraPage.value = 1 })
const { data: mitraData, pending: mitraPending, refresh: refreshMitra } = useFetch(
  () => {
    const qs = new URLSearchParams({ page: String(mitraPage.value) })
    if (mitraStatus.value) qs.set('status', mitraStatus.value)
    if (mitraQ.value) qs.set('q', mitraQ.value)
    return `/api/owner/mitra?${qs}`
  },
  { server: false },
)

async function approveMitra(id: number) {
  await $fetch(`/api/owner/mitra/${id}/approve`, { method: 'POST' })
  refreshMitra()
}

async function suspendMitra(id: number, action: 'suspend' | 'unsuspend') {
  await $fetch(`/api/owner/mitra/${id}/suspend`, { method: 'POST', body: { action } })
  refreshMitra()
}

// ── Sekolah ──
const sekolahSearch = ref('')
const sekolahQ = useDebounce(sekolahSearch, 400)
const sekolahPage = ref(1)
watch(sekolahQ, () => { sekolahPage.value = 1 })
const { data: sekolahData, pending: sekolahPending, refresh: refreshSekolah } = useFetch(
  () => {
    const qs = new URLSearchParams({ page: String(sekolahPage.value) })
    if (sekolahQ.value) qs.set('q', sekolahQ.value)
    return `/api/owner/sekolah?${qs}`
  },
  { server: false },
)

async function activateSekolah(id: number, billingStatus = 'active') {
  await $fetch(`/api/owner/sekolah/${id}/activate`, { method: 'POST', body: { billingStatus } })
  refreshSekolah()
}

// ── Survei ──
const surveyStatus = ref('')
const surveySearch = ref('')
const surveyQ = useDebounce(surveySearch, 400)
const surveyPage = ref(1)
watch([surveyStatus, surveyQ], () => { surveyPage.value = 1 })
const { data: surveyData, pending: surveyPending } = useFetch(
  () => {
    const qs = new URLSearchParams({ page: String(surveyPage.value) })
    if (surveyStatus.value) qs.set('status', surveyStatus.value)
    if (surveyQ.value) qs.set('q', surveyQ.value)
    return `/api/owner/surveys?${qs}`
  },
  { server: false },
)

// ── Keuangan / Komisi ──
const commStatus = ref('')
const commSearch = ref('')
const commQ = useDebounce(commSearch, 400)
const commPage = ref(1)
watch([commStatus, commQ], () => { commPage.value = 1 })
const { data: commData, pending: commPending, refresh: refreshComm } = useFetch(
  () => {
    const qs = new URLSearchParams({ page: String(commPage.value) })
    if (commStatus.value) qs.set('status', commStatus.value)
    if (commQ.value) qs.set('q', commQ.value)
    return `/api/owner/commissions?${qs}`
  },
  { server: false },
)

async function payCommission(id: number) {
  await $fetch(`/api/owner/commissions/${id}/pay`, { method: 'POST' })
  refreshComm()
}

// ── Utils ──
function fmtRp(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n)
}

function fmtDate(d: string | Date) {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

async function logout() {
  await $fetch('/api/owner/logout', { method: 'POST' })
  await navigateTo('/owner/login')
}
</script>
