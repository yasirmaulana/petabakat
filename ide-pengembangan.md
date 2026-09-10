# PRD: Module Pendataan Hasab Keluarga & Fit-Gap Minat Anak

---

## 1. Document Overview

**Product Name**: Module Hasab Keluarga (PetaMinatBakat / HasabBakat)  
**Version**: 1.1  
**Target Audience**: Parent (B2C), School Counselor / Mentor (B2B)  
**Objective**: Data kolektif rekam jejak (*Hasab*) figur kunci keluarga menggunakan skala Likert deterministik untuk diukur keselarasaannya (*fit-gap*) dengan Minat Anak.

---

## 2. Core Concept & Methodology

### Core Hypothesis
$$Fit\ Ratio = \text{Minat Anak} \cap \text{Hasab Keluarga}$$
Potensi anak mencapai tingkat optimal ketika kecenderungan minat alaminya (*Nature*) ditopang oleh ekosistem rekam jejak, keteladanan, dan kapasitas keilmuan/pengasuhan keluarga (*Nurture/Hasab*).

### Profil Figur yang Didata (Per Responden Anak)
1. Kakek (Pihak Bapak)
2. Nenek (Pihak Bapak)
3. Kakek (Pihak Ibu)
4. Nenek (Pihak Ibu)
5. Bapak
6. Ibu

---

## 3. Scoring Architecture & Deterministic Logic

Setiap profil figur menilai **5 Dimensi Hasab Utama**. Setiap dimensi diukur menggunakan **Skala Likert 5 Tingkat (1–5)**:
* `1`: Sangat Tidak Setuju
* `2`: Tidak Setuju
* `3`: Ragu-ragu / Netral
* `4`: Setuju
* `5`: Sangat Setuju

### Dimensi Hasab (5 Dimensi Utama)

D1: Hasab Ilmi     (Pendidikan, Tradisi Berpikir, & Logika)
D2: Hasab Qiyadah  (Kepemimpinan, Ketahanan Mental, & Ketegasan)
D3: Hasab Amali    (Etos Kerja, Eksekusi, & Kemandirian)
D4: Hasab Wajdan   (Nilai Moral, Empati, & Spiritual)
D5: Hasab Nurture  (Gaya Pengasuhan & Atmosfer Eksplorasi)

### Algoritma Kalkulasi Pertambahan (Deterministik)

Let $F = \{F_1, F_2, F_3, F_4, F_5, F_6\}$ be the set of 6 family profile figures.  
Let $D_k$ be the Hasab Dimension where $k \in \{1, 2, 3, 4, 5\}$.  
Let $S(F_i, D_k) \in \{1, 2, 3, 4, 5\}$ be the Likert score given for figure $F_i$ on dimension $D_k$.

#### 1. Aggregate Score per Dimension
Total akumulasi skor untuk setiap dimensi $D_k$:
$$TotalScore(D_k) = \sum_{i=1}^{6} S(F_i, D_k)$$
*(Range Skor Min: 6, Max: 30 per dimensi)*

#### 2. Top-3 Hasab Extraction
Urutkan $TotalScore(D_k)$ secara *descending*. 
$$TopHasab = [D_{first}, D_{second}, D_{third}]$$

*Handling Ties (Nilai Sama)*: Jika terjadi skor berimbang pada batas Top-3, gunakan pembobotan prioritas figur (Bapak/Ibu memiliki bobot multiplier $1.2\times$ dibanding Kakek/Nenek) untuk menentukan peringkat secara deterministik.

---

## 4. Full Questionnaire Structure (Daftar Pertanyaan per Figur)

Setiap figur dari ke-6 profil keluarga akan dinilai menggunakan **30 butir opsi pertanyaan** (6 butir per dimensi) berikut. Responden memberikan nilai Likert `1 - 5` pada setiap opsi pertanyaan.

### A. Dimensi 1: Hasab Ilmi (Tradisi Berpikir & Keilmuan)
1. **D1_O1 (Akademisi/Riset):** Figur ini memiliki ketertarikan tinggi pada pendidikan formal, riset, atau membaca literatur ilmiah.
2. **D1_O2 (Keilmuan Agama):** Figur ini aktif mempelajari, mengamalkan, atau mengajarkan ilmu-ilmu keagamaan secara mendalam.
3. **D1_O3 (Logika & Hitungan):** Figur ini menonjol dalam kemampuan berhitung, analisis data, atau memecahkan masalah logis.
4. **D1_O4 (Strategi & Bisnis):** Figur ini memiliki ketajaman berpikir strategis, perhitungan bisnis, atau transaksi komersial.
5. **D1_O5 (Sastra & Literasi):** Figur ini aktif dalam kegiatan kebahasaan, menulis, bersastra, atau berdiskusi pemikiran.
6. **D1_O6 (Pemahaman Praktis/Otodidak):** Figur ini cepat memahami hal-hal baru secara mandiri melalui praktik langsung di lapangan.

---

### B. Dimensi 2: Hasab Qiyadah (Kepemimpinan & Ketahanan Mental)
1. **D2_O1 (Visioner & Arah):** Figur ini memiliki gambaran masa depan yang jelas dan mampu mengarahkan keluarga/organisasi.
2. **D2_O2 (Keberanian & Ketegasan):** Figur ini berani mengambil keputusan sulit di situasi kritis tanpa ragu-ragu.
3. **D2_O3 (Tahan Banting/Resiliensi):** Figur ini menunjukkan ketenangan dan daya tahan mental tinggi saat menghadapi krisis/kesulitan.
4. **D2_O4 (Kewibawaan & Pengaruh):** Figur ini dihormati, didengar perkataannya, dan disegani oleh lingkungan sekitarnya.
5. **D2_O5 (Manajemen Konflik):** Figur ini terampil mengendalikan emosi diri serta menyelesaikan konflik secara bijaksana.
6. **D2_O6 (Pengorganisasian Team):** Figur ini cakap dalam membagi peran, mengayomi anggota, dan menggerakkan orang lain.

