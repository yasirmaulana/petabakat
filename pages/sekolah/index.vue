<template>
  <div class="min-h-screen bg-white font-body">
    <header class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
      <NuxtLink to="/" class="text-sm font-semibold text-gray-900 hover:text-gray-600">← PetaMinatBakat</NuxtLink>
      <NuxtLink to="/sekolah/login" class="btn-secondary px-4 py-2 text-sm">Login Sekolah</NuxtLink>
    </header>

    <!-- Hero -->
    <section class="mx-auto max-w-4xl px-6 py-16 text-center">
      <span class="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Dashboard Sekolah</span>
      <h1 class="mt-5 text-4xl font-bold text-gray-950 leading-tight">Petakan Potensi Seluruh Siswa<br>dalam Satu Dashboard</h1>
      <p class="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Lihat sebaran rumpun Hasab per kelas, identifikasi siswa untuk program khusus, dan export laporan untuk wali murid — semua berbasis framework Islam.</p>
      <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink to="/sekolah/daftar" class="btn-primary px-6 py-3">Daftarkan Sekolah →</NuxtLink>
        <a href="https://wa.me/6281586245143?text=Halo%2C+saya+ingin+tahu+tentang+Dashboard+Sekolah+PetaMinatBakat" target="_blank" class="btn-secondary px-6 py-3">Tanya via WhatsApp</a>
      </div>
    </section>

    <!-- Value props -->
    <section class="bg-gray-50 px-6 py-14">
      <div class="mx-auto max-w-4xl grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="v in values" :key="v.title" class="card p-5 space-y-2">
          <span class="text-2xl">{{ v.icon }}</span>
          <h3 class="font-semibold text-gray-900 text-sm">{{ v.title }}</h3>
          <p class="text-xs text-gray-500 leading-relaxed">{{ v.desc }}</p>
        </div>
      </div>
    </section>

    <!-- Paket -->
    <section class="mx-auto max-w-4xl px-6 py-16">
      <h2 class="text-center text-2xl font-bold text-gray-950 mb-8">Paket Langganan</h2>
      <div class="grid gap-5 sm:grid-cols-3">
        <div v-for="p in plans" :key="p.name" class="card p-6 space-y-4" :class="p.highlight ? 'border-brand-300 ring-1 ring-brand-300' : ''">
          <div>
            <p class="text-xs font-semibold uppercase tracking-wider text-gray-400">{{ p.tag }}</p>
            <h3 class="mt-1 text-xl font-bold text-gray-950">{{ p.name }}</h3>
            <p class="mt-1 text-2xl font-bold text-brand-600">{{ p.price }}</p>
            <p class="text-xs text-gray-400">{{ p.cap }}</p>
          </div>
          <ul class="space-y-1.5 text-xs text-gray-600">
            <li v-for="f in p.features" :key="f" class="flex gap-2"><span class="text-brand-500">✓</span>{{ f }}</li>
          </ul>
          <NuxtLink to="/sekolah/daftar" class="btn-primary block text-center px-4 py-2.5 text-sm">Daftar Paket Ini</NuxtLink>
        </div>
      </div>
      <p class="mt-4 text-center text-xs text-gray-400">Laporan per siswa Rp 65.000 (harga partner), terpisah dari biaya langganan dashboard.</p>
    </section>

    <!-- Cara kerja -->
    <section class="bg-gray-50 px-6 py-12">
      <div class="mx-auto max-w-2xl">
        <h2 class="text-center text-2xl font-bold text-gray-950 mb-8">Cara Kerja</h2>
        <ol class="space-y-4">
          <li v-for="(s, i) in steps" :key="i" class="flex gap-4">
            <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-400 text-sm font-bold text-black">{{ i + 1 }}</div>
            <div>
              <p class="font-semibold text-gray-900 text-sm">{{ s.title }}</p>
              <p class="text-xs text-gray-500 mt-0.5">{{ s.desc }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- CTA -->
    <section class="px-6 py-12 text-center">
      <h2 class="text-2xl font-bold text-gray-950">Siap membawa sekolah Anda ke level berikutnya?</h2>
      <NuxtLink to="/sekolah/daftar" class="mt-6 inline-block btn-primary px-8 py-3">Daftar Sekarang →</NuxtLink>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({ title: 'Dashboard Sekolah — PetaMinatBakat', description: 'Petakan potensi seluruh siswa dengan framework Nasab & Hasab. Dashboard analitik untuk SDIT, SMPIT, pesantren, dan homeschooling.' })

const values = [
  { icon: '📊', title: 'Sebaran Rumpun per Kelas', desc: 'Lihat distribusi Al-Qiyadah, Al-Ilmi, Al-Amali, Al-Wajdan per kelas sebagai bahan rapat guru.' },
  { icon: '🔍', title: 'Identifikasi Potensi Khusus', desc: 'Filter siswa berdasarkan rumpun dominan untuk program ekstrakurikuler yang tepat sasaran.' },
  { icon: '📁', title: 'Export CSV', desc: 'Export data aggregate siswa untuk laporan ke wali murid atau kepala sekolah.' },
  { icon: '🔒', title: 'Privasi Terjaga', desc: 'Orang tua consent eksplisit sebelum data dibagikan. Nomor WA orang tua tidak pernah tampil di dashboard.' },
]

const plans = [
  { tag: 'Starter', name: 'Starter', price: 'Rp 150.000', cap: 'per bulan · maks. 30 siswa', highlight: false, features: ['Dashboard overview', 'Daftar siswa + filter kelas', 'Export CSV', 'Kode sekolah unik'] },
  { tag: 'Paling Populer', name: 'Growth', price: 'Rp 350.000', cap: 'per bulan · maks. 100 siswa', highlight: true, features: ['Semua Starter +', 'Analytics per kelas', 'Bar chart distribusi rumpun', 'Multi-guru (role teacher)'] },
  { tag: 'Enterprise', name: 'Pesantren', price: 'Rp 700.000', cap: 'per bulan · maks. 300 siswa', highlight: false, features: ['Semua Growth +', 'Multi-angkatan', 'Konselor role', 'Support prioritas'] },
]

const steps = [
  { title: 'Daftar & Aktivasi', desc: 'Isi form pendaftaran sekolah. Admin kami verifikasi dan aktifkan akun dalam 1–2 hari kerja.' },
  { title: 'Bagikan Kode Sekolah', desc: 'Sekolah dapat kode unik (contoh: SDIT-ALFATIH-2026). Share ke orang tua saat undang survei.' },
  { title: 'Orang Tua Isi Survei', desc: 'Orang tua isi survei PetaMinatBakat, masukkan kode sekolah, dan centang consent berbagi data.' },
  { title: 'Data Masuk Dashboard', desc: 'Data siswa yang consent otomatis terhubung ke dashboard sekolah. Lihat sebaran, filter kelas, export.' },
]
</script>
