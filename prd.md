# Product Requirement Document (PRD)
## Aplikasi Survey Potensi Anak Berbasis Nasab & Hasab

---

## 1. Ringkasan Eksekutif & Latar Belakang

### 1.1 Latar Belakang
Pengembangan potensi anak yang efektif memerlukan pemahaman mendalam tidak hanya terhadap bakat minat anak secara terisolasi, melainkan juga modal sosial, intelektual, etos kerja, serta kedalaman spiritual/rasa yang diwariskan oleh keluarga besar (3 generasi: kakek-nenek, orang tua). Konsep Islam mengenai **Nasab** (garis keturunan sah) dan **Hasab** (rekam jejak kemuliaan, akhlak, reputasi, dan pencapaian keluarga) memberikan fondasi komprehensif untuk memetakan potensi anak secara seimbang antara *nature* dan *nurture*.

Aplikasi **Survey Potensi Anak Berbasis Nasab & Hasab** dirancang sebagai platform web interaktif berbasis survei mandiri untuk membantu orang tua mengidentifikasi rumpun kecerdasan dominan keluarga, menggabungkannya dengan respon alami anak, serta menghasilkan peta potensi emas dan rancangan simulasi aktivitas mingguan (*Micro-Dosing*).

### 1.2 Tujuan Produk
* **Kemudahan Akses:** Menyediakan alat asesmen mandiri interaktif berbasis web yang ramah pengguna (terutama pada perangkat seluler).
* **Pemetaan Akurat:** Menghitung skor kuantitafid dari 4 rumpun Hasab (*Asyiha, Ilmi, Amali, Wajdan*) dan memformulasikan persona potensi anak secara kualitatif.
* **Aksi Nyata:** Memberikan rekomendasi rutin mingguan (*micro-dosing*) yang ramah anak dan mudah diterapkan.
* **Kemudahan Retensi Data:** Memfasilitasi ekspor laporan analisis lengkap dalam format PDF dan fitur pencarian riwayat hasil survei berbasis nomor WhatsApp / HP.

---

## 2. Target Pengguna (User Persona)

1. **Orang Tua / Pasangan Muda**
   * Memiliki anak usia tumbuh kembang (3–15 tahun).
   * Membutuhkan panduan mendidik anak yang selaras dengan nilai Islam dan praktis diterapkan.
   * Preferensi akses lewat perangkat *mobile* (smartphone).
2. **Educator / Konselor Keluarga Islam**
   * Menggunakan aplikasi sebagai alat bantu analisis awal minat dan bakat santri/siswa berbasis latar belakang keluarga.

---

## 3. Arsitektur Modul & Peta Jalan Fase (Mindmap Mapping)

Berdasarkan rancangan struktur sistem, aplikasi dibagi menjadi **5 Fase Utama**:

```
Survey Potensi Anak
├── FASE 1: Beranda (Landing Page)
│   ├── Sambutan & Edukasi Singkat
│   ├── Contoh Hasil Analisis
│   └── Tombol Mulai (CTA)
├── FASE 2: Isi Survey (Input & Assessment)
│   ├── Data Anak & Orang Tua
│   ├── Pertanyaan Nasab (Garis Keturunan & Mahram)
│   └── Pertanyaan Hasab (4 Rumpun: Asyiha, Ilmi, Amali, Wajdan)
├── FASE 2: Hasil & Kesimpulan (Analysis Engine)
│   ├── Hitung Skor (Radar Chart & Persentase Rumpun)
│   ├── Formula Pribadi (Persilangan Hasab + Respon Alami Anak)
│   └── Kesimpulan Potensi & Panduan Micro-Dosing
├── FASE 3: Unduh PDF & Notifikasi
│   ├── Input Nomor HP / WhatsApp Tujuan
│   ├── Kirim Link PDF via WA / Portal
│   └── Unduh & Simpan PDF Report
└── FASE 4: Cek Ulang (Lookup & History)
    ├── Cari Hasil via Nomor HP
    ├── Riwayat Hasil Assessment
    └── Lihat Detail Hasil Lama
```