---

### C. Dimensi 3: Hasab Amali (Etos Kerja, Eksekusi, & Kemandirian)
1. **D3_O1 (Etos Kerja Tinggi):** Figur ini dikenal sebagai sosok pekerja keras, disiplin, dan pantang menyerah.
2. **D3_O2 (Kemandirian Wirausaha):** Figur ini berani membangun usaha sendiri atau menciptakan peluang dari nol.
3. **D3_O3 (Keahlian Teknis/Mesin):** Figur ini terampil menggunakan alat, merawat mesin, atau memahami konstruksi fisik.
4. **D3_O4 (Keahlian Tangan/Kreator):** Figur ini memiliki ketelitian tinggi dalam membuat karya tangan, seni visual, atau kerajinan.
5. **D3_O5 (Eksekusi Cepat):** Figur ini mengutamakan aksi nyata dan penyelesaian tugas daripada sekadar wacana/teori.
6. **D3_O6 (Kerapian & Keteraturan):** Figur ini sangat teratur, rapi, dan menjaga standar kualitas tinggi dalam bekerja.

---

### D. Dimensi 4: Hasab Wajdan (Nilai Moral, Empati, & Spiritual)
1. **D4_O1 (Kedermawanan):** Figur ini ringan tangan dan royal dalam memberikan bantuan finansial/materi kepada yang membutuhkan.
2. **D4_O2 (Aktivisme Sosial/Keagamaan):** Figur ini aktif mengabdi di rumah ibadah, pengajian, atau kegiatan sosial kemasyarakatan.
3. **D4_O3 (Penengah & Juru Damai):** Figur ini sering dimintai nasihat dan dipercaya menjadi penengah masalah perselisihan.
4. **D4_O4 (Kejujuran & Integritas):** Figur ini sangat ketat menjaga komitmen janji dan kejujuran rezeki.
5. **D4_O5 (Kehangatan Silaturahmi):** Figur ini rajin merawat hubungan kekeluargaan dan menjaga keakraban dengan tetangga.
6. **D4_O6 (Empati Tinggi):** Figur ini peka terhadap perasaan orang lain dan selalu siap mendengarkan keluh kesah.

---

### E. Dimensi 5: Hasab Nurture (Atmosfer Rumah & Pengasuhan)
1. **D5_O1 (Komunikasi Dialogis):** Figur ini terbiasa mengajak anak berdiskusi dan menghargai pendapat/sudut pandang anak.
2. **D5_O2 (Dukungan Eksplorasi):** Figur ini memfasilitasi dan memberi kebebasan anak untuk mencoba berbagai macam hobi/minat.
3. **D5_O3 (Keteladanan Langsung):** Figur ini mendidik anak lebih banyak melalui contoh perilaku nyata dibanding teguran lisan.
4. **D5_O4 (Kehangatan Emosional):** Figur ini sering mengekspresikan rasa sayang, pujian, dan pelukan secara terbuka.
5. **D5_O5 (Disiplin Terstruktur):** Figur ini menerapkan aturan rumah yang konsisten, jelas, dan membangun ketertiban.
6. **D5_O6 (Apresiasi Proses):** Figur ini lebih menghargai usaha dan proses belajar anak daripada sekadar hasil akhir/nilai.

---

## 5. Fit-Gap Comparison Logic (Hasab vs. Minat Anak)

### Matrix Synergy Rules

+-----------------------------------------------------------------------+
|                         FIT-GAP MATRIX TABLE                          |
+-------------------+--------------------+------------------------------+
| Top Minat Anak    | Dominansi Hasab    | Status & Interpretasi        |
+-------------------+--------------------+------------------------------+
| High Match        | Top-3 Hasab        | OPTIMAL (Sinergi Kuat)       |
| High Match        | Non Top-3 Hasab    | STIMULATION NEEDED (Celah)   |
+-------------------+--------------------+------------------------------+

### Actionable Recommendation Mapping

* **Condition A (Optimal Fit):** Minat Dominan Anak selaras dengan Top-3 Hasab Keluarga.
  * *Output Recommendation:* "Ekosistem keluarga mendukung penuh. Ayah/Bunda dan keluarga besar dapat berperan langsung sebagai mentor utama dalam mengasah minat ananda."
* **Condition B (Gap / Need External Facilitator):** Minat Dominan Anak berada di luar Top-3 Hasab Keluarga.
  * *Output Recommendation:* "Minat ananda membutuhkan stimulasi khusus yang belum menjadi budaya utama keluarga. Disarankan menghubungkan ananda dengan mentor luar/ekosistem pendukung yang sesuai."

---

## 6. Functional & UI/UX Requirements

* **Progressive Form:** Pengisian form dipecah per figur (Tabbed / Step Wizard) untuk menghindari kecapekan mental (*survey fatigue*).
* **Auto-Save State:** Menyimpan draf jawaban secara lokal jika pengguna menutup aplikasi secara tidak sengaja.
* **Visual Output:**
  * **Radar Chart 5 Arah:** Menampilkan visualisasi skor akumulasi Hasab Keluarga.
  * **Top 3 Badges:** Tampilan visual 3 pilar kekuatan Hasab utama.
  * **Comparison Card:** Kartu perbandingan Minat Anak vs. Hasab Keluarga beserta rekomendasi pengasuhan.