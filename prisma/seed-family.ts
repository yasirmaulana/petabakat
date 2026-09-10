import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

const QUESTIONS = [
  // ── D1: Hasab Ilmi ──────────────────────────────────────────────────────────
  { dimension: 'ilmi', order: 1, code: 'D1_O1', text: 'Figur ini memiliki ketertarikan tinggi pada pendidikan formal, riset, atau membaca literatur ilmiah.' },
  { dimension: 'ilmi', order: 2, code: 'D1_O2', text: 'Figur ini aktif mempelajari, mengamalkan, atau mengajarkan ilmu-ilmu keagamaan secara mendalam.' },
  { dimension: 'ilmi', order: 3, code: 'D1_O3', text: 'Figur ini menonjol dalam kemampuan berhitung, analisis data, atau memecahkan masalah logis.' },
  { dimension: 'ilmi', order: 4, code: 'D1_O4', text: 'Figur ini memiliki ketajaman berpikir strategis, perhitungan bisnis, atau transaksi komersial.' },
  { dimension: 'ilmi', order: 5, code: 'D1_O5', text: 'Figur ini aktif dalam kegiatan kebahasaan, menulis, bersastra, atau berdiskusi pemikiran.' },
  { dimension: 'ilmi', order: 6, code: 'D1_O6', text: 'Figur ini cepat memahami hal-hal baru secara mandiri melalui praktik langsung di lapangan.' },

  // ── D2: Hasab Qiyadah ───────────────────────────────────────────────────────
  { dimension: 'qiyadah', order: 1, code: 'D2_O1', text: 'Figur ini memiliki gambaran masa depan yang jelas dan mampu mengarahkan keluarga/organisasi.' },
  { dimension: 'qiyadah', order: 2, code: 'D2_O2', text: 'Figur ini berani mengambil keputusan sulit di situasi kritis tanpa ragu-ragu.' },
  { dimension: 'qiyadah', order: 3, code: 'D2_O3', text: 'Figur ini menunjukkan ketenangan dan daya tahan mental tinggi saat menghadapi krisis/kesulitan.' },
  { dimension: 'qiyadah', order: 4, code: 'D2_O4', text: 'Figur ini dihormati, didengar perkataannya, dan disegani oleh lingkungan sekitarnya.' },
  { dimension: 'qiyadah', order: 5, code: 'D2_O5', text: 'Figur ini terampil mengendalikan emosi diri serta menyelesaikan konflik secara bijaksana.' },
  { dimension: 'qiyadah', order: 6, code: 'D2_O6', text: 'Figur ini cakap dalam membagi peran, mengayomi anggota, dan menggerakkan orang lain.' },

  // ── D3: Hasab Amali ─────────────────────────────────────────────────────────
  { dimension: 'amali', order: 1, code: 'D3_O1', text: 'Figur ini dikenal sebagai sosok pekerja keras, disiplin, dan pantang menyerah.' },
  { dimension: 'amali', order: 2, code: 'D3_O2', text: 'Figur ini berani membangun usaha sendiri atau menciptakan peluang dari nol.' },
  { dimension: 'amali', order: 3, code: 'D3_O3', text: 'Figur ini terampil menggunakan alat, merawat mesin, atau memahami konstruksi fisik.' },
  { dimension: 'amali', order: 4, code: 'D3_O4', text: 'Figur ini memiliki ketelitian tinggi dalam membuat karya tangan, seni visual, atau kerajinan.' },
  { dimension: 'amali', order: 5, code: 'D3_O5', text: 'Figur ini mengutamakan aksi nyata dan penyelesaian tugas daripada sekadar wacana/teori.' },
  { dimension: 'amali', order: 6, code: 'D3_O6', text: 'Figur ini sangat teratur, rapi, dan menjaga standar kualitas tinggi dalam bekerja.' },

  // ── D4: Hasab Wajdan ────────────────────────────────────────────────────────
  { dimension: 'wajdan', order: 1, code: 'D4_O1', text: 'Figur ini ringan tangan dan royal dalam memberikan bantuan finansial/materi kepada yang membutuhkan.' },
  { dimension: 'wajdan', order: 2, code: 'D4_O2', text: 'Figur ini aktif mengabdi di rumah ibadah, pengajian, atau kegiatan sosial kemasyarakatan.' },
  { dimension: 'wajdan', order: 3, code: 'D4_O3', text: 'Figur ini sering dimintai nasihat dan dipercaya menjadi penengah masalah perselisihan.' },
  { dimension: 'wajdan', order: 4, code: 'D4_O4', text: 'Figur ini sangat ketat menjaga komitmen janji dan kejujuran rezeki.' },
  { dimension: 'wajdan', order: 5, code: 'D4_O5', text: 'Figur ini rajin merawat hubungan kekeluargaan dan menjaga keakraban dengan tetangga.' },
  { dimension: 'wajdan', order: 6, code: 'D4_O6', text: 'Figur ini peka terhadap perasaan orang lain dan selalu siap mendengarkan keluh kesah.' },

  // ── D5: Hasab Tarbiyah ──────────────────────────────────────────────────────
  { dimension: 'tarbiyah', order: 1, code: 'D5_O1', text: 'Figur ini terbiasa mengajak anak berdiskusi dan menghargai pendapat/sudut pandang anak.' },
  { dimension: 'tarbiyah', order: 2, code: 'D5_O2', text: 'Figur ini memfasilitasi dan memberi kebebasan anak untuk mencoba berbagai macam hobi/minat.' },
  { dimension: 'tarbiyah', order: 3, code: 'D5_O3', text: 'Figur ini mendidik anak lebih banyak melalui contoh perilaku nyata dibanding teguran lisan.' },
  { dimension: 'tarbiyah', order: 4, code: 'D5_O4', text: 'Figur ini sering mengekspresikan rasa sayang, pujian, dan pelukan secara terbuka.' },
  { dimension: 'tarbiyah', order: 5, code: 'D5_O5', text: 'Figur ini menerapkan aturan rumah yang konsisten, jelas, dan membangun ketertiban.' },
  { dimension: 'tarbiyah', order: 6, code: 'D5_O6', text: 'Figur ini lebih menghargai usaha dan proses belajar anak daripada sekadar hasil akhir/nilai.' },
]

async function main() {
  console.log('Seeding FamilyQuestion...')
  const result = await prisma.familyQuestion.createMany({
    data: QUESTIONS,
    skipDuplicates: true,
  })
  console.log(`✓ ${result.count} soal keluarga di-seed (${QUESTIONS.length - result.count} skipped karena duplikat)`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
