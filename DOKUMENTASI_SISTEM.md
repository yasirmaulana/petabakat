# Dokumentasi Sistem PetaMinatBakat
## Aplikasi Penilaian Potensi Anak Berbasis Framework Nasab–Hasab dengan Analisis Fit-Gap Ekosistem Keluarga

---

> **Kategori Dokumen:** Dokumentasi Teknis dan Konseptual  
> **Stack Teknologi:** Nuxt 3 · Prisma 7 · PostgreSQL · OpenAI-compatible API  
> **Versi Dokumen:** 1.0 · September 2026

---

## DAFTAR ISI

1. [Pendahuluan](#1-pendahuluan)
2. [Landasan Teori](#2-landasan-teori)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Desain Basis Data](#4-desain-basis-data)
5. [Modul Survei Anak](#5-modul-survei-anak)
6. [Modul Penilaian Hasab Keluarga](#6-modul-penilaian-hasab-keluarga)
7. [Algoritma Fit-Gap](#7-algoritma-fit-gap)
8. [Analisis Kecerdasan Buatan](#8-analisis-kecerdasan-buatan)
9. [Penyajian Laporan Hasil](#9-penyajian-laporan-hasil)
10. [Modul Multi-Stakeholder](#10-modul-multi-stakeholder)
11. [Keamanan dan Autentikasi](#11-keamanan-dan-autentikasi)
12. [Alur Sistem End-to-End](#12-alur-sistem-end-to-end)
13. [Kesimpulan](#13-kesimpulan)

---

## 1. Pendahuluan

### 1.1 Latar Belakang

Setiap anak lahir dengan kecenderungan potensi bawaan yang unik. Namun dalam banyak praktik pendidikan, potensi ini seringkali tidak teridentifikasi secara sistematis — orang tua dan pendidik mengandalkan observasi subjektif atau tes minat berbasis Barat yang tidak mempertimbangkan konteks nilai Islam dan ekosistem keluarga.

PetaMinatBakat hadir sebagai solusi digital untuk menjawab dua pertanyaan mendasar:

1. **Apa potensi bawaan anak?** — diidentifikasi melalui pola respons alami dan survei perilaku berbasis framework Hasab.
2. **Seberapa siap ekosistem keluarga mendukung potensi tersebut?** — diukur melalui penilaian kolektif 6 figur keluarga dan dianalisis dengan algoritma Fit-Gap.

### 1.2 Tujuan Sistem

- Mengidentifikasi rumpun Hasab dominan anak (Al-Qiyadah, Ilmi, Amali, Wajdan) berdasarkan data perilaku dan respons alami.
- Mengukur kekuatan Hasab Keluarga dari 6 figur (ayah, ibu, kakek/nenek dari kedua pihak) dalam 5 dimensi.
- Menghitung Fit-Gap Ratio sebagai indikator keselarasan antara potensi anak dan ekosistem keluarga.
- Menghasilkan rekomendasi berbasis AI yang personal, kontekstual, dan berbasis nilai Islam.
- Menyediakan laporan aksi konkret bagi orang tua, sekolah, dan mitra lembaga pendidikan.

### 1.3 Ruang Lingkup

Sistem ini melayani empat kelompok pengguna:

| Pengguna | Hak Akses | Modul Utama |
|---|---|---|
| Orang Tua | Isi survei, lihat laporan milik sendiri | Survei anak, Family Assessment, Laporan |
| Sekolah | Lihat laporan siswa (dengan consent) | Portal Sekolah, Manajemen Kelas |
| Mitra/Afiliasi | Lihat laporan klien, kelola voucher | Portal Mitra, Dashboard Komisi |
| Owner/Admin | Akses penuh | Admin Panel, Re-enrichment AI |

---

## 2. Landasan Teori

### 2.1 Framework Nasab dan Hasab dalam Islam

Sistem ini dibangun di atas kerangka epistemologi Islam yang membedakan dua dimensi asal-usul manusia:

#### Nasab
**Nasab** merujuk pada garis keturunan sah yang berfungsi menjaga identitas, hak waris, dan tali silaturahim. Dalam konteks sistem ini, pertanyaan nasab mengidentifikasi apakah silsilah keluarga terdokumentasi — yang secara tidak langsung memengaruhi kejelasan identitas budaya dan nilai yang diwariskan.

#### Hasab
**Hasab** adalah rekam jejak kemuliaan yang dibangun dan diwariskan lintas generasi melalui perilaku, kebiasaan, dan budaya keluarga. Berbeda dari nasab yang bersifat biologis, hasab bersifat **fungsional dan dapat diperkuat** melalui pengasuhan yang tepat.

Imam Al-Ghazali dalam *Ihya' Ulumuddin* menyebut bahwa akhlak dan kecenderungan seseorang tidak lahir dalam kevakuman — melainkan terbentuk dari interaksi antara fitrah bawaan dan lingkungan keluarga sebagai madrasah pertama.

### 2.2 Empat Rumpun Hasab Anak

Sistem mengklasifikasikan potensi anak ke dalam empat rumpun yang saling melengkapi:

| Kode | Nama Rumpun | Karakteristik Utama |
|---|---|---|
| `asyiha` | **Al-Qiyadah** | Kepemimpinan, komunikasi, empati sosial, pengaruh positif, visi ke depan |
| `ilmi` | **Ilmi** | Intelektual, analitis, ingin tahu, pencinta ilmu, kemampuan abstrak |
| `amali` | **Amali** | Teknis, praktis, bisnis, eksekusi, keterampilan tangan, berorientasi hasil |
| `wajdan` | **Wajdan** | Estetika, rasa, intuisi, spiritual, ekspresi diri, kepekaan emosional |

Setiap anak memiliki skor pada keempat rumpun secara bersamaan. Skor tertinggi menentukan **rumpun dominan**, namun sistem mempertimbangkan kombinasi dua rumpun teratas sebagai basis rekomendasi yang lebih kaya.

### 2.3 Lima Dimensi Hasab Keluarga

Penilaian keluarga menggunakan lima dimensi, di mana empat di antaranya memiliki padanan langsung dengan rumpun anak:

| Dimensi Keluarga | Kode | Padanan Rumpun Anak | Deskripsi |
|---|---|---|---|
| Hasab Ilmi | `ilmi` | Ilmi | Tradisi keilmuan, kedalaman literasi, analitika |
| Hasab Qiyadah | `qiyadah` | Al-Qiyadah (asyiha) | Kepemimpinan, pengambilan keputusan, ketahanan mental |
| Hasab Amali | `amali` | Amali | Etos kerja, eksekusi, keterampilan praktis |
| Hasab Wajdan | `wajdan` | Wajdan | Nilai moral, empati, spiritualitas |
| **Tarbiyah** | `tarbiyah` | *(tidak ada padanan)* | Pola asuh, atmosfer pengasuhan — **dimensi tersendiri** |

**Catatan penting:** Tarbiyah bukan potensi bawaan, melainkan ukuran kualitas *tanah* tempat potensi anak tumbuh. Dimensi ini mengukur seberapa kondusif cara keluarga mendidik — menghargai usaha, memberi ruang eksplorasi, konsistensi aturan, dan kehangatan komunikasi.

### 2.4 Konsep Fit-Gap

Fit-Gap adalah indikator keselarasan antara rumpun dominan anak dengan kekuatan kolektif ekosistem keluarga. Konsep ini menjawab pertanyaan: *"Apakah rekam jejak keluarga sudah mendukung kecenderungan alami anak?"*

- **Status OPTIMAL** — Minimal 1 dari 2 rumpun teratas anak memiliki padanan dalam Top-3 Hasab Keluarga.
- **Status GAP** — Kurang dari separuh rumpun teratas anak yang terdukung ekosistem keluarga; diperlukan intervensi eksternal.

---

## 3. Arsitektur Sistem

### 3.1 Stack Teknologi

```
┌────────────────────────────────────────────────────────────┐
│                      FRONTEND (Nuxt 3)                      │
│  Vue 3 + <script setup> · Tailwind CSS · ApexCharts         │
│  SSR/CSR hybrid · Client-only untuk chart interaktif        │
├────────────────────────────────────────────────────────────┤
│                    SERVER (Nitro/H3)                         │
│  REST API Endpoints · Prisma ORM · JWT Auth                  │
│  Rate Limiting · Transaction serializable (Prisma)          │
├────────────────────────────────────────────────────────────┤
│                    DATABASE (PostgreSQL)                     │
│  Skema: 20+ model · Relasi cascade · Index strategis        │
├────────────────────────────────────────────────────────────┤
│                AI Provider (Sumopod/OpenAI-compat)          │
│  Model: claude-sonnet-5 · JSON structured output            │
│  Endpoint: https://ai.sumopod.com/v1                        │
└────────────────────────────────────────────────────────────┘
```

### 3.2 Struktur Direktori

```
petabakat/
├── pages/
│   ├── index.vue                    # Landing page (marketing)
│   ├── survey.vue                   # Alur survei anak (11 langkah)
│   ├── family-survey/[surveyId].vue # Penilaian hasab keluarga
│   ├── results/[id].vue             # Laporan hasil lengkap
│   ├── history.vue                  # Riwayat survei (autentikasi OTP)
│   ├── dasar-ilmiah.vue             # Penjelasan framework
│   ├── mitra/                       # Portal mitra/afiliasi
│   ├── owner/                       # Portal admin/owner
│   └── sekolah/                     # Portal sekolah
├── server/
│   ├── api/                         # REST endpoints
│   │   ├── surveys.post.ts          # Submit survei anak
│   │   ├── results/[id].get.ts      # Ambil hasil laporan
│   │   ├── family-assessment/       # Endpoint keluarga
│   │   ├── reports/                 # Generate & kirim PDF/WA
│   │   ├── admin/                   # Panel admin
│   │   ├── otp/                     # Autentikasi OTP
│   │   ├── mitra/                   # API portal mitra
│   │   └── sekolah/                 # API portal sekolah
│   └── utils/
│       ├── hasabCalculator.ts       # Kalkulasi skor anak
│       ├── hasabFamilyCalculator.ts # Kalkulasi skor keluarga + Fit-Gap
│       ├── aiAnalyzer.ts            # Integrasi AI + prompt engineering
│       ├── auth.ts                  # JWT utilities (history/mitra)
│       ├── schoolAuth.ts            # JWT khusus sekolah
│       ├── prisma.ts                # Prisma client singleton
│       └── rateLimiter.ts           # In-memory rate limiting
├── prisma/
│   ├── schema.prisma                # Skema database lengkap
│   ├── seed.ts                      # Seed data pertanyaan anak
│   └── seed-family.ts               # Seed data pertanyaan keluarga
└── nuxt.config.ts                   # Konfigurasi + runtimeConfig
```

### 3.3 Konfigurasi Runtime

Sistem membagi konfigurasi ke dua level:

```typescript
// nuxt.config.ts
runtimeConfig: {
  // Server-only (tidak terekspos ke frontend)
  databaseUrl, anthropicApiKey, anthropicBaseUrl,
  sumopodApiKey, sumopodModel,
  whatsappApiUrl, whatsappFonnteToken,

  // Public (aman untuk frontend)
  public: {
    siteUrl: process.env.NUXT_PUBLIC_SITE_URL,
    demoResultId: process.env.DEMO_RESULT_ID,  // Hasil demo publik
  }
}
```

---

## 4. Desain Basis Data

### 4.1 Diagram Relasi Entitas (ERD Ringkas)

```
Parent ─┬─< Survey >─── SurveyResult
        │      │
Child ──┘      ├──< SurveyAnswer >── Question >── HasabCategory
               ├──< ChildNaturalResponse
               ├──── FamilyAssessment >─── FamilyFigure >─< FamilyAnswer >── FamilyQuestion
               │           └─── FamilyResult
               ├──── PdfReport
               ├──── NotificationLog
               └──── Voucher (opsional)

Partner ──< Voucher
        └──< Commission

School ──< SchoolClass ──< SurveyStudent >── Survey
       └──< SchoolUser
```

### 4.2 Model Inti

#### `Survey` — Sesi Penilaian
Entitas pusat yang menghubungkan semua modul. Setiap survei unik melalui `publicId` (UUID) yang digunakan sebagai URL publik.

```
Field kritis:
- publicId   : UUID sebagai identifier URL-safe
- status     : 'in_progress' | 'processing' | 'completed'
- voucherId  : referensi voucher akses (nullable)
- schoolId   : referensi sekolah jika via jalur sekolah
- completedAt: timestamp selesai pengisian
```

#### `SurveyResult` — Hasil Analisis Anak
Menyimpan skor mentah, persentase, narasi AI, dan seluruh output analisis.

```
Skor rumpun  : scoreAsyiha, scoreIlmi, scoreAmali, scoreWajdan (0–25)
Persentase   : pctAsyiha, pctIlmi, pctAmali, pctWajdan (Decimal)
AI output    : personaLabel, personaDescription, scoreNarrative,
               fitGapNarrative, parentNotes (Text)
JSON fields  : microdosingPlan, bridgingActions, lesRecommendations
               (struktur kaya dari AI, disimpan sebagai JSON)
```

#### `FamilyResult` — Hasil Penilaian Keluarga
Disimpan terpisah dari `SurveyResult`, terhubung melalui `FamilyAssessment`.

```
Skor dimensi : scoreIlmi, scoreQiyadah, scoreAmali, scoreWajdan,
               scoreTarbiyah (semua Decimal, skala 0–25)
Fit-Gap      : fitGapStatus ('OPTIMAL'|'GAP'), fitGapScore (0.00–1.00)
               top3Hasab (String[]), recommendation (Text)
               figuresIncluded (Int)
```

### 4.3 Model Pertanyaan

#### Survei Anak: 4 Kategori × 5 Soal = 20 Soal Hasab

Setiap soal bertipe Likert dengan nilai 1–5. Selain soal Hasab, terdapat soal **Nasab** (biner Ya/Tidak) yang mengukur kejelasan silsilah keturunan.

#### Penilaian Keluarga: 5 Dimensi × 6 Soal = 30 Soal

Soal dirancang untuk menilai figur keluarga secara spesifik (bukan anak), dengan kode sistematis `D{dimensi}_O{urutan}`.

Contoh soal per dimensi:

| Dimensi | Kode | Contoh Pertanyaan |
|---|---|---|
| Ilmi | D1_O1 | *"Figur ini memiliki ketertarikan tinggi pada pendidikan formal, riset, atau membaca literatur ilmiah."* |
| Qiyadah | D2_O2 | *"Figur ini berani mengambil keputusan sulit di situasi kritis tanpa ragu-ragu."* |
| Amali | D3_O1 | *"Figur ini dikenal sebagai sosok pekerja keras, disiplin, dan pantang menyerah."* |
| Wajdan | D4_O4 | *"Figur ini sangat ketat menjaga komitmen janji dan kejujuran rezeki."* |
| Tarbiyah | D5_O2 | *"Figur ini memfasilitasi dan memberi kebebasan anak untuk mencoba berbagai macam hobi/minat."* |

---

## 5. Modul Survei Anak

### 5.1 Alur Pengisian (11 Langkah)

```
Langkah 0 : Identitas orang tua + anak (nama, tanggal lahir, gender, kontak)
Langkah 1–4: Soal Hasab per rumpun (5 soal per langkah, Likert 1–5)
             Urutan rumpun: Al-Qiyadah → Ilmi → Amali → Wajdan
Langkah 5  : Soal Nasab (kejelasan silsilah, biner)
Langkah 6  : Respons Alami — checkbox minat + input teks bebas
Langkah 7  : Ringkasan dan submit
```

### 5.2 Mekanisme Penskoran Anak

Sistem menggunakan dua sumber data untuk menghitung skor:

#### Skor dari Jawaban Likert (20 soal hasab)

Masing-masing 5 soal per rumpun, nilai 1–5. Skor mentah maksimum per rumpun = **25** (5 soal × skala 5). Ini menjadi skala acuan seluruh sistem — skor anak dan keluarga dinormalisasi ke 0–25 yang sama.

#### Skor dari Respons Alami

Pilihan minat anak (checkbox) diberikan bobot berdasarkan relevansinya terhadap setiap rumpun. Respons teks bebas dianalisis oleh AI untuk konteks tambahan.

```typescript
// server/utils/hasabCalculator.ts
export function calculateNaturalResponseScores(responses: string[]) {
  // setiap pilihan minat berkontribusi ke satu atau lebih rumpun
  // hasil dijumlahkan dan dinormalisasi
}
```

### 5.3 Proses Penyimpanan dan Trigger AI

Setelah submit, sistem melakukan langkah berikut dalam satu **Prisma serializable transaction**:

```
1. Validasi & konsumsi voucher (atomic increment usedCount)
2. Upsert data Parent (berdasarkan nomor telepon unik)
3. Create data Child
4. Create Survey (status: 'processing')
5. Create SurveyAnswer untuk semua jawaban
6. Create ChildNaturalResponse untuk pilihan minat
7. Commit transaction
8. [Async, di luar transaction] Panggil AI analyzer
9. Update SurveyResult dengan output AI
10. Update Survey.status → 'completed'
11. [Opsional] Kirim notifikasi WhatsApp via Fonnte
```

Strategi ini memastikan data selalu tersimpan meski AI gagal — sistem memiliki mekanisme **re-enrichment** untuk memproses ulang survei yang stuck.

---

## 6. Modul Penilaian Hasab Keluarga

### 6.1 Desain Multi-Figur

Penilaian keluarga melibatkan hingga **6 figur**:

| Kode Figur | Label | Bobot |
|---|---|---|
| `ayah` | Ayah | **1.2** |
| `ibu` | Ibu | **1.2** |
| `kakek_ayah` | Kakek (pihak Ayah) | 1.0 |
| `nenek_ayah` | Nenek (pihak Ayah) | 1.0 |
| `kakek_ibu` | Kakek (pihak Ibu) | 1.0 |
| `nenek_ibu` | Nenek (pihak Ibu) | 1.0 |

Ayah dan ibu mendapat bobot lebih tinggi (1.2) karena interaksi harian yang lebih intens dengan anak. Figur yang tidak dikenal atau telah meninggal ditandai `isKnown: false` dan dikecualikan dari kalkulasi.

### 6.2 Algoritma Kalkulasi Skor Keluarga

```typescript
// server/utils/hasabFamilyCalculator.ts

const QUESTIONS_PER_DIM = 6    // soal per dimensi per figur
const SCORE_MAX = 5             // nilai Likert maksimum
const NORMALIZED_MAX = 25      // target skala — sama dengan skor anak

export function calculateFamilyScores(figures: FigureAnswers[]): FamilyCalcResult {
  // Tahap 1: Akumulasi tertimbang
  for (const figure of figures) {
    if (!figure.isKnown) continue
    const weight = FIGURE_WEIGHTS[figure.role] ?? 1.0

    for (const dim of DIMENSIONS) {
      const dimScore = // jumlah jawaban figur ini pada dimensi dim
      totals[dim] += dimScore * weight
      weightSums[dim] += weight
    }
  }

  // Tahap 2: Normalisasi ke skala 0–25
  // Formula: (total_tertimbang / max_mungkin_tertimbang) × 25
  // max_mungkin = QUESTIONS_PER_DIM × SCORE_MAX × total_bobot_figur
  for (const dim of DIMENSIONS) {
    const maxPossible = QUESTIONS_PER_DIM * SCORE_MAX * weightSums[dim]
    normalized[dim] = (totals[dim] / maxPossible) * NORMALIZED_MAX
  }

  // Tahap 3: Ranking Top-3 Hasab (tanpa Tarbiyah sebagai tiebreaker terakhir)
  const top3Hasab = ranked.slice(0, 3).map(([dim]) => dim)

  return { scores: normalized, top3Hasab, figuresIncluded }
}
```

**Keunggulan normalisasi ini:** Keluarga dengan hanya 2 figur yang diisi tidak otomatis mendapat skor rendah. Normalisasi berbasis `weightSums` memastikan skor adil terlepas dari berapa figur yang berpartisipasi.

### 6.3 Alur Pengisian Family Assessment

```
1. Orang tua membuka link /family-survey/[surveyId]
2. Halaman menampilkan daftar 6 figur keluarga
3. Per figur, orang tua menandai: isKnown (ya/tidak)
4. Untuk figur yang dikenal: 30 soal (5 dimensi × 6 soal) dengan Likert 1–5
5. Orang tua dapat melompat antar figur (progress tersimpan per figur)
6. Submit → calculateFamilyScores() → calculateFitGap() → simpan FamilyResult
7. AI dipanggil ulang (re-enrichment) untuk memperbarui fitGapNarrative dan bridgingActions
```

---

## 7. Algoritma Fit-Gap

### 7.1 Logika Inti

```typescript
// Peta rumpun anak → dimensi keluarga yang sebanding
const CHILD_TO_FAMILY_DIM = {
  asyiha: 'qiyadah',  // Al-Qiyadah → Hasab Qiyadah
  ilmi:   'ilmi',
  amali:  'amali',
  wajdan: 'wajdan',
}

export function calculateFitGap(
  childOrdered: string[],  // rumpun anak, diurutkan dominan ke lemah
  familyTop3: Dimension[]  // 3 dimensi keluarga terkuat (tanpa Tarbiyah)
): FitGapResult {
  // Ambil 2 rumpun teratas anak dan petakan ke dimensi keluarga
  const childTop2Dims = childOrdered
    .slice(0, 2)
    .map(c => CHILD_TO_FAMILY_DIM[c])
    .filter(Boolean)

  // Hitung berapa yang masuk Top-3 keluarga
  const matchCount = childTop2Dims.filter(d => familyTop3.includes(d)).length

  // Fit-Gap Score = proporsi keselarasan (0.00 – 1.00)
  const fitGapScore = matchCount / Math.max(childTop2Dims.length, 1)

  // OPTIMAL jika ≥ 50% rumpun dominan anak terdukung keluarga
  const fitGapStatus = fitGapScore >= 0.5 ? 'OPTIMAL' : 'GAP'
}
```

### 7.2 Interpretasi Hasil

| fitGapScore | fitGapStatus | Interpretasi |
|---|---|---|
| 1.00 | OPTIMAL | Kedua rumpun teratas anak ada dalam Top-3 Hasab Keluarga — keselarasan penuh |
| 0.50 | OPTIMAL | Satu dari dua rumpun teratas anak didukung keluarga — cukup selaras |
| 0.00 | GAP | Tidak ada rumpun teratas anak yang didukung langsung keluarga — perlu mentor eksternal |

### 7.3 Rekomendasi Otomatis

Sistem menghasilkan teks rekomendasi deterministik (tanpa AI) berdasarkan status:

- **OPTIMAL:** Keluarga didorong untuk menjadi mentor langsung, meneruskan pola yang ada.
- **GAP:** Keluarga disarankan mencari mentor luar atau komunitas yang sesuai, sambil tetap berperan di bidang kekuatan Hasab-nya sendiri.

Rekomendasi ini dilengkapi oleh narasi kontekstual dari AI (`fitGapNarrative`) yang lebih personal dan spesifik.

### 7.4 Catatan: Tarbiyah Dikecualikan dari Fit-Gap

Tarbiyah sengaja tidak diikutsertakan dalam kalkulasi Fit-Gap. Alasannya:

1. Tidak ada rumpun "Tarbiyah" pada anak — dimensi ini tidak dapat dibandingkan langsung.
2. Tarbiyah mengukur kualitas proses pengasuhan (how), bukan potensi yang diwariskan (what).
3. Skor Tarbiyah ditampilkan terpisah dalam laporan sebagai indikator "atmosfer pengasuhan" yang berdiri sendiri.

---

## 8. Analisis Kecerdasan Buatan

### 8.1 Provider dan Model

```
Provider : Sumopod AI (https://ai.sumopod.com/v1)
Interface: OpenAI-compatible API
Model    : claude-sonnet-5 (dikonfigurasi via SUMOPOD_MODEL env)
Format   : JSON structured output (response_format: json_object)
```

### 8.2 System Prompt dan Persona AI

AI dikonfigurasi sebagai **asesor potensi anak multidisiplin** dengan keahlian:
- Neuroscience
- Pendidikan Islam (Tarbiyah Islamiyah)
- Al-Qur'an dan Hadis

Prompt dirancang untuk menghasilkan analisis yang:
- Personal dan menyebut nama anak
- Hangat dan memberdayakan orang tua (bukan menghakimi)
- Berbasis nilai Islam, bukan sekadar psikologi Barat
- Praktis dengan aksi konkret yang dapat langsung dilakukan
- Sensitif terhadap **kelompok usia anak** (3–6, 7–11, 12–15 tahun)

### 8.3 Input AI

```typescript
interface AiAnalysisInput {
  scores           : { asyiha, ilmi, amali, wajdan }  // skor 0–25
  percentages      : { asyiha, ilmi, amali, wajdan }  // persentase
  orderedHasab     : string[]                          // urutan dominan
  naturalResponses : string[]                          // pilihan minat anak
  nasabAnswers     : Record<number, number>            // jawaban nasab
  childName        : string
  childAgeYears    : number
  childGender      : string
  familyFitGap?    : {                                 // opsional, diisi pasca family assessment
    fitGapStatus, fitGapScore, top3Hasab,
    figuresIncluded, recommendation, skippedFigures
  }
}
```

### 8.4 Output AI (Struktur JSON)

```typescript
interface AiAnalysisOutput {
  personaLabel       : string   // Label persona unik, contoh: "The Curious Architect"
  personaDescription : string   // Deskripsi persona personal dan kontekstual
  scoreNarrative     : string   // Narasi penjelasan skor per rumpun
  fitGapNarrative    : string   // Narasi 2–3 kalimat tentang keselarasan keluarga–anak
  parentNotes        : string   // Saran pola asuh spesifik
  microdosingPlan    : {        // Rencana stimulasi mingguan
    title    : string
    schedule : { day, activity, durationMinutes, figureInvolved? }[]
  }
  bridgingActions    : {        // Aksi per figur keluarga
    target     : 'ayah'|'ibu'|'kakek'|'nenek'|'keluarga'|'anak'
    action     : string
    frequency  : string
    rationale  : string
  }[]
  lesRecommendations : {
    kekuatanUtama   : string[]                   // 5 kekuatan spesifik
    potensiProfesi  : { nama, alasan }[]         // 3 bidang profesi kontekstual
    karakterMenonjol: string[]                   // 3 sifat menonjol
    jalurUtama      : { nama, deskripsi }[]      // Les/aktivitas utama
    jalurPendukung  : { nama, deskripsi }[]      // Aktivitas pendukung
    belumPrioritas  : string[]                   // Aktivitas yang belum relevan
  }
}
```

### 8.5 Strategi Re-Enrichment

Sistem mendukung dua jenis pembaruan AI:

1. **Re-enrichment penuh** (`POST /api/admin/reenrich/[surveyId]`): Memanggil ulang AI dengan semua data terbaru, termasuk data keluarga jika sudah diisi.

2. **Re-kalkulasi skor keluarga** (`POST /api/admin/recalc/[surveyId]`): Menghitung ulang `calculateFamilyScores()` dan `calculateFitGap()` tanpa memanggil AI — berguna saat ada perbaikan algoritma normalisasi.

---

## 9. Penyajian Laporan Hasil

### 9.1 Alur Pembacaan Laporan

Laporan dirancang sebagai narasi berurutan yang membangun pemahaman bertahap:

```
BLOK 1: PROFIL ANAK
────────────────────────────────────────────
  1. Persona Banner
     └─ Label persona · Karakter menonjol · Deskripsi persona AI

  2. Kekuatan Utama
     └─ 5 kekuatan spesifik dari kombinasi skor + minat

  3. Potensi Profesi
     └─ 3 bidang profesi kontekstual + alasan berbasis rumpun

  4. Radar Chart + Score Cards
     └─ Visualisasi 4 rumpun · Skor mentah · Persentase · Badge "Dominan"

  5. Narasi Skor (AI)
     └─ Penjelasan tekstual hubungan antar skor

BLOK 2: EKOSISTEM KELUARGA (hanya jika family assessment sudah diisi)
────────────────────────────────────────────
  6. Pengenalan Hasab Keluarga
     └─ Definisi konsep · 4 chip hijau (Ilmi, Qiyadah, Amali, Wajdan)
        + 1 chip amber (Tarbiyah) · Penjelasan perbedaan Tarbiyah

  7. Radar 5 Dimensi Keluarga
     └─ Profil keluarga dari akumulasi semua figur · Jumlah figur diisi

  8. Status Fit-Gap
     └─ Verdict (OPTIMAL/GAP) · Meter skor · Top-3 Hasab · Rekomendasi deterministik

  9. Narasi Fit-Gap (AI)
     └─ Analisis kontekstual keselarasan

 10. Perbandingan 4×4 (Comparison Card)
     └─ Kolom kiri: 4 rumpun anak (brand)
        Kolom kanan: 4 potensi Hasab Keluarga (emerald, match di-highlight)
        Indikator: "selaras dengan Top-2 minat anak"

 11. Card Tarbiyah (terpisah)
     └─ Bar skor · Label kondusif/berkembang/perlu perhatian
        Penjelasan "kualitas tanah" pengasuhan

BLOK 3: AKSI DAN RENCANA
────────────────────────────────────────────
 12. Bridging Actions
     └─ Aksi konkret per figur keluarga (target: ayah/ibu/kakek/nenek)

 13. Rekomendasi Aktivitas & Les
     └─ Jalur utama · Jalur pendukung · Belum prioritas

 14. Micro-Dosing Plan
     └─ Jadwal aktivitas mingguan dengan figur yang terlibat

 15. Catatan Orang Tua
     └─ Saran pola asuh dan hal yang perlu dihindari

 16. Disclaimer
 17. Action Buttons (PDF · WhatsApp)
```

### 9.2 Computed Kritis di Halaman Hasil

```javascript
// 4 dimensi yang sebanding dengan rumpun anak (tanpa Tarbiyah)
const OVERLAP_DIMS = ['ilmi', 'qiyadah', 'amali', 'wajdan']

// Ranking keluarga: 4 dimensi, dinormalisasi ke 0–100, ditandai match/tidak
const familyDimRanking = computed(() => {
  const MAX = Math.max(...OVERLAP_DIMS.map(d => s[d]), 1)
  const top2ChildCodes = childDimRanking.value.slice(0, 2).map(x => x.code)
  const childToFamily = { asyiha: 'qiyadah', ilmi: 'ilmi', amali: 'amali', wajdan: 'wajdan' }
  const matchedFamilyDims = new Set(top2ChildCodes.map(c => childToFamily[c]))

  return OVERLAP_DIMS.map(d => ({
    code: d,
    pct: Math.round((s[d] / MAX) * 100),
    matched: matchedFamilyDims.has(d),
  })).sort((a, b) => b.pct - a.pct)
})

// Tarbiyah terpisah — dinormalisasi ke 0–100 terhadap skor maksimum per dimensi (25)
const tarbiyahPct = computed(() => Math.round((s.tarbiyah / 25) * 100))
```

### 9.3 Kontrol Akses Laporan

```
Akses publik        : hanya result dengan publicId === DEMO_RESULT_ID
Akses pemilik       : cookie history_session (JWT) harus match nomor telepon orang tua
Akses mitra         : JWT mitra yang valid (header Authorization)
Akses sekolah       : JWT sekolah yang valid + survey harus terhubung ke sekolah tersebut
Status 'processing' : selalu accessible (polling UI menunggu AI selesai)
```

---

## 10. Modul Multi-Stakeholder

### 10.1 Portal Mitra/Afiliasi

Mitra adalah lembaga atau individu yang memasarkan layanan PetaMinatBakat. Sistem menyediakan:

- **Referral code** unik per mitra untuk tracking sumber survei
- **Voucher management**: mitra dapat membuat voucher berbatas kuota
- **Dashboard komisi**: setiap survei yang menggunakan voucher mitra menghasilkan entri `Commission`
- **Autentikasi**: email/password dengan JWT bertanda `mitra`
- **Akses laporan**: mitra dapat membaca laporan survei yang menggunakan vouchernya

### 10.2 Portal Sekolah

Sekolah dapat mengintegrasikan PetaMinatBakat ke dalam proses penerimaan siswa atau bimbingan konseling:

- **Kode sekolah**: survei dapat terhubung ke sekolah tertentu via `schoolCode`
- **Manajemen kelas**: survei dapat diorganisasi per kelas (`SchoolClass`)
- **Consent**: siswa hanya masuk ke dashboard sekolah jika orang tua memberikan `consentGiven`
- **Multi-user**: sekolah dapat memiliki beberapa akun `SchoolUser` dengan peran berbeda

### 10.3 Panel Admin/Owner

Panel owner menyediakan operasi maintenance:

- **Re-enrichment massal**: memproses ulang survei yang analisis AI-nya gagal atau perlu diperbarui
- **Re-kalkulasi Fit-Gap**: menjalankan ulang algoritma normalisasi baru tanpa memanggil AI
- **Monitoring**: melihat status survei, hasil, dan log notifikasi

---

## 11. Keamanan dan Autentikasi

### 11.1 Autentikasi Orang Tua (OTP)

Orang tua tidak menggunakan username/password. Akses riwayat melalui:

```
1. Masukkan nomor telepon
2. Sistem kirim OTP 6 digit via WhatsApp (TTL: dikonfigurasi per `OtpCode.expiresAt`)
3. Verifikasi OTP → issue JWT (`history_session` cookie)
4. JWT berisi nomor telepon; server memvalidasi kepemilikan per request
```

### 11.2 JWT Multi-Level

Sistem menggunakan tiga secret JWT berbeda per peran:

```
JWT_SECRET          → history_session (orang tua)
MITRA_JWT_SECRET    → mitra_session (portal mitra)
SCHOOL_JWT_SECRET   → school_session (portal sekolah)
HISTORY_JWT_SECRET  → [legacy/khusus]
```

Pemisahan secret memastikan token satu peran tidak bisa dipakai untuk peran lain.

### 11.3 Rate Limiting

In-memory rate limiter per IP mencegah spam submisi:

```typescript
// 5 submission per IP per 60 detik
checkRateLimit(event, { max: 5, windowMs: 60_000, keyPrefix: 'survey-submit' })
```

### 11.4 Isolasi Transaksi Database

Penghitungan dan pengurangan kuota voucher menggunakan **Serializable isolation level** untuk mencegah race condition saat dua request bersamaan mencoba memakai voucher yang sama.

---

## 12. Alur Sistem End-to-End

### 12.1 Skenario Lengkap: Dari Pengisian hingga Laporan

```
[ORANG TUA]
    │
    ▼
Isi Survei Anak (pages/survey.vue)
    │  Nama, tanggal lahir, gender
    │  20 soal Hasab (Likert 1–5)
    │  Soal Nasab
    │  Pilihan minat alami
    │
    ▼
POST /api/surveys
    │  Prisma serializable transaction
    │  Upsert Parent → Create Child → Create Survey
    │  Simpan SurveyAnswer + ChildNaturalResponse
    │  status: 'processing'
    │
    ▼  [async, background]
AI Analyzer (aiAnalyzer.ts)
    │  System prompt + data input
    │  Model: claude-sonnet-5
    │  Output: JSON 10 field
    │
    ▼
Simpan SurveyResult
    │  Survey.status → 'completed'
    │  Kirim notifikasi WhatsApp
    │
    ▼
[ORANG TUA] Lihat Laporan (pages/results/[id].vue)
    │
    │  [OPSIONAL]
    ▼
Isi Family Assessment (pages/family-survey/[surveyId].vue)
    │  6 figur × 30 soal
    │
    ▼
POST /api/family-assessment/[surveyId]/submit
    │  calculateFamilyScores() → normalisasi tertimbang
    │  calculateFitGap() → OPTIMAL/GAP + score
    │  Simpan FamilyResult
    │
    ▼  [async, background]
AI Re-enrichment
    │  fitGapNarrative + bridgingActions diperbarui
    │
    ▼
Laporan Lengkap dengan Blok Hasab Keluarga
```

### 12.2 Skenario Sekolah

```
Sekolah mendaftar → mendapat kode sekolah
    │
    ▼
Orang tua isi survei → masukkan kode sekolah + berikan consent
    │
    ▼
Survei terhubung ke SurveyStudent (consent: true)
    │
    ▼
Guru/admin sekolah login → lihat daftar survei siswa kelas
    │  (hanya yang consentGiven=true)
    ▼
Akses laporan individual dengan token sekolah
```

---

## 13. Kesimpulan

### 13.1 Inovasi Utama Sistem

PetaMinatBakat memperkenalkan beberapa inovasi teknis dan konseptual yang membedakannya dari alat penilaian minat konvensional:

1. **Framework Nasab–Hasab**: Penilaian berbasis epistemologi Islam yang mengintegrasikan warisan kolektif keluarga, bukan hanya psikometri individual anak.

2. **Penilaian Ekosistem Keluarga Multi-Figur**: Alih-alih hanya menilai anak, sistem mengukur kapasitas ekosistem keluarga (6 figur) dalam mendukung potensi tersebut.

3. **Algoritma Fit-Gap Deterministik**: Keselarasan antara rumpun anak dan hasab keluarga dihitung secara algoritmik yang transparan dan dapat dijelaskan, bukan sekadar opini AI.

4. **Normalisasi Tertimbang Adaptif**: Keluarga dengan sedikit figur yang berpartisipasi tetap mendapat skor yang adil berkat normalisasi berbasis `weightSums`, bukan nilai absolut.

5. **Pemisahan Konseptual Tarbiyah**: Dimensi pola asuh (Tarbiyah) tidak diperlakukan setara dengan dimensi potensi bawaan — tampil terpisah dalam laporan dan dikecualikan dari Fit-Gap — menjaga kejernihan analitik.

6. **Laporan Multi-Level**: Satu sumber data menghasilkan laporan yang dapat diakses oleh empat peran berbeda (orang tua, mitra, sekolah, admin) dengan kontrol akses granular.

### 13.2 Keterbatasan dan Arah Pengembangan

| Keterbatasan | Arah Pengembangan |
|---|---|
| Penilaian keluarga bersifat *self-report* (rentan bias sosial) | Triangulasi dengan observasi atau wawancara terstruktur |
| Fit-Gap biner (OPTIMAL/GAP) | Skala ordinal 5 level untuk gradasi yang lebih kaya |
| AI output bergantung pada ketersediaan API eksternal | Fallback model lokal atau template berbasis rule |
| Tidak ada mekanisme *longitudinal tracking* | Survei berkala dengan delta skor antar periode |
| Rate limiter in-memory (tidak persisten lintas restart) | Redis-based rate limiting untuk produksi skala besar |

---

*Dokumen ini dihasilkan berdasarkan analisis kode sumber sistem PetaMinatBakat versi September 2026.*  
*Semua referensi kode mengacu pada implementasi aktual di `/home/yasir/Documents/Project/petabakat/`.*
