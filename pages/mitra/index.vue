<template>
  <div class="min-h-screen bg-white font-body">
    <!-- Nav -->
    <header class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
      <NuxtLink to="/" class="text-sm font-semibold text-gray-900 hover:text-gray-600">← PetaMinatBakat</NuxtLink>
      <NuxtLink to="/mitra/login" class="btn-secondary px-4 py-2 text-sm">Login Mitra</NuxtLink>
    </header>

    <!-- Hero -->
    <section class="mx-auto max-w-4xl px-6 py-16 text-center">
      <span class="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">Program Kemitraan</span>
      <h1 class="mt-5 text-4xl font-bold text-gray-950 leading-tight">Tambahkan Nilai di Program Anda<br>dengan Pemetaan Potensi Anak</h1>
      <p class="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">Dua jalur kemitraan untuk bimbel, lembaga pendidikan, dan affiliate personal — dengan harga grosir atau komisi per konversi.</p>
      <div class="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
        <NuxtLink to="/mitra/daftar" class="btn-primary px-6 py-3">Daftar Jadi Mitra →</NuxtLink>
        <a href="https://wa.me/6281586245143?text=Halo%2C+saya+ingin+tahu+lebih+lanjut+tentang+program+mitra+PetaMinatBakat" target="_blank" class="btn-secondary px-6 py-3">Tanya via WhatsApp</a>
      </div>
    </section>

    <!-- Dua tipe mitra -->
    <section class="mx-auto max-w-4xl px-6 pb-16">
      <div class="grid gap-6 sm:grid-cols-2">
        <!-- Tipe A -->
        <div class="card p-6 space-y-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-100 text-brand-700 font-bold">A</div>
          <h2 class="text-xl font-bold text-gray-950">Mitra Institusi</h2>
          <p class="text-sm text-gray-500">Untuk bimbel, pusat try-out, lembaga parenting, pesantren, dan sanggar.</p>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex gap-2"><span class="text-brand-500 font-bold">✓</span> Harga grosir <strong>Rp 65.000/laporan</strong> (min. 10)</li>
            <li class="flex gap-2"><span class="text-brand-500 font-bold">✓</span> Generate & kelola kode voucher sendiri</li>
            <li class="flex gap-2"><span class="text-brand-500 font-bold">✓</span> Dashboard: kredit, laporan, export CSV</li>
            <li class="flex gap-2"><span class="text-brand-500 font-bold">✓</span> Data aggregate anak didik untuk konseling</li>
            <li class="flex gap-2"><span class="text-brand-500 font-bold">✓</span> Bebas markup ke orang tua</li>
          </ul>
          <NuxtLink to="/mitra/daftar?type=institutional" class="btn-primary block text-center px-4 py-2.5 text-sm">Daftar Mitra Institusi</NuxtLink>
        </div>

        <!-- Tipe B -->
        <div class="card p-6 space-y-4">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">B</div>
          <h2 class="text-xl font-bold text-gray-950">Mitra Personal</h2>
          <p class="text-sm text-gray-500">Untuk guru freelance, konsultan parenting, alumni Parenting Nabawiyah, pengurus majelis taklim.</p>
          <ul class="space-y-2 text-sm text-gray-700">
            <li class="flex gap-2"><span class="text-amber-500 font-bold">✓</span> Komisi <strong>Rp 20.000</strong> per laporan terjual</li>
            <li class="flex gap-2"><span class="text-amber-500 font-bold">✓</span> Kode referral unik untuk tracking</li>
            <li class="flex gap-2"><span class="text-amber-500 font-bold">✓</span> Tidak perlu modal — murni affiliate</li>
            <li class="flex gap-2"><span class="text-amber-500 font-bold">✓</span> Dashboard: konversi, komisi, pencairan</li>
            <li class="flex gap-2"><span class="text-amber-500 font-bold">✓</span> Cairkan komisi tiap bulan via transfer</li>
          </ul>
          <NuxtLink to="/mitra/daftar?type=affiliate" class="block rounded-xl border border-amber-300 bg-amber-50 px-4 py-2.5 text-center text-sm font-semibold text-amber-800 hover:bg-amber-100 transition-colors">Daftar Mitra Personal</NuxtLink>
        </div>
      </div>
    </section>

    <!-- Tabel harga -->
    <section class="bg-gray-50 px-6 py-12">
      <div class="mx-auto max-w-2xl">
        <h2 class="text-center text-2xl font-bold text-gray-950 mb-6">Skema Harga</h2>
        <div class="card overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-100 text-xs font-semibold uppercase text-gray-500">
              <tr>
                <th class="px-4 py-3 text-left">Tier</th>
                <th class="px-4 py-3 text-left">Harga</th>
                <th class="px-4 py-3 text-left">Cara Beli</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100">
              <tr>
                <td class="px-4 py-3 font-medium text-gray-900">Direct (1 laporan)</td>
                <td class="px-4 py-3 text-gray-700">Rp 99.000</td>
                <td class="px-4 py-3 text-gray-500">WA admin → dapat kode voucher</td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium text-gray-900">Reseller / Bimbel</td>
                <td class="px-4 py-3 text-gray-700">Rp 65.000/kode</td>
                <td class="px-4 py-3 text-gray-500">Beli batch min. 10 kode via WA admin</td>
              </tr>
              <tr>
                <td class="px-4 py-3 font-medium text-gray-900">Affiliate Personal</td>
                <td class="px-4 py-3 text-gray-700">Rp 20.000/konversi</td>
                <td class="px-4 py-3 text-gray-500">Komisi otomatis via kode referral</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Testimoni placeholder -->
    <section class="mx-auto max-w-4xl px-6 py-16">
      <h2 class="text-center text-2xl font-bold text-gray-950 mb-8">Yang Mitra Katakan</h2>
      <div class="grid gap-5 sm:grid-cols-2">
        <div v-for="t in testimonials" :key="t.name" class="card p-5 flex flex-col gap-4">
          <p class="text-sm leading-relaxed text-gray-700 flex-1">"{{ t.quote }}"</p>
          <div class="flex items-center gap-3 border-t border-gray-100 pt-4">
            <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700">{{ t.name.charAt(0) }}</div>
            <div>
              <p class="text-xs font-semibold text-gray-900">{{ t.name }}</p>
              <p class="text-xs text-gray-400">{{ t.meta }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="bg-brand-50 border-t border-brand-100 px-6 py-12 text-center">
      <h2 class="text-2xl font-bold text-gray-950">Siap bermitra?</h2>
      <p class="mt-2 text-sm text-gray-500">Isi form pendaftaran — admin akan menghubungi dalam 1–2 hari kerja.</p>
      <NuxtLink to="/mitra/daftar" class="mt-6 inline-block btn-primary px-8 py-3">Daftar Sekarang →</NuxtLink>
    </section>
  </div>
</template>

<script setup>
useSeoMeta({ title: 'Program Kemitraan — PetaMinatBakat', description: 'Bergabung sebagai mitra institusi atau affiliate PetaMinatBakat. Harga grosir Rp 65.000/laporan atau komisi Rp 20.000/konversi.' })

const testimonials = [
  { name: 'Nama Mitra 1', meta: 'Bimbel · Kota', quote: 'Placeholder testimoni mitra institusi...' },
  { name: 'Nama Mitra 2', meta: 'Affiliate Personal · Kota', quote: 'Placeholder testimoni mitra affiliate...' },
]
</script>
