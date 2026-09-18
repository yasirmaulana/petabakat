-- Migration: normalisasi skor anak dari skala 0–6 ke 0–100
-- Jalankan SEKALI pada data lama sebelum deploy kode baru.
--
-- Skor lama: raw count centang (0–6)
-- Skor baru: (count / 6) × 100, dibulatkan
--
-- AMAN dijalankan ulang: UPDATE hanya menyentuh baris dengan skor ≤ 6
-- (skor ≥ 7 berarti sudah dinormalisasi, tidak perlu disentuh)

BEGIN;

UPDATE survey_results
SET
  score_asyiha = ROUND(LEAST(score_asyiha, 6)::numeric / 6 * 100),
  score_ilmi   = ROUND(LEAST(score_ilmi,   6)::numeric / 6 * 100),
  score_amali  = ROUND(LEAST(score_amali,  6)::numeric / 6 * 100),
  score_wajdan = ROUND(LEAST(score_wajdan, 6)::numeric / 6 * 100)
WHERE
  -- Hanya baris lama (skor max 6, belum dinormalisasi)
  GREATEST(score_asyiha, score_ilmi, score_amali, score_wajdan) <= 6;

-- Skor keluarga: dari skala 0–25 ke 0–100
-- Normalisasi lama pakai NORMALIZED_MAX=25, baru pakai 100
UPDATE family_results
SET
  score_ilmi     = ROUND(score_ilmi    / 25 * 100),
  score_qiyadah  = ROUND(score_qiyadah / 25 * 100),
  score_amali    = ROUND(score_amali   / 25 * 100),
  score_wajdan   = ROUND(score_wajdan  / 25 * 100),
  score_tarbiyah = ROUND(score_tarbiyah / 25 * 100)
WHERE
  -- Hanya baris lama (skor max ~25, belum dinormalisasi ke 100)
  GREATEST(score_ilmi, score_qiyadah, score_amali, score_wajdan, score_tarbiyah) <= 25;

COMMIT;
