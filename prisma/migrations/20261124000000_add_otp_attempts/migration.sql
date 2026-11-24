-- Batasi percobaan verifikasi per kode OTP (anti brute-force)
ALTER TABLE "otp_codes" ADD COLUMN "attempts" INTEGER NOT NULL DEFAULT 0;
