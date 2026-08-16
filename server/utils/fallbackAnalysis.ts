export function fallbackAnalysis(
  scores: Record<string, number>,
  orderedHasab: string[],
  naturalResponses: string[]
) {
  const top = orderedHasab[0]
  const top2 = orderedHasab.slice(0, 2).sort().join('+')

  const personas: Record<string, { label: string; description: string }> = {
    'amali+ilmi+asyiha': {
      label: 'The Innovator Leader',
      description: 'Kombinasi eksekusi teknis, daya kritis, dan pengaruh sosial. Anak ini cocok dikembangkan ke arah technopreneur, product leader, atau robotics/AI.',
    },
    'ilmi+wajdan+asyiha': {
      label: 'The Visionary Curator',
      description: 'Kombinasi kecerdasan, estetika, dan empati sosial. Potensi kuat di bidang UI/UX, arsitektur, creative direction, atau kuratorial.',
    },
    'ilmi+wajdan': {
      label: 'The Wise Thinker',
      description: 'Kecerdasan yang dipadukan dengan kedalaman rasa dan spiritual. Berpotensi menjadi psikolog, konselor, penulis, atau cendekiawan.',
    },
    'amali+wajdan': {
      label: 'The Ethical Creator',
      description: 'Keterampilan praktis bertemu dengan rasa dan estetika. Berpotensi menjadi social entrepreneur, artisan, atau desainer produk berdampak sosial.',
    },
  }

  const persona = personas[top2] || {
    label: `The ${capitalize(top)} Profile`,
    description: `Rumpun ${top} menjadi kekuatan dominan. Kembangkan melalui aktivitas yang sesuai dengan karakteristik ${top}.`,
  }

  return {
    personaLabel: persona.label,
    personaDescription: persona.description,
    scoreNarrative: `Skor tertinggi ada pada rumpun ${top}. Hasab ini mencerminkan warisan karakter keluarga yang paling kuat dan menjadi landasan utama pengembangan anak.`,
    parentNotes: `Dorong anak melalui aktivitas yang memperkuat ${top}. Hindari memaksakan pola belajar yang tidak sesuai dengan kecenderungan alaminya.`,
    microdosingPlan: {
      title: `Rencana Stimulasi ${persona.label}`,
      schedule: [
        { day: 'Sabtu Pagi', activity: `Aktivitas menyenangkan berbasis ${top} (30-60 menit)`, durationMinutes: 45 },
        { day: 'Minggu Sore', activity: 'Diskusi ringan atau observasi bersama orang tua', durationMinutes: 30 },
        { day: 'Hari Sekolah', activity: 'Tantangan kecil yang mengasah kekuatan dominan', durationMinutes: 20 },
      ],
    },
  }
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
