CREATE TABLE "otp_codes" (
  "id"         SERIAL PRIMARY KEY,
  "phone"      TEXT NOT NULL,
  "code"       VARCHAR(6) NOT NULL,
  "expires_at" TIMESTAMP(3) NOT NULL,
  "used"       BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "otp_codes_phone_idx" ON "otp_codes"("phone");
