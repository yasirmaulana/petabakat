# PRD — Fitur Bisnis PetaMinatBakat
## Monetisasi · Kemitraan · Dashboard Sekolah

**Versi:** 1.0  
**Tanggal:** 2026-09-06  
**Status:** Draft  

---

## Daftar Isi
1. [Konteks & Tujuan](#1-konteks--tujuan)
2. [Fitur 1: Monetisasi Direct](#2-fitur-1-monetisasi-direct)
3. [Fitur 2: Program Kemitraan](#3-fitur-2-program-kemitraan)
4. [Dashboard Sekolah](#4-fitur-3-dashboard-sekolah)
5. [Skema Database Baru](#5-skema-database-baru)
6. [Arsitektur & Tech Decisions](#6-arsitektur--tech-decisions)
7. [Roadmap Prioritas](#7-roadmap-prioritas)
8. [Fitur Pemilik Bisnis (Owner Dashboard)](#8-fitur-pemilik-bisnis-owner-dashboard)

---

## 1. Konteks & Tujuan

PetaMinatBakat saat ini bersifat gratis sepenuhnya. Produk sudah memiliki:
- AI analysis pipeline (persona, narasi, micro-dosing, les recommendations)
- PDF laporan 3 halaman
- Story card 9:16 (unduh PNG)
- Real user data (Elsha Navya sebagai contoh)

Kompetitor terdekat **petaminatbakat.id** (TECCA framework) menarik Rp 99.000/laporan. PetaMinatBakat Hasab memiliki USP lebih kuat (Islamic framework + AI personal + les spesifik), sehingga harga Rp 99.000 defensible dan bisa dinaikkan ke Rp 129.000 di iterasi berikutnya.

**Tiga pilar monetisasi yang dirancang:**

| Pilar | Model | Target Segmen |
|---|---|---|
| Direct | Rp 99.000/laporan | Orang tua individual |
| Kemitraan | Revenue share / komisi | Bimbel, affiliate personal |
| Dashboard Sekolah | Langganan bulanan | Sekolah Islam, pesantren, SDIT |

---

## 2. Fitur 1: Monetisasi Direct

### 2.1 Konsep & Nilai Bisnis

Model **voucher-first**: pengguna mengisi data anak terlebih dahulu, lalu diminta memasukkan kode voucher untuk lanjut ke survei. Jika belum punya voucher, diarahkan beli via WhatsApp admin.

**Yang didapat setelah voucher valid:**
- Akses form survei lengkap (Nasab + Hasab + minat + momen antusias)
- Radar chart lengkap dengan skor & persentase
- Narasi persona penuh (3–5 paragraf AI)
- Score narrative (penjelasan tiap rumpun)
- Micro-dosing mingguan (7-day plan)
- Rekomendasi les & aktivitas (jalurUtama + jalurPendukung)
- Unduh PDF laporan
- Unduh Story Card 9:16
- Catatan untuk orang tua

### 2.2 User Flow

```
Landing page — CTA "Mulai Survei"
    ↓
Langkah 1: Isi data anak
(nama, tanggal lahir, jenis kelamin, minat/respon alami, cerita momen antusias)
    ↓
Langkah 2: Isi data orang tua
(nama, nomor WA, email opsional, kode voucher)
    ↓ [jika kode voucher valid]
Lanjut ke survei (Nasab + Hasab per pertanyaan)
    ↓
AI analisis di background
    ↓
Redirect ke halaman hasil lengkap
    ↓
Tombol unduh PDF & Story Card aktif

    ↓ [jika tidak punya / tidak masukkan kode voucher]
Tampil CTA "Dapatkan Voucher"
→ Buka wa.me/6281586245143 dengan pesan otomatis
```

### 2.3 Spesifikasi Halaman Data Orang Tua (Langkah 2)

Field:
- Nama Orang Tua / Wali (wajib)
- Nomor WhatsApp (wajib)
- Email (opsional)
- Kode Voucher / Promo (opsional di input, wajib untuk lanjut)

Tombol CTA utama: **"Lanjut ke Survei"** — aktif hanya jika kode voucher terisi dan valid.

Jika kode tidak diisi atau tidak valid:
- Tampil link/tombol: **"Belum punya voucher? Dapatkan di sini →"**
- Klik → buka `wa.me/6281586245143?text=Halo%2C+saya+ingin+mendapatkan+voucher+PetaMinatBakat`
- Tombol "Lanjut ke Survei" tetap disabled selama voucher belum valid

Validasi voucher:
- `POST /api/vouchers/validate` — cek kode, status (aktif/habis/kadaluarsa), sisa kuota
- Response sukses: lanjut ke step survei
- Response gagal: tampil error inline di bawah field (contoh: "Kode tidak ditemukan" / "Voucher sudah habis")

### 2.4 Pembayaran & Distribusi Voucher

Pembelian tidak dilakukan di dalam aplikasi — voucher dibeli melalui WhatsApp admin (`wa.me/6281586245143`). Admin generate kode voucher secara manual atau via endpoint admin dan kirim ke pembeli.

**Model distribusi:**
- Direct: orang tua beli 1 voucher Rp 99.000 via WA admin
- Reseller / mitra bimbel: beli batch voucher Rp 65.000/kode (min. 10), distribusikan sendiri
- Sekolah: lihat Fitur 3

### 2.5 Skema Harga

| Tier | Harga | Cara Beli |
|---|---|---|
| Direct (1 laporan) | Rp 99.000 | WA admin → dapat kode voucher |
| Reseller / Bimbel | Rp 65.000/kode | Beli batch min. 10 kode via WA admin |
| Paket Sekolah | Lihat Fitur 3 | Langganan per siswa |

### 2.6 Landing Page Update

| Teks lama | Teks baru |
|---|---|
| `✓ Gratis & tanpa akun` | `Rp 99.000 · laporan AI personal` |
| `Gratis · ~5-10 menit · Hasil PDF` | `~5-10 menit · Laporan PDF + rekomendasi les · Rp 99.000` |
| FAQ: "apakah berbayar?" | Update jawaban: Rp 99.000, isi data anak dulu → masukkan kode voucher → akses survei + laporan penuh |

**Banner yang dihapus dari beranda:**
- `OtomatisinBanner` — dihapus karena kata "Gratis" di banner kontradiktif dengan positioning berbayar. Kredit tetap ada di footer sebagai `Dibangun oleh Otomatisin`.
- Banner wakaf pendidikan — dipindah dari halaman hasil ke beranda saja (di bawah FAQ), tidak muncul di halaman hasil setelah pengguna baru saja bayar.

### 2.7 Kebutuhan Teknis

**Baru di Prisma schema:**
```prisma
model Payment {
  id          Int      @id @default(autoincrement())
  surveyResultId Int  @unique
  orderId     String   @unique // Midtrans order ID
  amount      Int      // dalam rupiah
  status      String   @default("pending") // pending | paid | failed | refunded
  method      String?  // qris | gopay | bank_transfer | voucher
  voucherCode String?
  midtransData Json?
  paidAt      DateTime?
  createdAt   DateTime @default(now())
  
  surveyResult SurveyResult @relation(fields: [surveyResultId], references: [id])
}
```

**Server endpoints baru:**
- `POST /api/payments/create` — buat order Midtrans
- `POST /api/payments/webhook` — terima notifikasi Midtrans
- `GET /api/payments/status/:orderId` — polling status
- `POST /api/vouchers/redeem` — validasi & redeem kode voucher

**Perubahan `SurveyResult`:**
```prisma
paymentStatus String? @map("payment_status")
// values: pending | paid | voucher | school_partner
```

---

## 3. Fitur 2: Program Kemitraan

### 3.1 Dua Jenis Mitra

#### Tipe A: Mitra Institusi (Bimbel / Lembaga Pendidikan)

Target: bimbel, pusat try-out, lembaga Parenting Nabawiyah, pesantren, sanggar.

**Value proposition untuk mitra:**
- Diferensiasi layanan: "kami tidak hanya drill soal, tapi bantu petakan potensi anak"
- Revenue tambahan dari markup atau bundling
- Data aggregate anak didik untuk bahan konseling

**Model bisnis:**
- Mitra beli kredit laporan dengan harga grosir (Rp 65.000/laporan, minimal 10 laporan)
- Mitra distribusikan ke orang tua melalui kode voucher atau link khusus mitra
- Mitra bisa markup ke orang tua (harga bebas, PetaMinatBakat tidak intervensi)
- Dashboard mitra: lihat kredit tersisa, laporan yang sudah di-generate, export data anak

#### Tipe B: Mitra Personal (Affiliate / Reseller Individual)

Target: guru freelance, konsultan parenting, alumni Parenting Nabawiyah, pengurus majelis taklim.

**Value proposition:**
- Komisi Rp 15.000–20.000 per laporan yang terjual via kode referral mereka
- Tidak perlu stok, tidak perlu modal — murni affiliate
- Cocok untuk yang punya koneksi ke sekolah atau komunitas orang tua

**Model bisnis:**
- Setiap mitra personal dapat kode referral unik (contoh: `REF-USTADZAH-SARI`)
- Pengguna yang pakai kode ini bayar normal (Rp 99.000), mitra personal dapat Rp 20.000 komisi
- Komisi dikumpulkan, dicairkan manual via transfer tiap bulan (MVP: manual, bukan otomatis)
- Dashboard: track klik, konversi, total komisi terkumpul, riwayat pencairan

### 3.2 Onboarding Mitra

**Alur pendaftaran:**
1. Isi form di `/mitra/daftar`: nama, institusi, jenis mitra, nomor WA, email
2. Admin review (manual, notifikasi WA ke admin)
3. Admin approve → sistem buat akun mitra, kirim kredensial via WA
4. Mitra login ke `/mitra/dashboard`

**MVP:** Approval manual oleh admin (tidak ada self-service automated). Cukup untuk 0–50 mitra pertama.

### 3.3 Dashboard Mitra

Route: `/mitra/dashboard` (protected, login dengan email+password atau magic link WA)

**Tampilan utama:**
```
┌─────────────────────────────────────────────┐
│ Selamat datang, Bimbel Al-Fatih             │
├──────────────┬──────────────┬───────────────┤
│ Kredit Sisa  │ Laporan      │ Total Komisi  │
│ 47 laporan   │ 23 digunakan │ Rp 460.000    │
└──────────────┴──────────────┴───────────────┘

[Beli Kredit] [Kode Voucher Aktif] [Export Data]

Laporan Terbaru:
─ Fatimah Az-Zahra · 28 Agustus 2026 · Voucher: BF-0012
─ Ahmad Naufal · 25 Agustus 2026 · Voucher: BF-0011
```

**Fitur dashboard mitra:**
- Lihat saldo kredit (Tipe A) atau total komisi (Tipe B)
- Generate & kelola kode voucher (Tipe A)
- Lihat daftar laporan yang sudah di-generate via kode mereka
- Export CSV: nama anak, tanggal, persona, skor 4 rumpun (tanpa data sensitif orang tua)
- Tipe A: tombol beli kredit → redirect ke payment Midtrans (bulk order)
- Tipe B: tabel riwayat komisi + form request pencairan

### 3.4 Skema Database Mitra

```prisma
model Partner {
  id           Int      @id @default(autoincrement())
  name         String
  institution  String?
  type         String   // institutional | affiliate
  email        String   @unique
  phone        String
  referralCode String   @unique
  status       String   @default("pending") // pending | active | suspended
  creditBalance Int     @default(0)   // hanya untuk Tipe A
  commissionRate Int    @default(20000) // rupiah per konversi, Tipe B
  createdAt    DateTime @default(now())
  
  vouchers     Voucher[]
  payments     Payment[] @relation("PartnerPayments")
  commissions  Commission[]
}

model Voucher {
  id          Int      @id @default(autoincrement())
  partnerId   Int
  code        String   @unique
  maxUses     Int      @default(1)
  usedCount   Int      @default(0)
  expiresAt   DateTime?
  createdAt   DateTime @default(now())
  
  partner     Partner  @relation(fields: [partnerId], references: [id])
  payments    Payment[]
}

model Commission {
  id          Int      @id @default(autoincrement())
  partnerId   Int
  paymentId   Int      @unique
  amount      Int      // dalam rupiah
  status      String   @default("pending") // pending | paid
  paidAt      DateTime?
  createdAt   DateTime @default(now())
  
  partner     Partner  @relation(fields: [partnerId], references: [id])
}
```

### 3.5 Halaman Publik Kemitraan

Route: `/mitra` — landing page program kemitraan.

**Konten:**
- Headline: "Tambahkan Nilai di Program Anda dengan Pemetaan Potensi Anak"
- Dua kartu: Mitra Institusi vs Mitra Personal, benefit masing-masing
- Testimoni (placeholder → isi dari mitra awal)
- Tabel harga grosir (Tipe A) dan komisi (Tipe B)
- CTA: "Daftar Jadi Mitra" → form

---

## 4. Fitur 3: Dashboard Sekolah

### 4.1 Konteks & Diferensiasi

Dashboard Sekolah berbeda dari Dashboard Mitra:
- **Mitra**: fokus distribusi & revenue
- **Sekolah**: fokus analitik pedagogis — melihat sebaran potensi anak didik untuk perencanaan program

Target: Sekolah Islam (SDIT, SMPIT, SMAIT), pesantren, homeschooling group, TK Islam.

**Value proposition untuk sekolah:**
- Lihat sebaran rumpun Hasab per kelas → bahan rapat guru
- Identifikasi anak dengan profil tertentu untuk program ekstrakurikuler
- Export laporan gabungan untuk laporan ke wali murid
- Data untuk konseling orang tua berbasis framework Islam

### 4.2 Model Bisnis Sekolah

**Paket Langganan:**

| Paket | Harga | Kapasitas | Fitur |
|---|---|---|---|
| Starter | Rp 150.000/bulan | 30 siswa | Dashboard basic, export CSV |
| Growth | Rp 350.000/bulan | 100 siswa | + analytics kelas, bulk WhatsApp |
| Pesantren | Rp 700.000/bulan | 300 siswa | + API, multi-angkatan, support prioritas |

**Catatan:** Paket Starter cocok untuk SDIT kecil atau homeschooling. Growth untuk sekolah reguler. Pesantren untuk boarding school besar.

Laporan per siswa tetap dibayar terpisah (Rp 65.000/siswa, harga partner) — langganan dashboard adalah biaya akses data, bukan biaya laporan.

### 4.3 User Roles di Dashboard Sekolah

| Role | Akses |
|---|---|
| Admin Sekolah | Full akses: kelola guru, lihat semua siswa, billing |
| Guru / Wali Kelas | Lihat hanya siswa di kelas yang assigned |
| Konselor | Lihat semua siswa + catatan konseling (future) |

### 4.4 Alur Pendaftaran Sekolah

1. Kepala sekolah / admin IT isi form di `/sekolah/daftar`: nama sekolah, NPSN, kota, jumlah siswa estimasi, kontak
2. Admin PetaMinatBakat review & set paket → approve
3. Sistem buat akun sekolah + akun admin sekolah pertama → kirim kredensial
4. Admin sekolah login, setup kelas, undang guru via email
5. Distribusi survei ke orang tua: share link survei + kode sekolah (`SDIT-ALFATIH-2026`)
6. Saat orang tua isi survei dengan kode sekolah → otomatis terhubung ke dashboard sekolah

### 4.5 Spesifikasi Dashboard Sekolah

Route: `/sekolah/dashboard`

#### Halaman Utama (Overview)

```
┌──────────────────────────────────────────────────────┐
│ SDIT Al-Fatih Jakarta · Tahun Ajaran 2026/2027       │
│ Paket: Growth · 47 / 100 siswa aktif                 │
├─────────────┬────────────────┬────────────────────────┤
│ Total Siswa │ Selesai Survei │ Belum Survei            │
│ 120         │ 47 (39%)       │ 73                      │
└─────────────┴────────────────┴────────────────────────┘

[Filter Kelas: Semua ▾] [Tahun Ajaran: 2026/2027 ▾] [Export CSV]

Sebaran Rumpun Dominan — 47 Siswa
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Al-Qiyadah   ████████████░ 14 siswa (29.8%)
Al-Ilmi     █████████░░░░ 12 siswa (25.5%)
Al-Amali    ████████░░░░░ 11 siswa (23.4%)
Al-Wajdan   ███████░░░░░░  9 siswa (19.1%)
Seimbang    ██░░░░░░░░░░░  1 siswa (2.1%)
```

#### Halaman Daftar Siswa

Tabel dengan kolom:
- Nama Anak · Kelas · Rumpun Dominan · Persona Label · Tanggal Survei · Status Laporan · Aksi

Filter: Kelas, Rumpun Dominan, Status (sudah/belum survei)

Aksi per baris:
- "Lihat Laporan" → buka `results/[id]` (full premium, tanpa bayar lagi)
- "Kirim Reminder" → kirim WA ke orang tua untuk mengisi survei (jika belum)

#### Halaman Kelas

Saat klik satu kelas (misal: Kelas 3A):
- Radar chart gabungan (rata-rata skor 4 rumpun seluruh kelas)
- Daftar siswa kelas + persona masing-masing
- Distribusi pie chart persona label
- Rekomendasi program ekstrakurikuler berdasarkan profil kelas (generated sekali per semester, bukan real-time AI)

#### Halaman Analytics

- Bar chart: distribusi rumpun per kelas (comparative)
- Scatter plot: hubungan skor Qiyadah vs Amali (identifikasi leadership potential)
- Top personas di sekolah ini
- Trend: jika sekolah sudah pakai lebih dari 1 tahun ajaran → perbandingan antar angkatan

### 4.6 Privasi & Consent

**Aturan kritis:**
1. Orang tua harus **secara eksplisit** memilih untuk berbagi data ke sekolah saat mengisi survei
2. Saat survei dikirim dengan kode sekolah → tampil checkbox konfirmasi: *"Saya setuju data hasil survei anak saya dibagikan ke [nama sekolah] untuk keperluan pendidikan"*
3. Jika orang tua tidak centang → survei tetap bisa selesai, tapi hasil tidak masuk dashboard sekolah
4. Orang tua bisa menarik consent kapan saja via halaman history

**Data yang tampil di dashboard sekolah:**
- ✓ Nama anak, kelas, skor 4 rumpun, persona label
- ✓ Rekomendasi les & aktivitas
- ✗ Nama orang tua, nomor WA orang tua (tidak tampil)
- ✗ Jawaban detail per pertanyaan (aggregat saja)

### 4.7 Integrasi Kode Sekolah ke Survei

Di halaman `/survey`, tambah field opsional:

```
Kode Sekolah (opsional)
[ SDIT-ALFATIH-2026     ]
Isi jika anak Anda bersekolah di sekolah yang bermitra dengan PetaMinatBakat.
```

Saat submit:
- Validasi kode sekolah di DB
- Jika valid → simpan `school_id` di record survey
- Jika orang tua consent → link ke dashboard sekolah
- Jika sekolah sudah over-kapasitas paket → tolak link (tapi survei tetap jalan)

### 4.8 Fitur Tambahan (Future — Post-MVP)

- **Bulk WhatsApp reminder** ke orang tua yang belum survei (via Fonnte/WA Gateway)
- **Laporan PDF per kelas** — satu PDF berisi ringkasan semua siswa
- **API sekolah** — untuk integrasi dengan sistem informasi sekolah yang sudah ada (Paket Pesantren)
- **Catatan konselor** — guru BK bisa tambah catatan per siswa di dalam dashboard

---

## 5. Skema Database Baru

### Ringkasan Perubahan

Tambahan model (tanpa mengubah model existing):

```prisma
// Monetisasi
model Payment {
  id             Int          @id @default(autoincrement())
  surveyResultId Int          @unique
  orderId        String       @unique
  amount         Int
  status         String       @default("pending")
  method         String?
  voucherCode    String?
  voucherId      Int?
  partnerId      Int?         // null jika bukan via mitra
  midtransData   Json?
  paidAt         DateTime?
  createdAt      DateTime     @default(now())
  
  surveyResult   SurveyResult @relation(fields: [surveyResultId], references: [id])
  voucher        Voucher?     @relation(fields: [voucherId], references: [id])
}

// Kemitraan
model Partner { ... }   // lihat §3.4
model Voucher { ... }   // lihat §3.4
model Commission { ... } // lihat §3.4

// Sekolah
model School {
  id           Int      @id @default(autoincrement())
  name         String
  npsn         String?  @unique
  city         String?
  code         String   @unique  // e.g. "SDIT-ALFATIH-2026"
  plan         String   @default("starter") // starter | growth | pesantren
  studentCap   Int      @default(30)
  billingStatus String  @default("trial") // trial | active | expired
  adminEmail   String
  adminPhone   String
  createdAt    DateTime @default(now())
  
  classes      SchoolClass[]
  surveys      Survey[]  // surveys yang terhubung ke sekolah ini
}

model SchoolClass {
  id        Int    @id @default(autoincrement())
  schoolId  Int
  name      String // e.g. "Kelas 3A"
  grade     Int    // 1-12
  year      String // "2026/2027"
  
  school    School @relation(fields: [schoolId], references: [id])
  students  SurveyStudent[] // pivot ke survey
}

model SurveyStudent {
  id           Int    @id @default(autoincrement())
  surveyId     Int    @unique
  schoolClassId Int
  consentGiven Boolean @default(false)
  
  survey       Survey      @relation(fields: [surveyId], references: [id])
  schoolClass  SchoolClass @relation(fields: [schoolClassId], references: [id])
}

model SchoolUser {
  id        Int      @id @default(autoincrement())
  schoolId  Int
  email     String   @unique
  name      String
  role      String   // admin | teacher | counselor
  password  String   // bcrypt hash
  createdAt DateTime @default(now())
  
  school    School   @relation(fields: [schoolId], references: [id])
}
```

**Perubahan di model existing:**

```prisma
// SurveyResult — tambah field
paymentStatus String? @map("payment_status")
// values: free | paid | voucher | school_partner

// Survey — tambah field
schoolId    Int?
schoolCode  String? // kode yang diketik user, untuk audit
```

---

## 6. Arsitektur & Tech Decisions

### 6.1 Authentication

**Dua sistem auth terpisah:**

| Sistem | Target | Implementasi |
|---|---|---|
| Mitra Auth | Partner (institusi & affiliate) | Email + password, JWT di cookie |
| Sekolah Auth | Admin & guru sekolah | Email + password, JWT di cookie, role-based |

Tidak ada SSO — keduanya independent. Shared `lib/auth.ts` utility untuk JWT verify.

**Tidak pakai:** NextAuth / Lucia / external provider. Alasan: overhead tidak perlu untuk user yang terbatas; cukup bcrypt + JWT.

### 6.2 Payment

**Midtrans Snap** (bukan Midtrans Core API):
- Lebih mudah diintegrasikan dari client-side
- Support QRIS, GoPay, bank transfer, kartu kredit
- Webhook untuk konfirmasi server-side

**Fallback manual:**
- Admin bisa set `payment_status = 'paid'` langsung via DB untuk kasus manual transfer
- Buat simple admin endpoint `POST /api/admin/payments/mark-paid` (protected dengan admin secret)

### 6.3 Server Routes Baru

```
/api/payments/
  POST create          → buat order Midtrans
  POST webhook         → terima notifikasi Midtrans (verify signature)
  GET  status/:orderId → polling dari client

/api/vouchers/
  POST redeem          → validasi + pakai voucher

/api/mitra/
  POST auth/login
  GET  dashboard       → stats mitra
  GET  laporan         → daftar laporan via mitra
  POST vouchers        → generate kode voucher (Tipe A)
  GET  commissions     → riwayat komisi (Tipe B)
  POST commissions/request → request pencairan

/api/sekolah/
  POST auth/login
  GET  dashboard       → overview sekolah
  GET  kelas           → daftar kelas
  GET  kelas/:id       → detail kelas + siswa
  GET  siswa           → semua siswa + filter
  GET  analytics       → data agregat
  POST kelas           → tambah kelas
  POST siswa/remind    → trigger WA reminder

/api/admin/
  GET  mitra           → list semua mitra (admin PetaMinatBakat)
  POST mitra/:id/approve
  GET  sekolah
  POST sekolah/:id/activate
  POST payments/:id/mark-paid
```

### 6.4 Frontend Routes Baru

```
/mitra                 → landing page program kemitraan
/mitra/daftar          → form pendaftaran mitra
/mitra/dashboard       → dashboard mitra (protected)
/mitra/login

/sekolah               → landing page dashboard sekolah
/sekolah/daftar        → form pendaftaran sekolah
/sekolah/dashboard     → overview (protected)
/sekolah/kelas/[id]    → detail kelas
/sekolah/siswa         → daftar siswa + filter
/sekolah/analytics
/sekolah/login
```

---

## 7. Roadmap Prioritas

### Phase 1 — Monetisasi Direct (2–3 minggu)
**Goal:** Generate revenue pertama.

- [ ] Tambah tabel `vouchers` (kode, status, kuota, expiry, used_by)
- [ ] Step 1 survei: isi data anak + minat + momen antusias (tanpa gate)
- [ ] Step 2 survei: isi data orang tua + input kode voucher
- [ ] Endpoint `POST /api/vouchers/validate` — cek kode valid, aktif, kuota tersisa
- [ ] Jika voucher valid → lanjut ke step pertanyaan Nasab + Hasab
- [ ] Jika voucher tidak diisi → tampil link WA admin `wa.me/6281586245143`
- [ ] Admin endpoint: generate kode voucher (single / batch)
- [ ] Update landing page text (Rp 99.000, voucher via WA)
- [ ] Test: kode valid, kode salah, kode habis kuota, kode kadaluarsa

**Validasi:** 10 pembayaran pertama → konfirmasi willingness to pay Rp 99.000.

---

### Phase 2 — Kemitraan (3–4 minggu setelah Phase 1)
**Goal:** Buka channel distribusi B2B.

- [ ] Model `Partner`, `Voucher`, `Commission` di Prisma
- [ ] Landing page `/mitra`
- [ ] Form pendaftaran + notifikasi WA ke admin
- [ ] Dashboard mitra (auth, stats, generate voucher)
- [ ] Redemption flow voucher di modal bayar
- [ ] Bulk credit purchase untuk Tipe A (via Midtrans)
- [ ] Manual commission payout flow (export + transfer)

**Target awal:** 3–5 mitra institusi (bimbel kenalan), 10–20 affiliate personal.

---

### Phase 3 — Dashboard Sekolah (4–6 minggu setelah Phase 2)
**Goal:** Recurring revenue dari institusi.

- [ ] Model `School`, `SchoolClass`, `SurveyStudent`, `SchoolUser`
- [ ] Landing page `/sekolah`
- [ ] Form pendaftaran sekolah + approval admin
- [ ] Auth sekolah (email + password, role-based)
- [ ] Input kode sekolah di form survei + consent checkbox
- [ ] Dashboard overview (sebaran rumpun, daftar siswa)
- [ ] Filter per kelas
- [ ] Export CSV
- [ ] Analytics halaman (bar chart per kelas)
- [ ] Billing: paket starter/growth/pesantren (manual invoice dulu, Midtrans subscription next)

**Target awal:** 2–3 sekolah pilot (SDIT mitra atau kenalan), trial berbayar 1 bulan dengan harga diskon.

---

### Phase 4 — Optimasi & Scale (ongoing)
- Otomasi komisi affiliate (transfer otomatis via Midtrans disbursement)
- Midtrans subscription untuk billing sekolah bulanan
- Bulk WhatsApp reminder untuk sekolah
- PDF per kelas (summary all students)
- API sekolah untuk integrasi SIS

---

## Appendix: Pertanyaan Open

1. **Harga final:** Rp 99.000 atau Rp 129.000? Saran: mulai Rp 99.000, naik setelah ada 50+ transaksi.
2. **Midtrans vs Xendit:** Midtrans lebih dikenal di Indonesia, Xendit API lebih bersih. Keduanya support QRIS. Pilih Midtrans karena familiar di target market.
3. **Consent sekolah:** Apakah perlu tanda tangan digital (e-meterai) untuk compliance? Untuk MVP, checkbox + timestamp cukup.
4. **NPSN validasi:** Sekolah harus punya NPSN valid? Cek via API Kemdikbud jika diperlukan legitimasi.
5. **Multi-laporan per anak:** Orang tua isi survei 2x (anak yang sama). Bayar 2x? Ya — setiap survei adalah satu laporan. Pertimbangkan diskon isi ulang (Rp 49.000) sebagai retensi.

---

## 8. Fitur Pemilik Bisnis (Owner Dashboard)

### 8.1 Konteks
Pemilik bisnis membutuhkan visibilitas penuh atas operasional, keuangan, dan tumbuh kembang platform — tanpa harus masuk ke database langsung. Owner dashboard diakses via URL tersembunyi + `ADMIN_SECRET` (bukan halaman publik).

---

### 8.2 Ringkasan Bisnis (Home)

**Tujuan:** Satu halaman yang menjawab "bisnis ini sehat atau tidak hari ini?"

**Metrik yang ditampilkan:**
- Total survei selesai (all-time, bulan ini, 7 hari terakhir)
- Estimasi pendapatan (jumlah survei × Rp 99.000)
- Total voucher aktif / terpakai / kedaluwarsa
- Jumlah mitra aktif dan total komisi yang belum dibayar
- Jumlah sekolah aktif dan total siswa terhubung
- Grafik tren survei harian (30 hari terakhir)

---

### 8.3 Manajemen Voucher

**Tujuan:** Kontrol penuh atas stok dan distribusi voucher.

**Fitur:**
- Generate voucher batch (jumlah, kuota per kode, tanggal kedaluwarsa, prefix)
- Lihat daftar semua voucher: status (aktif/terpakai/expired), siapa yang pakai, kapan
- Nonaktifkan voucher tertentu (misal: kode yang beredar salah)
- Filter per: status, mitra, tanggal buat, tanggal expire
- Export CSV daftar voucher

---

### 8.4 Manajemen Mitra

**Tujuan:** Proses pendaftaran mitra, pantau aktivitas, bayar komisi.

**Fitur:**
- Daftar mitra: status (pending/aktif/nonaktif), tipe (afiliasi/institusi), tanggal daftar
- Approve mitra baru + set password awal
- Lihat laporan dan voucher yang dihasilkan per mitra
- Lihat komisi: total, pending, sudah dibayar
- Tandai komisi sebagai "sudah dibayar" (setelah transfer manual)
- Nonaktifkan mitra
- Filter & cari per nama, email, institusi

---

### 8.5 Manajemen Sekolah

**Tujuan:** Onboard sekolah baru, pantau penggunaan, kendalikan akses.

**Fitur:**
- Daftar sekolah: status (pending/aktif), paket, jumlah siswa, kota
- Aktivasi sekolah baru + set password admin sekolah
- Lihat detail: kode sekolah, kelas, jumlah siswa sudah survei
- Ganti paket sekolah (basic/pro/enterprise) + student cap
- Nonaktifkan sekolah
- Filter per: kota, paket, status

---

### 8.6 Daftar Semua Survei

**Tujuan:** Audit dan troubleshooting data survei.

**Fitur:**
- Tabel semua survei: nama anak, nama orang tua, tanggal, persona dominan, asal (direct/mitra/sekolah)
- Klik baris → buka halaman `/results/:id` (via token admin, bypass auth normal)
- Filter per: tanggal, mitra, sekolah, persona
- Export CSV (tanpa nomor HP — hanya nama + persona + tanggal untuk keamanan data)
- Tandai survei untuk ditinjau / hapus jika ada data palsu

---

### 8.7 Keuangan & Payout

**Tujuan:** Rekonsiliasi pendapatan dan pembayaran komisi.

**Fitur:**
- Ringkasan: gross revenue (estimasi), total komisi terhutang, net revenue
- Daftar permintaan payout dari mitra (nama, jumlah, tanggal request)
- Tombol "Tandai Lunas" per request → ubah status Commission menjadi `paid`, catat `paidAt`
- Histori payout yang sudah dibayar

---

### 8.8 Pengaturan Platform

**Tujuan:** Konfigurasi operasional tanpa perlu deploy ulang.

**Fitur:**
- Ubah harga voucher (tersimpan di DB, dibaca server saat generate voucher)
- Ubah nomor WA admin (saat ini dari env var, pertimbangkan pindah ke DB)
- Ubah teks notifikasi WA (template pesan yang dikirim ke orang tua)
- Toggle fitur: aktifkan/nonaktifkan mitra baru, nonaktifkan pendaftaran sekolah baru
- DEMO_RESULT_ID: ubah contoh laporan yang tampil di `/contoh-laporan-lengkap`

---

### 8.9 Keamanan Owner Dashboard

- URL: `/owner` atau `/admin` — tidak dilink dari manapun di situs publik
- Auth: header `Authorization: Bearer ADMIN_SECRET` **atau** session cookie khusus owner (lebih ergonomis untuk penggunaan harian)
- Semua aksi write (approve, payout, nonaktifkan) dicatat di audit log (tabel `AdminLog`: action, targetType, targetId, timestamp)
- Rate limit ketat: 10 req/menit per IP pada semua endpoint `/api/admin/`

---

### 8.10 Implementasi (Roadmap)

| Prioritas | Fitur | Estimasi |
|---|---|---|
| P1 | Ringkasan bisnis (metrik + grafik tren) | 1 hari |
| P1 | Manajemen voucher (generate + daftar + nonaktifkan) | 0.5 hari |
| P1 | Daftar mitra + approve + komisi lunas | 1 hari |
| P2 | Daftar sekolah + aktivasi + ganti paket | 1 hari |
| P2 | Daftar semua survei + export CSV | 0.5 hari |
| P2 | Keuangan & payout summary | 0.5 hari |
| P3 | Pengaturan platform (harga, template WA) | 1 hari |
| P3 | Audit log | 0.5 hari |

**Tech stack:** Nuxt pages di `/pages/owner/` dengan middleware `owner-auth`, semua data dari endpoint `/api/admin/` yang sudah ada + endpoint baru. Chart via ApexCharts (sudah terinstall).