---

## 4. Spesifikasi Detail Fitur & Kebutuhan Fungsional

### FASE 1: Beranda (Landing Page)
* **1.1 Sambutan & Hero Section**
  * Judul utama dan narasi pengantar mengenai urgensi memetakan potensi anak dari akar Nasab dan Hasab keluarga.
  * *Call to Action* (CTA) intuitif: `"Mulai Survey Potensi Anak"`.
* **1.2 Contoh Hasil (Interactive Demo / Sample)**
  * Menampilkan cuplikan visualisasi grafik radar dan sampel laporan persona (misal: *"The Innovator Leader"* / *"The Visionary Curator"*).
  * Menjelaskan 4 rumpun Hasab secara ringkas:
    1. **Hasab Al-Asyiha** (Kepemimpinan & Sosial)
    2. **Hasab Al-Ilmi** (Intelektual & Logika)
    3. **Hasab Al-Amali** (Teknis, Bisnis & Eksekusi)
    4. **Hasab Al-Wajdan** (Estetika, Rasa & Spiritual)
* **1.3 Tombol Mulai**
  * Mengarahkan pengguna langsung ke *wizard form* Fase 2.

---

### FASE 2A: Isi Survey (Input & Assessment)
* **2.1 Form Data Anak & Orang Tua**
  * Input Nama Orang Tua / Wali.
  * Input Nomor HP / WhatsApp (sebagai kunci unik identifikasi & pengiriman laporan).
  * Input Nama Anak, Usia/Tanggal Lahir, dan Jenis Kelamin.
  * Input Respon Alami / Minat Dominan Anak saat ini (Pilihan ganda + opsi teks bebas: *Suka bongkar barang, suka menggambar, kritis bertanya, supel bergaul, dll.*).
* **2.2 Pertanyaan Nasab**
  * Pertanyaan verifikasi ketaatan dan kejelasan garis keturunan (pernikahan sah, perwalian, kepatuhan batas mahram) untuk memberikan pemahaman nilai dasar keluarga.
* **2.3 Pertanyaan Hasab (Kuesioner 20 Indikator)**
  * Format penilaian: **Skala Likert 1-5** (1: Sangat Jarang / Tidak Mirip, 5: Sangat Sering / Ciri Utama Keluarga).
  * Terdiri dari 4 Kelompok Pertanyaan (masing-masing 5 indikator):
    * **Kelompok I (Asyiha - Sosial & Kepemimpinan):** Kepemimpinan organisasi, rumah jadi tempat musyawarah, supel/komunikatif, penengah konflik, reputasi bersih.
    * **Kelompok II (Ilmi - Intelektual & Keilmuan):** Koleksi buku/kitab, profesi mengajar, topik obrolan berita/sains/agama, logika & data kritis, kebiasaan riset/belajar.
    * **Kelompok III (Amali - Bisnis & Teknis):** Mental bisnis/entrepreneur, etos kerja fisik/gesit, Keterampilan tangan (*craftsmanship*), merintis dari nol, fokus solusi praktis.
    * **Kelompok IV (Wajdan - Seni & Spiritual):** Kepekaan estetika/seni, empati tinggi/suka membantu, ibadah istikamah & sunyi, menjaga perasaan orang lain, intuisi/konseling batin.

---

### FASE 2B: Hasil & Kesimpulan (Engine & Dashboard)
* **2.4 Hitung Skor (Calculation Engine)**
  * Menghitung total poin per rumpun (Maksimal 25 poin per rumpun).
  * Mengonversi skor menjadi persentase relatif ($	ext{Skor Rumpun} / 	ext{Total Skor All Rumpun} 	imes 100\%$).
  * Menampilkan **Radar Chart / Spider Chart** interaktif menggunakan library chart UI.
* **2.5 Formula Pribadi (Matching Algorithm)**
  * Menggabungkan Rumpun Hasab Dominan Keluarga dengan Respon Alami Anak.
  * *Formula Applied:* `[Hasab Dominan] + [Katalis Respon Alami] = [Persona Potensi Anak]`.
