<template>
  <main class="min-h-screen font-body">
    <ToastContainer :toasts="toasts" />

    <!-- Navbar -->
    <nav class="sticky top-0 z-50 flex items-center justify-between border-b border-gray-200 bg-white/95 px-6 py-4 backdrop-blur-sm">
      <span class="text-base font-bold text-gray-950">PetaBakat</span>
      <div class="flex items-center gap-3">
        <NuxtLink to="/history" class="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
          Cek Riwayat
        </NuxtLink>
        <NuxtLink to="/survey" class="btn-primary px-4 py-2 text-sm">
          Mulai Survey
        </NuxtLink>
      </div>
    </nav>

    <!-- Hero -->
    <section class="px-6 pb-16 pt-20 text-center">
      <div class="mx-auto max-w-2xl">
        <span class="mb-4 inline-flex items-center gap-1.5 rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
          ✦ Framework Nasab &amp; Hasab · Berbasis AI
        </span>
        <h1 class="mt-4 text-5xl font-bold leading-tight tracking-tight text-gray-950 sm:text-6xl">
          Kenali Potensi Anak dari<br><span class="text-brand-500">Akar Keluarganya</span>
        </h1>
        <p class="mt-6 text-lg leading-relaxed text-gray-600">
          Bukan zodiak, bukan tebakan. PetaBakat memetakan kecenderungan potensi anak berdasarkan
          rekam jejak karakter keluarga besar (<strong class="text-gray-900">Nasab &amp; Hasab</strong>) —
          framework pengasuhan Islami yang dianalisis AI menjadi persona, skor 4 rumpun, dan rekomendasi les yang personal.
        </p>

        <!-- Benefit pills -->
        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <span v-for="pill in pills" :key="pill" class="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs text-gray-600 shadow-sm">{{ pill }}</span>
        </div>

        <div class="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <NuxtLink to="/survey" class="btn-primary-lg">
            Mulai Survey Sekarang
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd" />
            </svg>
          </NuxtLink>
          <NuxtLink to="/history" class="btn-secondary px-6 py-3 text-base">
            Cek Riwayat
          </NuxtLink>
        </div>
        <p class="mt-3 text-xs text-gray-400">Gratis · ~5-10 menit · Hasil PDF + WhatsApp</p>

        <p class="mt-5 mx-auto max-w-lg rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
          ⚠️ Hasil survei ini bersifat <strong class="text-gray-600">indikatif</strong> dan dihasilkan oleh AI berdasarkan framework Nasab &amp; Hasab.
          Bukan pengganti asesmen psikolog, dokter anak, atau konselor pendidikan.
          Orang tua tetap penentu terbaik dalam mengenali potensi anaknya.
        </p>
      </div>
    </section>

    <!-- Preview Contoh Hasil — Elsha Navya -->
    <section class="border-t border-gray-100 bg-gray-25 px-6 py-16">
      <div class="mx-auto max-w-3xl">
        <div class="mb-8 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-brand-600">Contoh Nyata</p>
          <h2 class="mt-2 text-2xl font-bold text-gray-950">Seperti Apa Hasilnya?</h2>
          <p class="mt-2 text-sm text-gray-500">Contoh hasil analisis nyata dari salah satu pengguna PetaBakat.</p>
        </div>

        <div class="card overflow-hidden">
          <!-- Header persona -->
          <div class="bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-5">
            <p class="text-xs font-semibold uppercase tracking-widest text-brand-100">Persona Potensi Anak</p>
            <h3 class="mt-1 text-2xl font-bold text-white">✦ The Curious Maker</h3>
            <p class="mt-1 text-sm text-brand-100">Elsha Navya · 11 tahun · Perempuan</p>
          </div>

          <div class="px-6 py-5">
            <!-- Deskripsi singkat -->
            <p class="text-sm leading-relaxed text-gray-700">
              Elsha adalah sosok yang langka — ia bukan hanya pemikir, tetapi juga pembangun. Profil skornya yang seimbang
              mencerminkan pribadi yang utuh: berpikir tajam, bekerja tuntas, merasakan keindahan, dan tetap terhubung dengan sekitarnya.
            </p>

            <!-- Skor 4 rumpun -->
            <div class="mt-5 space-y-2.5">
              <p class="text-xs font-semibold uppercase tracking-wide text-gray-400">Skor 4 Rumpun Hasab</p>
              <div v-for="r in elshaSkor" :key="r.code" class="flex items-center gap-3">
                <span class="w-5 text-base">{{ r.icon }}</span>
                <span class="w-28 shrink-0 text-xs font-medium text-gray-700">{{ r.label }}</span>
                <div class="relative flex-1 h-2.5 rounded-full bg-gray-100 overflow-hidden">
                  <div
                    class="absolute inset-y-0 left-0 rounded-full transition-all duration-700"
                    :class="r.dominant ? 'bg-brand-500' : 'bg-gray-300'"
                    :style="{ width: r.pct + '%' }"
                  />
                </div>
                <span class="w-10 text-right text-xs font-semibold" :class="r.dominant ? 'text-brand-600' : 'text-gray-400'">
                  {{ r.pct }}%
                </span>
              </div>
            </div>

            <!-- Rekomendasi les preview -->
            <div class="mt-5">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Rekomendasi Aktivitas (Jalur Utama)</p>
              <div class="space-y-2">
                <div v-for="(les, i) in elshaLes" :key="i" class="flex gap-2.5 rounded-xl border border-gray-100 bg-gray-25 px-4 py-2.5">
                  <span class="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-400 text-xs font-bold text-black">
                    {{ String.fromCharCode(65 + i) }}
                  </span>
                  <p class="text-xs leading-relaxed text-gray-700">{{ les }}</p>
                </div>
              </div>
            </div>

            <!-- CTA ke hasil nyata -->
            <div class="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
              <p class="text-xs text-gray-400">Laporan lengkap · radar chart · micro-dosing mingguan · PDF</p>
              <NuxtLink
                to="/results/fbc027f8-fa48-4d18-8fc6-be7a0675c57b"
                class="text-xs font-semibold text-brand-600 hover:text-brand-700 underline underline-offset-2"
              >
                Lihat laporan lengkap →
              </NuxtLink>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 4 Rumpun Hasab -->
    <section class="border-t border-gray-100 px-6 py-16">
      <div class="mx-auto max-w-5xl">
        <div class="mb-10 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-brand-600">Framework Hasab</p>
          <h2 class="mt-2 text-2xl font-bold text-gray-950">4 Rumpun Potensi</h2>
          <p class="mt-2 text-sm text-gray-500">Setiap anak memiliki kombinasi unik dari keempat rumpun ini, diwariskan dari ekosistem keluarga besar.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div v-for="cat in categories" :key="cat.code" class="card p-6 transition-shadow hover:shadow-md">
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl">
              {{ cat.icon }}
            </div>
            <h3 class="mb-1 text-sm font-semibold text-gray-900">{{ cat.name }}</h3>
            <p class="text-xs leading-relaxed text-gray-500">{{ cat.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Cara Kerja -->
    <section class="border-t border-gray-100 bg-gray-25 px-6 py-16">
      <div class="mx-auto max-w-3xl">
        <div class="mb-10 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-brand-600">Transparansi</p>
          <h2 class="mt-2 text-2xl font-bold text-gray-950">Bagaimana Cara Kerjanya?</h2>
        </div>

        <div class="mb-8 grid gap-4 sm:grid-cols-3">
          <div class="card p-5 text-center">
            <div class="mb-3 text-2xl">🔍</div>
            <h3 class="mb-1 text-sm font-semibold text-gray-900">Anda Mengamati</h3>
            <p class="text-xs leading-relaxed text-gray-500">Isi pola karakter keluarga besar dan minat alami anak — bukan tebakan, bukan zodiak.</p>
          </div>
          <div class="card p-5 text-center">
            <div class="mb-3 text-2xl">📊</div>
            <h3 class="mb-1 text-sm font-semibold text-gray-900">Sistem Menghitung</h3>
            <p class="text-xs leading-relaxed text-gray-500">Skor 4 rumpun Hasab dihitung deterministik dari jawaban Anda — transparan, bukan black box.</p>
          </div>
          <div class="card p-5 text-center">
            <div class="mb-3 text-2xl">🤖</div>
            <h3 class="mb-1 text-sm font-semibold text-gray-900">AI Menafsirkan</h3>
            <p class="text-xs leading-relaxed text-gray-500">AI menghasilkan persona, narasi, dan rekomendasi les yang personal. Akurasi bergantung pada kejujuran pengisian.</p>
          </div>
        </div>

        <!-- Tabel klaim -->
        <div class="card overflow-hidden">
          <div class="grid grid-cols-2 divide-x divide-gray-100">
            <div class="bg-brand-50 px-5 py-4">
              <p class="text-xs font-bold uppercase tracking-wider text-brand-700">✓ Kami membantu Anda…</p>
            </div>
            <div class="bg-red-50 px-5 py-4">
              <p class="text-xs font-bold uppercase tracking-wider text-red-700">✗ Kami tidak…</p>
            </div>
          </div>
          <div v-for="(row, i) in claimRows" :key="i" class="grid grid-cols-2 divide-x divide-gray-100 border-t border-gray-100">
            <div class="px-5 py-3">
              <p class="text-xs leading-relaxed text-gray-700">{{ row.yes }}</p>
            </div>
            <div class="px-5 py-3">
              <p class="text-xs leading-relaxed text-gray-500">{{ row.no }}</p>
            </div>
          </div>
        </div>

        <p class="mt-6 text-center text-xs text-gray-400">
          Ingin tahu konstruk ilmiah di balik tiap rumpun?
          <NuxtLink to="/dasar-ilmiah" class="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2">
            Baca dasar ilmiah →
          </NuxtLink>
        </p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="border-t border-gray-100 px-6 py-16">
      <div class="mx-auto max-w-2xl">
        <div class="mb-10 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-brand-600">Pertanyaan Umum</p>
          <h2 class="mt-2 text-2xl font-bold text-gray-950">Yang Sering Ditanyakan</h2>
        </div>
        <div class="space-y-3">
          <div
            v-for="(faq, i) in faqs"
            :key="i"
            class="card overflow-hidden"
          >
            <button
              class="flex w-full items-center justify-between px-5 py-4 text-left"
              @click="openFaq = openFaq === i ? null : i"
            >
              <span class="text-sm font-semibold text-gray-900">{{ faq.q }}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4 shrink-0 text-gray-400 transition-transform"
                :class="openFaq === i ? 'rotate-180' : ''"
                viewBox="0 0 20 20" fill="currentColor"
              >
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </button>
            <div v-if="openFaq === i" class="border-t border-gray-100 px-5 pb-4 pt-3">
              <p class="text-sm leading-relaxed text-gray-600">{{ faq.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Wakaf Banner -->
    <section class="border-t border-gray-100 px-6 py-12">
      <div
        class="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-brand-200"
        style="background-image: url('/wakaf-asrama.png'); background-size: cover; background-position: center;"
      >
        <div class="absolute inset-0 bg-black/60" />
        <div class="relative px-6 py-7 sm:flex sm:items-center sm:gap-6">
          <div class="mb-4 text-3xl sm:mb-0 sm:shrink-0">🕌</div>
          <div class="flex-1 min-w-0">
            <p class="text-xs font-semibold uppercase tracking-widest text-brand-300">Wakaf Pendidikan</p>
            <h3 class="mt-1 text-lg font-bold text-white">Bangun Peradaban Lewat Wakaf</h3>
            <p class="mt-1.5 text-sm leading-relaxed text-gray-200">
              Potensi anak adalah benih peradaban. Agar benih itu tumbuh, dibutuhkan lembaga pendidikan yang kuat.
              Wakafkan asrama santri Madrasah Al-Fatih — satu langkah nyata membangun generasi berilmu.
            </p>
          </div>
          <a
            href="https://tarahum.id/amal/wakaf-asrama-akhwat-madrasah-al-fatih-situ-daun-bogor?ref=AsyTTx2F"
            target="_blank"
            rel="noopener noreferrer"
            class="btn-primary-lg mt-5 shrink-0 sm:mt-0"
          >
            Wakaf Sekarang
          </a>
        </div>
      </div>
    </section>

    <!-- CTA Bottom -->
    <section class="border-t border-gray-100 bg-gray-25 px-6 py-16 text-center">
      <div class="mx-auto max-w-xl">
        <h2 class="text-2xl font-bold text-gray-950">Siap memetakan potensi anak?</h2>
        <p class="mt-3 text-sm text-gray-500">Gratis · ~5-10 menit · Hasil PDF + WhatsApp · Tanpa buat akun</p>
        <NuxtLink to="/survey" class="btn-primary-lg mt-8 inline-flex">
          Mulai Survey Sekarang
        </NuxtLink>
      </div>
    </section>

    <!-- Otomatisin Banner -->
    <OtomatisinBanner />

    <!-- Footer -->
    <footer class="border-t border-gray-100 px-6 py-6 text-center">
      <p class="text-xs text-gray-400"><strong class="text-gray-500">© 2026 PetaBakat </strong></p>
      <p class="mt-2 text-xs text-gray-400">
        Dikembangkan oleh
        <a href="https://www.otomatisin.web.id/" target="_blank" rel="noopener noreferrer" class="font-medium text-gray-500 hover:text-gray-700">Otomatisin</a>
      </p>
    </footer>
  </main>
</template>

<script setup>
useHead({
  title: 'Cek Bakat Anak Online Berbasis Nasab & Hasab — PetaBakat',
  meta: [
    {
      name: 'description',
      content: 'Kenali potensi anak dari rekam jejak karakter keluarga besar menggunakan framework Nasab & Hasab. Analisis AI menghasilkan persona, skor 4 rumpun, micro-dosing mingguan, dan rekomendasi les yang personal. Gratis.',
    },
    { property: 'og:title', content: 'PetaBakat — Peta Potensi Anak dari Nasab & Hasab' },
    { property: 'og:description', content: 'Framework pengasuhan Islami berbasis AI. Kenali rumpun kecerdasan dominan anak dan dapatkan rekomendasi aktivitas yang personal.' },
  ],
})

const { toasts, add: addToast } = useToast()
const { data: recentResults } = await useFetch('/api/recent-results')

onMounted(() => {
  if (!recentResults.value?.length) return
  let index = 0
  addToast(formatToastMessage(recentResults.value[0]), 5000)
  const interval = setInterval(() => {
    index = (index + 1) % recentResults.value.length
    addToast(formatToastMessage(recentResults.value[index]), 5000)
  }, 5000)
  onBeforeUnmount(() => clearInterval(interval))
})

function formatToastMessage(result) {
  return `${result.childName} baru saja mendapatkan pemetaan persona: ${result.personaLabel}.`
}

const openFaq = ref(null)

const pills = [
  '✓ Gratis & tanpa akun',
  '✓ Berbasis Al-Qur\'an & Sunnah',
  '✓ Analisis AI personal',
  '✓ Laporan PDF',
  '✓ Rekomendasi les spesifik',
]

const elshaSkor = [
  { code: 'ilmi',   icon: '📚', label: 'Al-Ilmi',   pct: 26.58, dominant: true  },
  { code: 'amali',  icon: '🛠️', label: 'Al-Amali',  pct: 26.58, dominant: true  },
  { code: 'wajdan', icon: '🎨', label: 'Al-Wajdan', pct: 25.32, dominant: false },
  { code: 'asyiha', icon: '🤝', label: 'Al-Qiyadah', pct: 21.52, dominant: false },
]

const elshaLes = [
  'Kelas Science Club / Eksperimen Sains Anak (program Young Scientist atau lembaga sains lokal)',
  'Kelas Prakarya & Desain Produk Anak (workshop Craft & Make, sanggar seni DIY)',
  'Kelas Menggambar & Ilustrasi (Crayonpedia, sanggar seni lokal terdekat)',
]

const categories = [
  { code: 'asyiha', name: 'Hasab Al-Qiyadah', description: 'Kepemimpinan, komunikasi, empati sosial, dan pengaruh positif', icon: '🤝' },
  { code: 'ilmi',   name: 'Hasab Al-Ilmi',   description: 'Kecerdasan intelektual, analitis, ingin tahu, dan pencinta ilmu', icon: '📚' },
  { code: 'amali',  name: 'Hasab Al-Amali',  description: 'Teknis, praktis, bisnis, eksekusi, dan keterampilan tangan', icon: '🛠️' },
  { code: 'wajdan', name: 'Hasab Al-Wajdan', description: 'Estetika, rasa, intuisi, spiritual, dan ekspresi diri', icon: '🎨' },
]

const claimRows = [
  { yes: 'Merapikan pengamatan Anda tentang karakter keluarga besar', no: 'Mengklaim ini setara tes psikologi formal' },
  { yes: 'Memberikan gambaran kecenderungan potensi anak saat ini', no: 'Menjanjikan deteksi bakat yang pasti akurat' },
  { yes: 'Menyarankan aktivitas dan les yang sesuai persona anak', no: 'Menentukan jurusan, karier, atau masa depan anak' },
  { yes: 'Membantu memilih les sebagai titik awal trial', no: 'Menggantikan asesmen psikolog atau dokter anak' },
  { yes: 'Bisa diisi ulang jika pola keluarga/anak berubah', no: 'Menilai bakat dari tanggal lahir atau zodiak' },
]

const faqs = [
  {
    q: 'Apakah ini sama dengan tes IQ atau tes psikologi?',
    a: 'Tidak. PetaBakat bukan tes psikologi formal. Ini adalah alat bantu refleksi orang tua yang merapikan pengamatan tentang karakter keluarga besar dan minat anak menjadi peta kecenderungan. Untuk kebutuhan diagnosis klinis, tetap libatkan psikolog atau dokter anak.',
  },
  {
    q: 'Kenapa framework-nya Islam (Nasab & Hasab)?',
    a: 'Konsep Nasab (garis keturunan) dan Hasab (rekam jejak kemuliaan keluarga) adalah dua konstruk Islam yang relevan secara psikologis — riset modern mendukung bahwa karakter dan potensi anak dipengaruhi ekosistem keluarga. Pendekatan ini dikembangkan dari pemikiran Ustadz Budi Ashari, Lc. (Parenting Nabawiyah).',
  },
  {
    q: 'Berapa lama dan apakah berbayar?',
    a: 'Sekitar 5–10 menit untuk mengisi survei. Sepenuhnya gratis dan tidak perlu membuat akun — hasil tersimpan dan bisa diakses kapan saja via nomor WhatsApp.',
  },
  {
    q: 'Apakah hasilnya bisa berubah seiring waktu?',
    a: 'Ya. Karakter anak bersifat dinamis dan dipengaruhi lingkungan. Anda bisa mengisi ulang survei jika pola keluarga atau minat anak berubah signifikan. Setiap pengisian menghasilkan laporan baru yang tersimpan di riwayat.',
  },
  {
    q: 'Bagaimana rekomendasi les dihasilkan?',
    a: 'AI menganalisis kombinasi skor 4 rumpun, usia, jenis kelamin, dan minat alami anak yang Anda isi. Hasilnya berupa 3 rekomendasi jalur utama yang spesifik dan bisa langsung dicari, plus 1 aktivitas pendukung dari rumpun ke-2.',
  },
]
</script>
