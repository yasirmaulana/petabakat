<template>
  <div class="min-h-screen bg-stone-50">
    <!-- Header -->
    <header class="border-b border-gray-100 bg-white px-6 py-4">
      <div class="mx-auto flex max-w-3xl items-center gap-3">
        <NuxtLink to="/" class="text-sm text-gray-400 hover:text-gray-600">← Beranda</NuxtLink>
        <span class="text-gray-200">|</span>
        <span class="text-sm font-medium text-gray-700">Dasar Ilmiah</span>
      </div>
    </header>

    <main class="mx-auto max-w-3xl px-6 py-12">
      <!-- Judul -->
      <div class="mb-12 text-center">
        <p class="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">Transparansi Metodologi</p>
        <h1 class="text-3xl font-bold text-gray-950">Dasar Ilmiah Pendekatan Nasab & Hasab</h1>
        <p class="mt-4 text-base leading-relaxed text-gray-500">
          Halaman ini menjelaskan dari mana konsep Nasab & Hasab berasal, kaitan tiap rumpun dengan riset psikologi perkembangan,
          dan batasan yang perlu dipahami sebelum menafsirkan hasil survei.
        </p>
      </div>

      <!-- Sumber Konsep -->
      <section class="mb-10">
        <h2 class="mb-4 text-lg font-bold text-gray-900">1. Asal Konsep Nasab & Hasab</h2>
        <div class="card p-6 prose prose-sm max-w-none text-gray-700 leading-relaxed">
          <p>
            <strong>Nasab</strong> (نَسَب) dan <strong>Hasab</strong> (حَسَب) adalah dua konsep sentral dalam tradisi Islam
            yang mengatur identitas, posisi sosial, dan warisan karakter seseorang dalam keluarga.
          </p>
          <ul class="mt-3 space-y-2">
            <li>
              <strong>Nasab</strong> — garis keturunan sah yang menjaga identitas, hak waris, dan larangan mahram.
              Disebutkan dalam Al-Qur'an surat Al-Furqan:54:
              <em>"Dan Dia (Allah) yang menciptakan manusia dari air, lalu menjadikannya mempunyai keturunan (nasab) dan mushaharah."</em>
            </li>
            <li>
              <strong>Hasab</strong> — rekam jejak kemuliaan, akhlak, dan pencapaian keluarga secara turun-temurun.
              Dalam hadis Nabi ﷺ (HR. Tirmidzi, no. 3090):
              <em>"Seorang laki-laki dari kalangan orang Arab benar-benar berkedudukan (berhasab) karena lisannya."</em>
              Imam Ibn Manzhur dalam <em>Lisanul Arab</em> mendefinisikan hasab sebagai
              "apa yang dihitung dari perbuatan-perbuatan bapak dan nenek moyang berupa kemuliaan."
            </li>
          </ul>
          <p class="mt-3">
            Penerapan framework Nasab & Hasab dalam konteks pemetaan potensi anak dikembangkan oleh
            <strong>Ustadz Budi Ashari, Lc.</strong> (pendiri Parenting Nabawiyah), yang memformulasikan
            bahwa warisan karakter keluarga (hasab) adalah salah satu "modal awal" yang dapat diidentifikasi
            dan dikembangkan — bukan determinisme, melainkan titik berangkat pengasuhan yang sadar.
          </p>
        </div>
      </section>

      <!-- Kaitan ke Riset Psikologi -->
      <section class="mb-10">
        <h2 class="mb-4 text-lg font-bold text-gray-900">2. Kaitan Tiap Rumpun Hasab dengan Riset Psikologi</h2>
        <p class="mb-6 text-sm text-gray-500">
          Masing-masing rumpun Hasab memiliki padanan konstruk ilmiah yang telah diteliti dalam psikologi perkembangan
          dan psikologi keluarga. Tabel berikut memetakan kaitannya.
        </p>

        <div v-for="(rumpun, i) in rumpunData" :key="i" class="card mb-5 overflow-hidden">
          <!-- Header rumpun -->
          <div class="flex items-center gap-3 border-b border-gray-100 px-5 py-4" :class="rumpun.bg">
            <span class="text-2xl">{{ rumpun.icon }}</span>
            <div>
              <p class="font-bold text-gray-900">{{ rumpun.name }}</p>
              <p class="text-xs text-gray-500">{{ rumpun.tagline }}</p>
            </div>
          </div>

          <div class="px-5 py-4 space-y-4">
            <!-- Konstruk ilmiah -->
            <div>
              <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Konstruk Ilmiah</p>
              <p class="text-sm text-gray-700 leading-relaxed">{{ rumpun.construct }}</p>
            </div>

            <!-- Mekanisme transmisi -->
            <div>
              <p class="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-400">Mekanisme Transmisi Antar Generasi</p>
              <p class="text-sm text-gray-700 leading-relaxed">{{ rumpun.mechanism }}</p>
            </div>

            <!-- Referensi -->
            <div>
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Referensi Ilmiah</p>
              <ul class="space-y-2">
                <li
                  v-for="(ref, j) in rumpun.refs"
                  :key="j"
                  class="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-600 leading-relaxed"
                >
                  <span class="font-medium text-gray-800">{{ ref.authors }} ({{ ref.year }})</span>
                  — {{ ref.title }}.
                  <em>{{ ref.journal }}</em><span v-if="ref.detail">, {{ ref.detail }}</span>.
                  <span v-if="ref.note" class="block mt-1 text-gray-400 italic">{{ ref.note }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <!-- Referensi Payung Transmisi Lintas Generasi -->
      <section class="mb-10">
        <h2 class="mb-4 text-lg font-bold text-gray-900">3. Riset Umum: Pengaruh Keluarga terhadap Potensi Anak</h2>
        <div class="card p-5 space-y-3">
          <p class="text-sm text-gray-500 leading-relaxed">
            Framework Hasab secara keseluruhan berpijak pada premis bahwa karakter dan potensi keluarga besar
            mempengaruhi anak melalui kombinasi hereditas genetik, lingkungan belajar di rumah, dan pemodelan perilaku orang tua.
            Riset berikut mendukung premis tersebut:
          </p>
          <ul class="space-y-2">
            <li
              v-for="(ref, i) in generalRefs"
              :key="i"
              class="rounded-lg bg-gray-50 px-4 py-3 text-xs text-gray-600 leading-relaxed"
            >
              <span class="font-medium text-gray-800">{{ ref.authors }} ({{ ref.year }})</span>
              — {{ ref.title }}.
              <em>{{ ref.journal }}</em><span v-if="ref.detail">, {{ ref.detail }}</span>.
              <span v-if="ref.note" class="block mt-1 text-gray-400 italic">{{ ref.note }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Yang Kami Anggap Kurang Andal -->
      <section class="mb-10">
        <h2 class="mb-4 text-lg font-bold text-gray-900">4. Yang Tidak Kami Gunakan</h2>
        <div class="card p-5">
          <p class="mb-3 text-sm text-gray-500">
            Kami secara eksplisit menghindari pendekatan berikut karena bukti ilmiahnya lemah atau tidak ada:
          </p>
          <ul class="space-y-2">
            <li v-for="(item, i) in weakApproaches" :key="i" class="flex gap-3 text-sm text-gray-700">
              <span class="mt-0.5 text-red-400 flex-shrink-0">✗</span>
              <span><strong>{{ item.label }}</strong> — {{ item.reason }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- Batasan -->
      <section class="mb-10">
        <h2 class="mb-4 text-lg font-bold text-gray-900">5. Batasan yang Harus Dipahami</h2>
        <div class="rounded-2xl border border-amber-200 bg-amber-50 p-5 space-y-2">
          <ul class="space-y-2 text-sm text-amber-900 leading-relaxed">
            <li v-for="(note, i) in limitations" :key="i" class="flex gap-2">
              <span class="flex-shrink-0">⚠️</span>
              <span>{{ note }}</span>
            </li>
          </ul>
        </div>
      </section>

      <!-- CTA -->
      <div class="text-center">
        <NuxtLink
          to="/survey"
          class="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition"
        >
          Mulai Survey Potensi Anak →
        </NuxtLink>
        <p class="mt-3 text-xs text-gray-400">Gratis · Tanpa buat akun · Hasil tersimpan via nomor WA</p>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
useHead({
  title: 'Dasar Ilmiah — PetaBakat',
  meta: [
    {
      name: 'description',
      content: 'Penjelasan konstruk ilmiah di balik framework Nasab & Hasab, kaitan tiap rumpun dengan riset psikologi, dan batasan metodologi PetaBakat.',
    },
  ],
})

const rumpunData = [
  {
    name: 'Hasab Al-Asyiha — Kepemimpinan & Sosial',
    tagline: 'Pola kepemimpinan, komunikasi, dan pengaruh keluarga besar',
    icon: '🤝',
    bg: 'bg-blue-50',
    construct: 'Kompetensi sosial-emosional, social learning (pemodelan perilaku orang tua), kepemimpinan awal (emergent leadership), dan teori ikatan (attachment). Keluarga yang menunjukkan pola kepemimpinan aktif, musyawarah, dan komunikasi terbuka menciptakan lingkungan di mana anak belajar meniru perilaku tersebut sejak dini.',
    mechanism: 'Melalui observational learning (Bandura, 1977): anak mengamati dan menginternalisasi cara orang tua dan keluarga besar memimpin, berkomunikasi, dan menyelesaikan konflik. Attachment aman (secure attachment) juga berkorelasi positif dengan kemampuan sosial anak di lingkungan luar keluarga.',
    refs: [
      { authors: 'Bandura, A.', year: 1977, title: 'Social Learning Theory', journal: 'Prentice-Hall', detail: null, note: 'Dasar teoretis transmisi perilaku sosial dari orang tua ke anak via observasi dan imitasi.' },
      { authors: 'Eisenberg, N., Fabes, R. A., & Spinrad, T. L.', year: 2006, title: 'Prosocial Development', journal: 'Handbook of Child Psychology', detail: 'Vol. 3, 6th ed., pp. 646–718. Wiley', note: 'Perilaku prososial, empati, dan kepemimpinan sosial berkembang melalui lingkungan keluarga yang responsif.' },
      { authors: 'Ainsworth, M. D. S., et al.', year: 1978, title: 'Patterns of Attachment: A Psychological Study of the Strange Situation', journal: 'Erlbaum', detail: null, note: 'Secure attachment dengan pengasuh utama adalah fondasi kompetensi sosial dan kepercayaan diri anak.' },
    ],
  },
  {
    name: 'Hasab Al-Ilmi — Intelektual & Keilmuan',
    tagline: 'Tradisi belajar, membaca, dan inkuiri dalam keluarga besar',
    icon: '📚',
    bg: 'bg-green-50',
    construct: 'Home learning environment (HLE), parental academic involvement, dan transmisi orientasi intelektual. Keluarga yang memiliki tradisi membaca, mendiskusikan ilmu, dan menghargai pertanyaan anak menciptakan lingkungan belajar (cognitive home environment) yang secara signifikan memprediksi kemampuan kognitif dan prestasi akademik anak.',
    mechanism: 'Melalui dua jalur: (1) genetik — heritabilitas kemampuan kognitif berkisar 50–80% pada usia dewasa (Plomin & Deary, 2015); dan (2) lingkungan — kualitas stimulasi kognitif di rumah, frekuensi membaca bersama, dan ekspektasi akademik orang tua. Keduanya bekerja bersamaan dan saling memperkuat.',
    refs: [
      { authors: 'Melhuish, E. C., et al.', year: 2008, title: 'Effects of the home learning environment and preschool center experience upon literacy and numeracy development in early primary school', journal: 'Journal of Social Issues', detail: '64(1), 95–114', note: 'HLE memprediksi literasi dan numerasi anak secara independen dari status sosio-ekonomi.' },
      { authors: 'Plomin, R., & Deary, I. J.', year: 2015, title: 'Genetics and intelligence differences: five special findings', journal: 'Molecular Psychiatry', detail: '20(1), 98–108', note: 'Heritabilitas kecerdasan meningkat dari ~40% pada masa kanak-kanak ke ~60–80% pada usia dewasa.' },
      { authors: 'Sénéchal, M., & LeFevre, J. A.', year: 2002, title: 'Parental involvement in the development of children\'s reading skill: a five-year longitudinal study', journal: 'Child Development', detail: '73(2), 445–460', note: 'Keterlibatan orang tua dalam membaca berpengaruh signifikan pada kemampuan literasi anak usia sekolah dasar.' },
    ],
  },
  {
    name: 'Hasab Al-Amali — Bisnis & Teknis',
    tagline: 'Etos kerja, keterampilan tangan, dan jiwa wirausaha keluarga',
    icon: '🛠️',
    bg: 'bg-orange-50',
    construct: 'Achievement motivation (McClelland), entrepreneurial trait transmission, dan keterampilan vokasional yang diwariskan. Keluarga dengan tradisi wirausaha, etos kerja keras, dan orientasi solusi praktis menciptakan pola pikir eksekusi dan kemandirian yang terinternalisasi anak sejak dini.',
    mechanism: 'Melalui pemodelan langsung (observing parent working), socialization of work values (nilai kerja yang diajarkan secara eksplisit), dan opportunity exposure (anak yang tumbuh di lingkungan usaha keluarga lebih terpapar pada pola pikir kewirausahaan). Self-efficacy terkait kerja juga terbentuk dari reinforcement dalam keluarga.',
    refs: [
      { authors: 'McClelland, D. C.', year: 1961, title: 'The Achieving Society', journal: 'Van Nostrand', detail: null, note: 'Achievement motivation sebagai konstruk yang terbentuk dalam lingkungan sosial dan keluarga, bukan hanya bawaan.' },
      { authors: 'Schmitt-Rodermund, E.', year: 2004, title: 'Pathways to successful entrepreneurship: Parenting, personality, early entrepreneurial competence, and interests', journal: 'Journal of Vocational Behavior', detail: '65(3), 498–518', note: 'Orang tua wirausahawan mengembangkan entrepreneurial competence anak secara signifikan melalui parenting style dan role modeling.' },
      { authors: 'Bandura, A.', year: 1997, title: 'Self-Efficacy: The Exercise of Control', journal: 'Freeman', detail: null, note: 'Self-efficacy dalam bidang teknis/kerja terbentuk dari mastery experiences dan vicarious learning — keduanya dimediasi oleh keluarga.' },
    ],
  },
  {
    name: 'Hasab Al-Wajdan — Seni & Spiritual',
    tagline: 'Kepekaan estetika, empati mendalam, dan ibadah istikamah keluarga',
    icon: '🎨',
    bg: 'bg-purple-50',
    construct: 'Kecerdasan emosional (Goleman/Mayer-Salovey), regulasi emosi, religiusitas dan kesejahteraan (religiosity & well-being), serta sensitivitas estetika. Keluarga yang menjaga ibadah istikamah, peka pada perasaan orang lain, dan menghargai seni menciptakan fondasi emosional dan spiritual yang dalam pada anak.',
    mechanism: 'Religiusitas orang tua adalah prediktor paling konsisten untuk religiusitas anak (transmisi vertikal). Kepekaan emosional dan empati ditransmisikan melalui iklim emosional keluarga — bagaimana emosi diekspresikan, diterima, dan diregulasi dalam rumah tangga. Sensitivitas estetika terkait dengan openness to experience, yang memiliki heritabilitas ~50% dan diperkuat oleh stimulus lingkungan.',
    refs: [
      { authors: 'Voas, D., & Crockett, A.', year: 2005, title: 'Religion in Britain: Neither Believing nor Belonging', journal: 'Sociology', detail: '39(1), 11–28', note: 'Religiusitas orang tua adalah faktor terkuat penentu religiusitas anak di atas pengaruh institusi lainnya.' },
      { authors: 'Gross, J. J., & Thompson, R. A.', year: 2007, title: 'Emotion Regulation: Conceptual Foundations', journal: 'Handbook of Emotion Regulation', detail: 'pp. 3–24. Guilford Press', note: 'Strategi regulasi emosi anak terbentuk sebagian besar dari observasi terhadap cara orang tua meregulasi emosi mereka.' },
      { authors: 'Jang, K. L., et al.', year: 1996, title: 'Heritability of the Big Five personality dimensions and their facets', journal: 'Journal of Personality', detail: '64(3), 577–591', note: 'Openness to Experience (terkait sensitivitas estetika) memiliki heritabilitas ~57%; dapat dikembangkan melalui lingkungan yang kaya stimulus.' },
    ],
  },
]

const generalRefs = [
  { authors: 'Bronfenbrenner, U.', year: 1979, title: 'The Ecology of Human Development', journal: 'Harvard University Press', detail: null, note: 'Keluarga adalah microsystem paling berpengaruh dalam perkembangan anak — semua dimensi potensi berkembang pertama kali di sini.' },
  { authors: 'Plomin, R., et al.', year: 2016, title: 'Top 10 replicated findings from behavioral genetics', journal: 'Perspectives on Psychological Science', detail: '11(1), 3–23', note: 'Hampir semua trait psikologis memiliki komponen hereditas yang signifikan; namun lingkungan keluarga tetap berperan besar sebagai moderator.' },
  { authors: 'Feinstein, L.', year: 2003, title: 'Inequality in the Early Cognitive Development of British Children in the 1970 Cohort', journal: 'Economica', detail: '70(277), 73–97', note: 'Lingkungan rumah awal memprediksi perkembangan kognitif lebih kuat daripada faktor sekolah pada usia dini.' },
  { authors: 'Heckman, J. J.', year: 2006, title: 'Skill Formation and the Economics of Investing in Disadvantaged Children', journal: 'Science', detail: '312(5782), 1900–1902', note: 'Investasi terbaik untuk perkembangan anak adalah pada usia 0–5 tahun di lingkungan keluarga; efek snowball terhadap kapabilitas seumur hidup.' },
]

const weakApproaches = [
  { label: 'Zodiak dan tanggal lahir', reason: 'Tidak berkorelasi dengan bakat atau kepribadian (Carlson, 1985; Hartmann et al., 2006). Artefak tanggal lahir yang tampak (relative age effect) adalah soal kematangan, bukan bakat bawaan.' },
  { label: 'Learning styles (gaya belajar)', reason: 'Tidak ada bukti bahwa mencocokkan instruksi dengan "gaya belajar" meningkatkan hasil (Pashler et al., 2008, Psychological Science in the Public Interest).' },
  { label: 'Teori Multiple Intelligences Gardner sebagai alat ukur', reason: 'Kurang dukungan psikometrik yang memadai sebagai instrumen asesmen formal (Waterhouse, 2006; Visser et al., 2006). Kami pakai sebagai inspirasi konseptual, bukan klaim ilmiah.' },
]

const limitations = [
  'Hasil survei ini adalah gambaran kecenderungan berdasarkan isian Anda — bukan diagnosis medis atau psikologis.',
  'Akurasi bergantung pada seberapa jujur dan cermat Anda mengobservasi karakter keluarga besar.',
  'Skor Hasab membandingkan rumpun satu sama lain dalam keluarga yang sama — bukan perbandingan antar keluarga.',
  'Karakter anak bersifat dinamis. Isi ulang jika pola keluarga atau minat anak berubah signifikan.',
  'Untuk kebutuhan diagnosis khusus (keterlambatan perkembangan, ADHD, dll.), selalu libatkan psikolog atau dokter anak.',
  'Referensi ilmiah di halaman ini mendukung konstruk teoretis tiap rumpun — bukan "sertifikasi" terhadap kuesioner 22 soal ini.',
]
</script>