* **2.6 Kesimpulan Potensi & Panduan Micro-Dosing**
  * Menampilkan Label Persona (contoh: *The Innovator Leader*, *The Visionary Curator*, *The Ethical Creator*, *The Strategic Analyst*).
  * **Rencana Aktivitas Mingguan (Micro-Dosing):** Jadwal stimulasi rutin (Sabtu Pagi, Minggu Sore, Hari Sekolah) durasi 30-60 menit yang disesuaikan dengan persona anak.

---

### FASE 3: Unduh PDF & Notifikasi
* **3.1 Input Nomor HP Tujuan**
  * Konfirmasi nomor WhatsApp untuk penerimaan tautan hasil laporan.
* **3.2 Generator PDF & Link Distribution**
  * Sistem memicu layanan pembuat dokumen PDF (*HTML-to-PDF/WeasyPrint*) berbasis template laporan resmi.
  * Mengirimkan pesan/notifikasi otomatis berisi link akses PDF ke nomor WhatsApp pengguna.
* **3.3 Unduh & Simpan PDF**
  * Tombol unduh langsung (*Direct Download*) file PDF laporan analisis berdesain profesional.

---

### FASE 4: Cek Ulang (Lookup & History)
* **4.1 Cari via Nomor HP**
  * Form pencarian riwayat survei hanya dengan memasukkan nomor HP / WhatsApp yang terdaftar.
  * Fitur OTP / Verifikasi singkat via WA (opsional untuk keamanan data).
* **4.2 Riwayat Hasil Assessment**
  * Menampilkan daftar anak / survei yang pernah dilakukan oleh nomor HP tersebut beserta tanggal pengisian.
* **4.3 Lihat Detail Hasil Lama**
  * Orang tua dapat membuka kembali dashboard hasil analisis lengkap serta mengunduh ulang PDF laporan kapan saja tanpa perlu mengisi ulang survei.

---

## 5. Algoritma Kalkulasi & Aturan Bisnis (Business Rules)

### 5.1 Perhitungan Hasab (Deterministik)

**Skor Rumpun X** = Σ (Nilai Indikator 1..5) → Maksimal 25 poin per rumpun.

**Persentase Rumpun X** = (Skor Rumpun X / Total Skor 4 Rumpun) × 100%

Perhitungan skor dan persentase tetap dilakukan secara deterministik (rumus pasti) di backend untuk menjamin konsistensi dan kecepatan.

### 5.2 Analisis & Identifikasi Potensi via AI Model

Setelah skor dihitung, data dikirim ke **AI Language Model** (Claude API) untuk menghasilkan analisis mendalam yang tidak bisa dicapai dengan rule matrix statis.

#### 5.2.1 Konteks yang Diberikan ke AI (System Prompt)
AI model diberikan konteks penuh tentang framework Nasab-Hasab sebagai fondasi analisis, meliputi:
* Definisi dan filosofi 4 rumpun Hasab (Asyiha, Ilmi, Amali, Wajdan) beserta indikator-indikatornya.
* Konsep Nasab (garis keturunan) dan Hasab (rekam jejak kemuliaan keluarga) dalam perspektif Islam.
* Prinsip persilangan *nature* (respon alami anak) dan *nurture* (warisan karakter keluarga).
* Referensi persona dan pola kombinasi rumpun sebagai panduan (bukan rule kaku).
* Panduan nada bahasa: hangat, memberdayakan orang tua, berbasis nilai Islam, praktis.

#### 5.2.2 Data Input ke AI (User Prompt per Anak)
Setiap request analisis mengirimkan:
* Skor & persentase 4 rumpun Hasab.
* Urutan rumpun dari dominan ke lemah.
* Jawaban nasab (konteks nilai dasar keluarga).
* Respon alami / minat dominan anak saat ini.
* Usia dan jenis kelamin anak.

#### 5.2.3 Output yang Dihasilkan AI (Structured JSON)
AI menghasilkan output terstruktur (JSON) berisi:

1. **Narasi Penjelasan Skor:**
   * Interpretasi makna skor tiap rumpun dalam konteks keluarga tersebut.
   * Penjelasan mengapa rumpun tertentu dominan dan apa artinya bagi pola asuh.
   * Hubungan antar rumpun (misal: Ilmi tinggi + Wajdan tinggi = potensi cendekiawan reflektif).

2. **Identifikasi Persona Potensi Anak:**
   * Label persona yang kontekstual (bukan template statis — AI mempertimbangkan kombinasi unik skor + respon alami anak).
   * Deskripsi persona yang personal dan spesifik untuk anak tersebut.
   * Potensi jalur karir/peran masa depan yang relevan.

3. **Rencana Micro-Dosing (Aktivitas Mingguan):**
   * Jadwal stimulasi rutin (Sabtu Pagi, Minggu Sore, Hari Sekolah) yang disesuaikan dengan persona dan usia anak.
   * Aktivitas konkret, durasi 30-60 menit, ramah anak.

4. **Catatan untuk Orang Tua:**
   * Saran pola asuh spesifik berdasarkan profil keluarga.
   * Hal yang perlu dihindari dan didorong.

#### 5.2.4 Fallback: Pemetaan Statis (jika AI Tidak Tersedia)
Jika AI model tidak tersedia (downtime / quota habis), sistem *fallback* ke **rule matrix statis**:
* **Amali + Ilmi + Asyiha** → **The Innovator Leader** (Technopreneur, Product Manager, Robotics/AI).
* **Wajdan + Ilmi + Asyiha** → **The Visionary Curator** (UI/UX Designer, Arsitek, Creative Director).
* **Wajdan + Ilmi** → **The Wise Thinker** (Psikolog, Konselor, Penulis, Cendekiawan).
* **Amali + Wajdan** → **The Ethical Creator / Social Entrepreneur**.

Template micro-dosing dan deskripsi persona statis juga disediakan sebagai fallback. Hasil AI di-cache per `survey_id` di tabel `survey_results` agar tidak perlu re-generate saat user membuka ulang hasil.
---

## 6. Kebutuhan Non-Fungsional (Non-Functional Requirements)

1. **Performa & Aksesibilitas:**
   * Tampilan *Mobile-First Responsive Design* (optimasi untuk pengguna ponsel).
   * Waktu muat halaman (*load time*) $< 2$ detik.
2. **Keamanan & Privasi Data:**
   * Nomor HP dan data anak disimpan secara aman (enkripsi data sensitif).
   * Pembatasan pencarian riwayat berbasis verifikasi nomor telepon.
3. **Desain & UI/UX:**
   * Nuansa warna: Warm, Trustworthy, Islami Modern (Muted Green, Gold Accent, Cream Background).
   * Antarmuka bersih tanpa gangguan iklan/distraksi.

---

## 7. Rekomendasi Tech Stack

* **Fullstack Framework:** Nuxt 3 (Vue 3 + Nitro Server Engine) — satu codebase untuk frontend SSR/SSG dan backend API (`/server/api/`).
* **Styling:** Tailwind CSS.
* **Visualisasi:** Chart.js / ApexCharts (Radar Chart).
* **Database:** PostgreSQL / MySQL via Prisma / Drizzle ORM.
* **AI Model:** Claude API (Anthropic) untuk analisis potensi anak & generasi narasi personal.
* **PDF Generator:** Puppeteer / jsPDF (HTML to PDF, dijalankan di Nitro server route).
* **Integration:** WhatsApp Gateway API (Fonnte / Wablas / Twilio) untuk pengiriman link PDF laporan.

> **Catatan:** Nuxt 3 dengan Nitro engine sudah mencukupi sebagai fullstack solution untuk scope aplikasi ini. Backend terpisah (Laravel/Express) tidak diperlukan. Jika ke depan dibutuhkan background job berat (queue, cron scheduling massal), dapat ditambahkan worker terpisah (BullMQ + Redis).

---
*Dokumen PRD ini disusun berdasarkan kombinasi konsep Naskah Filosofis Nasab-Hasab dan Diagram Alur Perencanaan Aplikasi Survey Potensi Anak.*