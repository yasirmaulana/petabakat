import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const connectionString = process.env.DATABASE_URL
const pool = new Pool({ connectionString })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  await prisma.hasabCategory.createMany({
    data: [
      { code: 'asyiha', name: 'Hasab Al-Asyiha', description: 'Kepemimpinan, komunikasi, empati sosial, dan pengaruh positif' },
      { code: 'ilmi', name: 'Hasab Al-Ilmi', description: 'Kecerdasan intelektual, analitis, ingin tahu, dan pencinta ilmu' },
      { code: 'amali', name: 'Hasab Al-Amali', description: 'Teknis, praktis, bisnis, eksekusi, dan keterampilan tangan' },
      { code: 'wajdan', name: 'Hasab Al-Wajdan', description: 'Estetika, rasa, intuisi, spiritual, dan ekspresi diri' },
    ],
    skipDuplicates: true,
  })

  const categories = await prisma.hasabCategory.findMany()
  const findId = (code: string) => categories.find((c) => c.code === code)!.id

  await prisma.question.createMany({
    data: [
      // Asyiha
      { categoryId: findId('asyiha'), order: 1, text: 'Di keluarga besar, ada sosok yang kerap dijadikan panutan dalam kepemimpinan atau mediasi konflik.', type: 'hasab' },
      { categoryId: findId('asyiha'), order: 2, text: 'Anak terlihat nyaman saat berbicara di depan orang banyak atau memimpin permainan kelompok.', type: 'hasab' },
      { categoryId: findId('asyiha'), order: 3, text: 'Dalam keluarga, tradisi saling menjenguk dan membantu tetangga/kerabat masih kuat dijaga.', type: 'hasab' },
      { categoryId: findId('asyiha'), order: 4, text: 'Anak mudah merasakan perasaan orang lain dan menawarkan bantuan.', type: 'hasab' },
      { categoryId: findId('asyiha'), order: 5, text: 'Keluarga memiliki jejak pengabdian sosial atau kegiatan keumatan yang dilakukan bersama.', type: 'hasab' },

      // Ilmi
      { categoryId: findId('ilmi'), order: 1, text: 'Ada anggota keluarga (kakek/nenek/orang tua/paman) yang dikenal sebagai guru, penulis, atau ahli di bidangnya.', type: 'hasab' },
      { categoryId: findId('ilmi'), order: 2, text: 'Anak suka bertanya mendalam tentang sebab-akibat, alam, agama, atau teknologi.', type: 'hasab' },
      { categoryId: findId('ilmi'), order: 3, text: 'Di rumah, diskusi ilmiah/keagamaan atau membaca buku adalah kebiasaan yang ditemui.', type: 'hasab' },
      { categoryId: findId('ilmi'), order: 4, text: 'Anak menikmati teka-teki, eksperimen sederhana, atau menyusun strategi.', type: 'hasab' },
      { categoryId: findId('ilmi'), order: 5, text: 'Keluarga menganggap pendidikan dan ilmu sebagai investasi utama masa depan.', type: 'hasab' },

      // Amali
      { categoryId: findId('amali'), order: 1, text: 'Keluarga memiliki usaha, pekerjaan teknis, atau profesi yang menuntut ketekunan praktis.', type: 'hasab' },
      { categoryId: findId('amali'), order: 2, text: 'Anak senang membuat, merakit, atau memperbaiki benda di sekitarnya.', type: 'hasab' },
      { categoryId: findId('amali'), order: 3, text: 'Anak menunjukkan inisiatif berdagang/jualan sederhana atau mengatur uang jajannya.', type: 'hasab' },
      { categoryId: findId('amali'), order: 4, text: 'Keluarga terbiasa bekerja keras, tepat waktu, dan menyelesaikan tugas sampai tuntas.', type: 'hasab' },
      { categoryId: findId('amali'), order: 5, text: 'Anak lebih suka belajar dengan praktik langsung dibaca teori panjang.', type: 'hasab' },

      // Wajdan
      { categoryId: findId('wajdan'), order: 1, text: 'Ada keluarga yang dikenal berbakat seni, musik, sastra, atau spiritual.', type: 'hasab' },
      { categoryId: findId('wajdan'), order: 2, text: 'Anak sering melamun, menggambar, bercerita, atau menciptakan sesuatu dari imajinasinya.', type: 'hasab' },
      { categoryId: findId('wajdan'), order: 3, text: 'Anak peka terhadap suasana, musik, warna, atau ketidakadilan sosial.', type: 'hasab' },
      { categoryId: findId('wajdan'), order: 4, text: 'Keluarga memiliki rutinitas spiritual bersama yang membentuk kedalaman rasa.', type: 'hasab' },
      { categoryId: findId('wajdan'), order: 5, text: 'Anak mengekspresikan perasaan melalui seni, tulisan, atau aktivitas kreatif.', type: 'hasab' },

      // Nasab
      { order: 1, text: 'Apakah garis keturunan anak diketahui dengan jelas sesuai syariat?', type: 'nasab' },
      { order: 2, text: 'Apakah hubungan mahram dan silaturahim dengan keluarga besar tetap terjaga?', type: 'nasab' },
    ],
    skipDuplicates: true,
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
