<template>
  <main class="min-h-screen font-body">
    <!-- Navbar minimal -->
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
    <section class="px-6 py-20 text-center">
      <div class="mx-auto max-w-2xl">
        <span class="mb-4 inline-flex items-center rounded-full border border-brand-300 bg-brand-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-brand-700">
          Survey Potensi Anak
        </span>
        <h1 class="mt-4 text-5xl font-bold leading-tight tracking-tight text-gray-950 sm:text-6xl">
          Peta<span class="text-brand-500">Bakat</span>
        </h1>
        <p class="mt-6 text-lg leading-relaxed text-gray-600">
          Kenali potensi emas anak dari akar <strong class="text-gray-900">Nasab</strong> dan <strong class="text-gray-900">Hasab</strong> keluarga.
          Temukan rumpun kecerdasan dominan, persona potensi, serta rencana stimulasi mingguan yang personal.
        </p>
        <div class="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
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
        <p class="mt-4 text-xs text-gray-400">Butuh ~5-10 menit · Hasil bisa diunduh PDF</p>
        <p class="mt-5 mx-auto max-w-lg rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-xs leading-relaxed text-gray-500">
          ⚠️ Hasil survei ini bersifat <strong class="text-gray-600">indikatif</strong> dan dihasilkan oleh AI berdasarkan framework Nasab &amp; Hasab.
          Bukan pengganti asesmen psikolog, dokter anak, atau konselor pendidikan.
          Orang tua tetap penentu terbaik dalam mengenali potensi anaknya.
        </p>
      </div>
    </section>

    <!-- 4 Rumpun Hasab -->
    <section class="border-t border-gray-100 bg-gray-25 px-6 py-16">
      <div class="mx-auto max-w-5xl">
        <div class="mb-10 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-brand-600">Framework Hasab</p>
          <h2 class="mt-2 text-2xl font-bold text-gray-950">4 Rumpun Potensi</h2>
          <p class="mt-2 text-sm text-gray-500">Setiap anak memiliki kombinasi unik dari keempat rumpun ini.</p>
        </div>
        <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="category in categories"
            :key="category.code"
            class="card p-6 transition-shadow hover:shadow-md"
          >
            <div class="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-xl">
              {{ category.icon }}
            </div>
            <h3 class="mb-1 text-sm font-semibold text-gray-900">{{ category.name }}</h3>
            <p class="text-xs leading-relaxed text-gray-500">{{ category.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contoh Hasil -->
    <section class="px-6 py-16">
      <div class="mx-auto max-w-3xl">
        <div class="mb-10 text-center">
          <p class="text-xs font-semibold uppercase tracking-widest text-brand-600">Preview Output</p>
          <h2 class="mt-2 text-2xl font-bold text-gray-950">Contoh Hasil Analisis</h2>
          <p class="mt-2 text-sm text-gray-500">
            Hasil mencakup radar chart, persona potensi, narasi skor, catatan pengasuhan, dan rencana micro-dosing mingguan.
          </p>
        </div>
        <div class="card overflow-hidden">
          <div class="border-b border-brand-200 bg-brand-50 px-6 py-5">
            <div class="mb-1 flex items-center gap-2">
              <span class="rounded-full bg-brand-400 px-2.5 py-0.5 text-xs font-semibold text-black">Sample</span>
              <span class="text-xs text-gray-500">AI Generated</span>
            </div>
            <h3 class="text-xl font-bold text-gray-950">The Innovator Leader</h3>
            <p class="mt-1 text-sm text-gray-600">Amali dominan · Ilmi kuat · Asyiha berkembang</p>
          </div>
          <div class="p-6">
            <p class="text-sm leading-relaxed text-gray-700">
              Anak dengan kombinasi <strong>Amali + Ilmi + Asyiha</strong> cenderung memiliki kekuatan eksekusi teknis,
              daya kritis, dan pengaruh sosial. Cocok dikembangkan ke arah technopreneur, product leader, atau robotics/AI.
            </p>
            <div class="mt-5">
              <p class="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Micro-Dosing Mingguan</p>
              <div class="space-y-2">
                <div v-for="item in sampleSchedule" :key="item.day" class="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-25 px-4 py-3">
                  <span class="mt-0.5 shrink-0 rounded-lg bg-brand-400 px-2 py-0.5 text-xs font-semibold text-black">{{ item.day }}</span>
                  <div>
                    <p class="text-sm font-medium text-gray-800">{{ item.activity }}</p>
                    <p class="text-xs text-gray-400">{{ item.duration }}</p>
                  </div>
                </div>
              </div>
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
        <p class="mt-3 text-sm text-gray-500">Gratis · ~5-10 menit · Hasil PDF + WhatsApp</p>
        <NuxtLink to="/survey" class="btn-primary-lg mt-8 inline-flex">
          Mulai Sekarang
        </NuxtLink>
      </div>
    </section>

    <!-- Footer -->
    <footer class="border-t border-gray-100 px-6 py-6 text-center">
      <p class="text-xs text-gray-400">PetaBakat · Berbasis framework Nasab &amp; Hasab dalam perspektif Islam</p>
      <p class="mt-1 text-xs text-gray-400">
        Framework Nasab &amp; Hasab terinspirasi dari pemikiran <strong class="text-gray-500">Kyai Budi Ashari</strong>
        · dikembangkan dalam
        <a
          href="https://medium.com/@yasir.maulana/melihat-potensi-anak-dari-nasab-dan-hasab-7d02943afebe"
          target="_blank"
          rel="noopener noreferrer"
          class="font-medium text-brand-600 hover:text-brand-700 underline underline-offset-2"
        >
          tulisan ini
        </a>
      </p>
      <p class="mt-3 text-xs text-gray-400">
        Powered by
        <a href="https://www.otomatisin.web.id/" target="_blank" rel="noopener noreferrer" class="font-medium text-gray-500 hover:text-gray-700">Otomatisin</a>
        &nbsp;·&nbsp; Design system by
        <a href="https://kareemstudios.com/" target="_blank" rel="noopener noreferrer" class="font-medium text-gray-500 hover:text-gray-700">Kareem Studios</a>
      </p>
    </footer>
  </main>
</template>

<script setup>
const categories = [
  { code: 'asyiha', name: 'Hasab Al-Asyiha', description: 'Kepemimpinan, komunikasi, empati sosial, dan pengaruh positif', icon: '🤝' },
  { code: 'ilmi',   name: 'Hasab Al-Ilmi',   description: 'Kecerdasan intelektual, analitis, ingin tahu, dan pencinta ilmu', icon: '📚' },
  { code: 'amali',  name: 'Hasab Al-Amali',  description: 'Teknis, praktis, bisnis, eksekusi, dan keterampilan tangan', icon: '🛠️' },
  { code: 'wajdan', name: 'Hasab Al-Wajdan', description: 'Estetika, rasa, intuisi, spiritual, dan ekspresi diri', icon: '🎨' },
]

const sampleSchedule = [
  { day: 'Sabtu Pagi',    activity: 'Eksperimen STEM sederhana',               duration: '60 menit' },
  { day: 'Minggu Sore',   activity: 'Bercerita & mempresentasikan ide',         duration: '45 menit' },
  { day: 'Hari Sekolah',  activity: 'Tantangan menyelesaikan masalah kecil',    duration: '30 menit' },
]
</script>
