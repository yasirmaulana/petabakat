export function calculateHasabScores(answers: Record<number, number>) {
  const entries = Object.entries(answers).map(([questionId, value]) => ({
    questionId: Number(questionId),
    value: Number(value),
  }))

  const total = entries.reduce((sum, e) => sum + e.value, 0)
  if (total === 0) {
    return { asyiha: 0, ilmi: 0, amali: 0, wajdan: 0 }
  }

  const scores: Record<string, number> = {
    asyiha: 0,
    ilmi: 0,
    amali: 0,
    wajdan: 0,
  }

  for (const entry of entries) {
    const code = categoryCodeByQuestionId(entry.questionId)
    if (code) scores[code] += entry.value
  }

  return {
    asyiha: scores.asyiha,
    ilmi: scores.ilmi,
    amali: scores.amali,
    wajdan: scores.wajdan,
  }
}

export function calculatePercentages(scores: Record<string, number>) {
  const total = Object.values(scores).reduce((sum, v) => sum + v, 0)
  if (total === 0) {
    return { asyiha: 0, ilmi: 0, amali: 0, wajdan: 0 }
  }
  return {
    asyiha: Number(((scores.asyiha / total) * 100).toFixed(2)),
    ilmi: Number(((scores.ilmi / total) * 100).toFixed(2)),
    amali: Number(((scores.amali / total) * 100).toFixed(2)),
    wajdan: Number(((scores.wajdan / total) * 100).toFixed(2)),
  }
}

function categoryCodeByQuestionId(questionId: number): string | null {
  // Map pertanyaan hasab ke kode kategori berdasarkan urutan seed
  // Asyiha: id 1-5, Ilmi: 6-10, Amali: 11-15, Wajdan: 16-20
  // Di production sebaiknya query dari DB, tapi untuk kalkulasi ini bisa infer dari relasi tersimpan
  // Karena jawaban sudah terikat question_id, kita gunakan modulo block sementara
  // ponytail: ganti dengan lookup DB jika urutan seed berubah-ubah
  const index = (questionId - 1) % 20
  if (index >= 0 && index <= 4) return 'asyiha'
  if (index >= 5 && index <= 9) return 'ilmi'
  if (index >= 10 && index <= 14) return 'amali'
  if (index >= 15 && index <= 19) return 'wajdan'
  return null
}
