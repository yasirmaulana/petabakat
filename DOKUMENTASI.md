# Dokumentasi PetaBakat

> Aplikasi web pemetaan potensi anak berbasis konsep Islam **Nasab & Hasab**, dibangun dengan Nuxt 3 fullstack.

---

## Daftar Isi

1. [Gambaran Umum](#gambaran-umum)
2. [Tech Stack](#tech-stack)
3. [Struktur Project](#struktur-project)
4. [Fitur Utama](#fitur-utama)
5. [Alur Pengguna (User Flow)](#alur-pengguna-user-flow)
6. [Alur Bisnis & Logika Backend](#alur-bisnis--logika-backend)
7. [Skema Database](#skema-database)
8. [API Endpoints](#api-endpoints)
9. [Autentikasi & Keamanan](#autentikasi--keamanan)
10. [Integrasi Eksternal](#integrasi-eksternal)
11. [Konfigurasi & Environment](#konfigurasi--environment)
12. [Deployment](#deployment)

---

## Gambaran Umum

**PetaBakat** adalah platform asesmen mandiri berbasis web yang membantu orang tua mengidentifikasi potensi anak melalui dua dimensi:

- **Nasab** — garis keturunan sah dan kejelasan silsilah keluarga.
- **Hasab** — rekam jejak kemuliaan, akhlak, dan pencapaian keluarga lintas 3 generasi.

Orang tua mengisi survei tentang karakter keluarga besar dan minat alami anak. Sistem menghitung skor 4 rumpun kecerdasan secara deterministik, lalu AI (Claude API) menganalisis kombinasi skor tersebut menjadi **persona potensi anak** beserta **rencana aktivitas mingguan (micro-dosing)** yang actionable.

**Target pengguna:**
- Orang tua / pasangan muda dengan anak usia 3–15 tahun.
- Educator dan konselor keluarga Islam.

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Fullstack Framework** | Nuxt 3 (Vue 3 + Nitro server engine) |
| **Bahasa** | TypeScript |
| **Database** | PostgreSQL |
| **ORM** | Prisma 7 + driver adapter `@prisma/adapter-pg` |
| **Styling** | Tailwind CSS 3 |
| **Charting** | ApexCharts / vue3-apexcharts (Radar Chart) |
| **PDF Generator** | jsPDF (server-side, A4) |
| **AI — Primary** | Anthropic Claude API (`claude-sonnet` / `claude-haiku`) |
| **AI — Fallback** | Groq (`llama-3.3-70b-versatile`) |
| **WhatsApp Gateway** | Fonnte API (`api.fonnte.com/send`) |
| **Deployment** | Vercel (`@vercel/functions`, analytics, speed-insights) |

---

## Struktur Project

```
petabakat/
├── pages/                        # Halaman Nuxt (Vue SPA)
│   ├── index.vue                 # Landing page
│   ├── survey.vue                # Wizard survey multi-step
│   ├── history.vue               # Cek riwayat via nomor HP + OTP
│   └── results/[id].vue          # Dashboard hasil analisis
│
├── server/
│   ├── api/                      # Nitro API routes
│   │   ├── questions.get.ts      # GET  /api/questions
│   │   ├── recent-results.get.ts # GET  /api/recent-results
│   │   ├── surveys.post.ts       # POST /api/surveys
│   │   ├── results/[id].get.ts   # GET  /api/results/:id
│   │   ├── history/
│   │   │   ├── index.get.ts      # GET  /api/history
│   │   │   └── logout.post.ts    # POST /api/history/logout
│   │   ├── otp/
│   │   │   ├── send.post.ts      # POST /api/otp/send
│   │   │   └── verify.post.ts    # POST /api/otp/verify
│   │   └── reports/[id]/
│   │       ├── pdf.get.ts        # GET  /api/reports/:id/pdf
│   │       └── send.post.ts      # POST /api/reports/:id/send
│   │
│   └── utils/                    # Server utilities (tidak diekspos ke client)
│       ├── prisma.ts             # Singleton PrismaClient
│       ├── hasabCalculator.ts    # Kalkulasi skor deterministik
│       ├── aiAnalyzer.ts         # Multi-provider AI (Anthropic + Groq)
│       ├── fallbackAnalysis.ts   # Rule matrix statis jika AI gagal
│       ├── pdfBuilder.ts         # Generator PDF via jsPDF
│       ├── rateLimiter.ts        # In-memory rate limiter per IP
│       └── whatsapp.ts           # Wrapper Fonnte API
│
├── components/                   # Vue components reusable
│   ├── OtomatisinBanner.vue      # Banner wakaf Madrasah Al-Fatih
│   ├── ToastContainer.vue        # Toast notifikasi rolling
│   └── LiteYoutube.vue           # YouTube embed ringan
│
├── prisma/
│   ├── schema.prisma             # Skema database
│   └── seed.ts                   # Seed data (pertanyaan + kategori)
│
├── assets/css/main.css           # Global styles
├── nuxt.config.ts                # Konfigurasi Nuxt
├── tailwind.config.ts            # Konfigurasi Tailwind
└── prd.md                        # Product Requirement Document
```

---

## Fitur Utama

### 1. Landing Page (`/`)

- **Hero section** dengan CTA "Mulai Survey Potensi Anak".
- **Penjelasan 4 rumpun Hasab** secara ringkas (Asyiha, Ilmi, Amali, Wajdan).
- **Preview video demo** hasil analisis (YouTube embed lite, lazy load).
- **Toast rolling** — menampilkan hasil survei terbaru dari API `GET /api/recent-results` secara real-time untuk social proof.
- **Banner wakaf** Madrasah Al-Fatih (tarahum.id) sebagai afiliasi.

---

### 2. Wizard Survey (`/survey`)

Survey multi-step **6 langkah** dengan progress bar:

| Step | Konten |
|---|---|
| **0 — Data Keluarga** | Nama & nomor WA orang tua; nama, tanggal lahir, gender anak; pilihan minat alami anak (checkbox + free text) |
| **1 — Nasab** | 2 pertanyaan Ya/Tidak: kejelasan garis keturunan & kepatuhan batas mahram |
| **2 — Hasab Asyiha** | 5 pertanyaan Likert 1–5 (Kepemimpinan & Sosial) |
| **3 — Hasab Ilmi** | 5 pertanyaan Likert 1–5 (Intelektual & Keilmuan) |
| **4 — Hasab Amali** | 5 pertanyaan Likert 1–5 (Bisnis & Teknis) |
| **5 — Hasab Wajdan** | 5 pertanyaan Likert 1–5 (Seni & Spiritual) |

Setelah step 5, form di-submit ke `POST /api/surveys` dan user diarahkan ke halaman hasil.

**Validasi:** rate limiter 5 request/menit per IP di server untuk mencegah spam.

---

### 3. Dashboard Hasil Analisis (`/results/[id]`)

Menampilkan hasil analisis lengkap setelah proses AI selesai:

- **Radar Chart interaktif** (ApexCharts) — visualisasi 4 skor rumpun.
- **Label Persona** — nama persona unik yang dihasilkan AI (contoh: *The Innovator Leader*).
- **Deskripsi Persona** — narasi personal tentang potensi anak berdasarkan kombinasi skor + minat alami.
- **Narasi Skor Hasab** — interpretasi makna tiap rumpun dalam konteks keluarga tersebut.
- **Micro-Dosing Plan** — jadwal stimulasi aktivitas mingguan (Sabtu Pagi, Minggu Sore, Hari Sekolah) durasi 30–60 menit.
- **Catatan Orang Tua** — saran pola asuh spesifik dari AI.
- **Tombol Unduh PDF** — generate & download laporan A4.
- **Tombol Kirim WA** — kirim link laporan ke nomor WA orang tua.

> Jika AI masih memproses, halaman menampilkan loading state dan polling otomatis.

---

### 4. Riwayat Survei (`/history`)

Akses riwayat survei berbasis verifikasi nomor HP tanpa perlu membuat akun:

1. User memasukkan nomor HP/WA.
2. Sistem mengirim **kode OTP 6 digit** via WhatsApp (berlaku 5 menit).
3. User memasukkan OTP → sesi diverifikasi.
4. Ditampilkan **daftar survei** yang pernah dilakukan oleh nomor tersebut (nama anak, tanggal, status).
5. User bisa membuka kembali dashboard hasil dan mengunduh PDF tanpa isi ulang survei.
6. **Logout** menghapus cookie sesi.

---

### 5. Laporan PDF (`GET /api/reports/:id/pdf`)

PDF dihasilkan **server-side** via jsPDF, format A4, konten:

- Data anak (nama, usia, gender) dan nama orang tua.
- Persona label + deskripsi.
- Tabel skor 4 rumpun Hasab dengan kolom dominan yang dihighlight.
- Narasi skor tiap rumpun.
- Jadwal micro-dosing mingguan.
- Catatan pola asuh untuk orang tua.
- Footer setiap halaman: link wakaf Madrasah Al-Fatih.

---

### 6. Notifikasi WhatsApp

- **Otomatis** — setelah analisis AI selesai, sistem mengirim notifikasi ke nomor WA orang tua berisi link ke halaman hasil (background, fire-and-forget).
- **Manual** — user dapat menekan tombol "Kirim ke WA" dari halaman hasil kapan saja (`POST /api/reports/:id/send`).

---

## Alur Pengguna (User Flow)

```
Landing Page (/)
    │
    ▼ klik "Mulai Survey"
Wizard Survey (/survey) — 6 step
    │
    ▼ submit
POST /api/surveys
    │ ← redirect langsung (tidak tunggu AI)
    ▼
Dashboard Hasil (/results/[id]) — loading state
    │
    ▼ background: AI analysis selesai
Dashboard Hasil — data lengkap tampil
    │
    ├──► Unduh PDF
    └──► Kirim WA
```

**Alur Riwayat:**

```
History Page (/history)
    │
    ▼ input nomor HP
POST /api/otp/send → WA OTP dikirim
    │
    ▼ input kode OTP
POST /api/otp/verify → cookie `history_session` di-set
    │
    ▼
GET /api/history → daftar survei
    │
    ▼ klik survei
/results/[id] — lihat hasil lama
```

---

## Alur Bisnis & Logika Backend

### Submit Survey → Analisis AI

```
POST /api/surveys
    │
    ▼ (satu DB transaction Serializable)
    ├── upsert Parent (by phone — idempotent jika sudah ada)
    ├── create Child
    ├── calculateHasabScores (deterministik, lihat formula)
    ├── create Survey { status: 'processing' }
    ├── create SurveyAnswers (bulk insert)
    └── create ChildNaturalResponses
    │
    ▼ return { publicId } → client redirect ke /results/[id]
    │
    ▼ background (Vercel waitUntil — non-blocking):
analyzeWithAi (multi-provider fallback chain)
    ├── 1. Anthropic Sonnet  — retry 2×, backoff 500ms
    ├── 2. Anthropic Haiku   — retry 2×, backoff 750ms
    └── 3. Groq Llama 3.3 70B — retry 2×, backoff 1000ms
    │   (jika semua gagal)
    └── 4. fallbackAnalysis — rule matrix statis
    │
    ▼
create SurveyResult (simpan ke DB)
update Survey.status → 'completed'
    │
    ▼
notifyParentAsync → kirim WA + log ke NotificationLog
```

---

### Formula Kalkulasi Skor Hasab (Deterministik)

```
Skor rumpun X  = Σ nilai Likert indikator 1..5   (range: 5–25)
Persentase X   = (Skor X / Total skor 4 rumpun) × 100%

Mapping question_id → rumpun:
  Asyiha  → pertanyaan 1–5
  Ilmi    → pertanyaan 6–10
  Amali   → pertanyaan 11–15
  Wajdan  → pertanyaan 16–20
```

---

### Analisis AI

**Input ke AI (user prompt per anak):**
- Skor & persentase 4 rumpun, urutan dominan ke lemah.
- Jawaban nasab (konteks nilai dasar keluarga).
- Respon alami / minat dominan anak.
- Usia dan jenis kelamin anak.

**System prompt** berisi framework Nasab-Hasab, filosofi 4 rumpun, prinsip nature × nurture, dan panduan nada bahasa (hangat, memberdayakan, berbasis nilai Islam).

**Output AI (structured JSON):**

```json
{
  "personaLabel": "The Innovator Leader",
  "personaDescription": "...",
  "scoreNarrative": "...",
  "parentNotes": "...",
  "microdosingPlan": {
    "sabtupagi": { "activity": "...", "duration": "30 menit" },
    "minggusore": { "activity": "...", "duration": "45 menit" },
    "harisekolah": { "activity": "...", "duration": "20 menit" }
  }
}
```

**Fallback rule matrix (jika semua AI gagal):**

| Kombinasi Rumpun Dominan | Persona |
|---|---|
| Amali + Ilmi + Asyiha | The Innovator Leader |
| Wajdan + Ilmi + Asyiha | The Visionary Curator |
| Wajdan + Ilmi | The Wise Thinker |
| Amali + Wajdan | The Ethical Creator |

---

### Sistem OTP

```
POST /api/otp/send
  1. Cek nomor HP terdaftar di tabel parents
  2. Generate kode 6 digit random
  3. Simpan ke tabel otps { phone, code, expiresAt: +5 menit }
  4. Kirim via Fonnte WA API

POST /api/otp/verify
  1. Cek kode cocok + belum expired + belum used
  2. Set otps.used = true
  3. Set cookie httpOnly `history_session` = phone (24 jam)
```

---

## Skema Database

### ERD Ringkas

```
parents ──1:N── children ──1:N── surveys ──1:N── survey_answers
                                    │
                                    ├──1:N── child_natural_responses
                                    │
                                    └──1:1── survey_results ──1:1── pdf_reports

questions ──N:1── hasab_categories
survey_answers ──N:1── questions
```

### Tabel

#### `parents`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT PK | Auto increment |
| name | VARCHAR(255) | Nama orang tua/wali |
| phone | VARCHAR(20) UNIQUE | Kunci lookup & pengiriman WA |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

#### `children`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT PK | |
| parent_id | FK → parents | |
| name | VARCHAR(255) | Nama anak |
| birth_date | DATE | Tanggal lahir |
| gender | VARCHAR(1) | L / P |
| created_at | TIMESTAMP | |

#### `hasab_categories` *(seed tetap, 4 baris)*
| code | name |
|---|---|
| asyiha | Kepemimpinan & Sosial |
| ilmi | Intelektual & Keilmuan |
| amali | Bisnis & Teknis |
| wajdan | Seni & Spiritual |

#### `questions`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT PK | |
| category_id | FK → hasab_categories | NULL untuk pertanyaan nasab |
| order | INT | Urutan dalam kategori (1–5) |
| text | TEXT | Teks pertanyaan |
| type | VARCHAR(10) | `hasab` / `nasab` |

#### `surveys`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT PK | |
| public_id | UUID | ID publik untuk URL |
| child_id | FK → children | |
| parent_id | FK → parents | Denormalisasi untuk query cepat |
| status | VARCHAR(20) | `processing` / `completed` |
| created_at | TIMESTAMP | |
| completed_at | TIMESTAMP NULL | |

#### `survey_answers`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT PK | |
| survey_id | FK → surveys | |
| question_id | FK → questions | |
| value | SMALLINT (1–5) | Skor Likert |

UNIQUE(survey_id, question_id)

#### `child_natural_responses`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT PK | |
| survey_id | FK → surveys | |
| response_option | VARCHAR(255) | Pilihan minat yang dipilih |
| free_text | TEXT NULL | Input bebas jika ada |

#### `survey_results`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT PK | |
| survey_id | FK → surveys UNIQUE | |
| score_asyiha | SMALLINT | 0–25 |
| score_ilmi | SMALLINT | 0–25 |
| score_amali | SMALLINT | 0–25 |
| score_wajdan | SMALLINT | 0–25 |
| pct_asyiha | DECIMAL(5,2) | Persentase |
| pct_ilmi | DECIMAL(5,2) | |
| pct_amali | DECIMAL(5,2) | |
| pct_wajdan | DECIMAL(5,2) | |
| dominant_hasab | VARCHAR(20) | Kode rumpun dominan |
| source | VARCHAR(10) | `ai` / `fallback` |
| persona_label | VARCHAR(100) | Label persona |
| persona_description | TEXT | Deskripsi personal |
| score_narrative | TEXT | Narasi skor dari AI |
| parent_notes | TEXT | Catatan pola asuh dari AI |
| microdosing_plan | JSON | Jadwal aktivitas mingguan |
| ai_raw_response | JSON NULL | Response mentah AI (debugging) |
| ai_model | VARCHAR(50) NULL | Model yang dipakai |
| created_at | TIMESTAMP | |

#### `pdf_reports`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT PK | |
| survey_id | FK → surveys | |
| file_path | VARCHAR(500) | Path / URL PDF |
| sent_via_wa | BOOLEAN | Sudah dikirim WA? |
| sent_at | TIMESTAMP NULL | Waktu pengiriman |
| created_at | TIMESTAMP | |

#### `otps`
| Kolom | Tipe | Keterangan |
|---|---|---|
| id | INT PK | |
| phone | VARCHAR(20) | Nomor HP |
| code | VARCHAR(6) | Kode OTP 6 digit |
| expires_at | TIMESTAMP | +5 menit dari created |
| used | BOOLEAN | |
| created_at | TIMESTAMP | |

---

## API Endpoints

| Method | Path | Deskripsi |
|---|---|---|
| GET | `/api/questions` | Ambil semua pertanyaan survey (hasab + nasab) |
| GET | `/api/recent-results` | Ambil hasil survei terbaru (untuk toast landing) |
| POST | `/api/surveys` | Submit survey → trigger analisis AI async |
| GET | `/api/results/:id` | Ambil hasil analisis by public ID |
| POST | `/api/otp/send` | Kirim OTP ke nomor HP via WA |
| POST | `/api/otp/verify` | Verifikasi OTP → set cookie sesi |
| GET | `/api/history` | Ambil riwayat survei (butuh cookie sesi) |
| POST | `/api/history/logout` | Hapus cookie sesi |
| GET | `/api/reports/:id/pdf` | Generate & stream file PDF |
| POST | `/api/reports/:id/send` | Kirim link laporan ke WA |

---

## Autentikasi & Keamanan

PetaBakat **tidak menggunakan akun user**. Sistem menggunakan dua mekanisme berbeda:

### Akses Hasil Survei
- Setiap survei memiliki `public_id` (UUID) yang menjadi bagian dari URL `/results/[id]`.
- Siapa pun yang memiliki URL dapat melihat hasil (by design — untuk kemudahan berbagi).

### Akses Riwayat (History)
- Berbasis **OTP WhatsApp** → cookie httpOnly `history_session` (24 jam).
- Cookie berisi nomor HP yang terverifikasi; API `/api/history` hanya membaca data milik nomor tersebut.

### Perlindungan Rate Limiting
- `POST /api/surveys` — **5 request/menit per IP** (in-memory rate limiter).
- `POST /api/otp/send` — throttle untuk mencegah spam OTP.

---

## Integrasi Eksternal

### Anthropic Claude API
- **Endpoint kustom** — bisa diarahkan ke proxy via env `ANTHROPIC_BASE_URL`.
- **Model chain:** Sonnet (utama) → Haiku (fallback 1) → Groq Llama 70B (fallback 2) → rule matrix statis (fallback 3).
- Semua hasil AI di-cache di kolom `ai_raw_response` sehingga tidak perlu re-generate.

### Fonnte WhatsApp API
- Endpoint: `https://api.fonnte.com/send`
- Auth: token via env `FONNTE_TOKEN`.
- Dipakai untuk: pengiriman OTP, notifikasi hasil analisis, pengiriman link laporan.

### Vercel
- `waitUntil` dipakai untuk menjalankan analisis AI secara background tanpa memblokir response HTTP.
- `@vercel/analytics` dan `@vercel/speed-insights` terpasang untuk monitoring.

---

## Konfigurasi & Environment

Variabel environment yang diperlukan (`.env`):

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/petabakat

# AI — Anthropic
ANTHROPIC_API_KEY=sk-ant-...
ANTHROPIC_BASE_URL=https://api.anthropic.com   # opsional, untuk proxy

# AI — Groq (fallback)
GROQ_API_KEY=gsk_...

# WhatsApp Gateway — Fonnte
FONNTE_TOKEN=...

# App
NUXT_PUBLIC_SITE_URL=https://petabakat.vercel.app
```

---

## Deployment

Aplikasi di-deploy ke **Vercel** sebagai Nuxt 3 fullstack:

- Frontend (Vue/SSR) dan backend (Nitro API routes) dalam satu deployment.
- Database PostgreSQL di-host secara terpisah (Neon / Supabase / self-hosted).
- Tidak ada background worker terpisah — analisis AI berjalan via `waitUntil` Vercel Edge Functions.

**Build & run lokal:**

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Jalankan migrasi database
npx prisma migrate deploy

# Seed data pertanyaan
npx prisma db seed

# Development
npm run dev

# Production build
npm run build
npm run start
```
