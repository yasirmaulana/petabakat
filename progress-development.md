# Progress Development — PetaBakat

## Status Keseluruhan

| Fase | Status | Catatan |
|------|--------|---------|
| 0. Project Setup | ✅ Done | Nuxt 3 + Prisma + PostgreSQL |
| 1. Database & Seed | ✅ Done | Schema + 22 pertanyaan seeded |
| 2. Landing Page | ✅ Done | `/` hero + 4 rumpun + sample persona |
| 3. Wizard Survey | ✅ Done | `/survey` form multi-step 6 langkah |
| 4. Kalkulasi & AI | ✅ Done | Skor deterministik + Claude API + fallback |
| 5. Halaman Hasil | ✅ Done | `/results/[id]` radar chart + persona |
| 6. PDF Report | ✅ Done | `/api/reports/[id]/pdf` Puppeteer |
| 7. WhatsApp | ✅ Done | `/api/reports/[id]/send` Fonnte/Wablas |
| 8. Lookup Riwayat | ✅ Done | `/history` cari via nomor HP |

---

## Struktur File

```
petabakat/
├── pages/
│   ├── index.vue               # Landing page
│   ├── survey.vue              # Wizard survey (6 step)
│   ├── history.vue             # Cek riwayat via nomor HP
│   └── results/
│       └── [id].vue            # Halaman hasil analisis
├── server/
│   ├── utils/
│   │   ├── prisma.ts           # Prisma singleton
│   │   ├── hasabCalculator.ts  # Kalkulasi skor deterministik
│   │   ├── aiAnalyzer.ts       # Claude API integration
│   │   ├── fallbackAnalysis.ts # Rule matrix statis
│   │   └── pdfTemplate.ts      # HTML template untuk PDF
│   └── api/
│       ├── questions.get.ts    # GET /api/questions
│       ├── surveys.post.ts     # POST /api/surveys
│       ├── history.get.ts      # GET /api/history?phone=...
│       └── reports/[id]/
│           ├── pdf.get.ts      # GET /api/reports/[id]/pdf
│           └── send.post.ts    # POST /api/reports/[id]/send
├── prisma/
│   ├── schema.prisma           # 8 tabel database
│   ├── seed.ts                 # 4 kategori + 22 pertanyaan
│   └── migrations/
│       └── 20260815141937_init/
│           └── migration.sql
├── .env                        # DATABASE_URL, ANTHROPIC_API_KEY, WA_API_KEY
├── nuxt.config.ts
├── prd.md
├── database-schema.md
└── progress-development.md
```

---

## Detail Per Fase

### ✅ Project Setup
- Init Nuxt 3 + install: Prisma, Tailwind, Anthropic SDK, Puppeteer, ApexCharts, jsPDF, pg, adapter-pg
- Prisma 7 memerlukan driver adapter (`PrismaPg`) — bukan inline `url` di schema

### ✅ Database & Seed
- Migration `init` applied ke `petabakatDB` (user: yasir, pass: yasir)
- 4 kategori hasab, 20 pertanyaan hasab (5/kategori), 2 pertanyaan nasab
- Jalankan ulang seed: `DATABASE_URL="..." npx tsx prisma/seed.ts`

### ✅ Landing Page (`pages/index.vue`)
- Hero + CTA → `/survey`
- Grid 4 rumpun hasab
- Contoh persona "The Innovator Leader"

### ✅ Wizard Survey (`pages/survey.vue`)
- Step 0: Data orang tua, anak, minat alami (checkbox + free text)
- Step 1: 2 pertanyaan nasab (ya/tidak)
- Step 2–5: 5 pertanyaan hasab per kategori (Likert 1–5)
- POST ke `/api/surveys` → redirect ke `/results/[id]`

### ✅ Kalkulasi & AI (`server/api/surveys.post.ts`)
- Skor per rumpun dihitung deterministik (jumlah nilai Likert)
- Persentase = skor rumpun / total skor × 100%
- Claude API dipanggil dengan system prompt framework Nasab-Hasab
- Output: persona label, deskripsi, narasi skor, catatan ortu, micro-dosing
- Fallback ke rule matrix statis jika Claude gagal
- `source` kolom mencatat `'ai'` atau `'fallback'`

### ✅ Halaman Hasil (`pages/results/[id].vue`)
- Radar chart ApexCharts (4 rumpun)
- Persona label + deskripsi dari AI
- Skor + persentase tiap rumpun
- Jadwal micro-dosing
- Catatan orang tua
- Tombol unduh PDF + kirim WA

### ✅ PDF Report (`server/api/reports/[id]/pdf.get.ts`)
- Puppeteer render HTML template → PDF A4
- Template: header, data anak, persona, skor, micro-dosing, catatan ortu
- Return stream PDF langsung ke browser
- Simpan path ke tabel `pdf_reports`

### ✅ WhatsApp (`server/api/reports/[id]/send.post.ts`)
- Kirim pesan + link PDF ke nomor HP orang tua
- Integrasi Fonnte (konfigurasi via `WHATSAPP_API_KEY` + `WHATSAPP_API_URL` di `.env`)
- Update `pdf_reports.sent_via_wa = true` setelah berhasil

### ✅ Lookup Riwayat (`pages/history.vue` + `server/api/history.get.ts`)
- Input nomor HP → cari parent → tampilkan semua survey
- Setiap baris: nama anak, tanggal, skor 4 rumpun, persona label
- Link ke `/results/[id]` untuk detail lengkap

---

## Konfigurasi yang Perlu Diisi

File `.env`:
```env
DATABASE_URL="postgresql://yasir:yasir@localhost:5432/petabakatDB?schema=public"
ANTHROPIC_API_KEY="sk-ant-..."        # dari console.anthropic.com
WHATSAPP_API_KEY="..."                # token dari Fonnte/Wablas
WHATSAPP_API_URL="https://api.fonnte.com/send"
```

---

## Yang Bisa Dikembangkan Selanjutnya

- [ ] Admin dashboard: daftar semua survey, export CSV
- [ ] OTP verifikasi nomor HP sebelum lihat riwayat
- [ ] Simpan file PDF ke object storage (S3/R2) vs generate ulang
- [ ] Tambah pertanyaan nasab lebih detail (3 generasi)
- [ ] Cache hasil AI di `aiRawResponse` sudah tersimpan — bisa re-render tanpa re-call API
- [ ] Internasionalisasi (en/ar)
