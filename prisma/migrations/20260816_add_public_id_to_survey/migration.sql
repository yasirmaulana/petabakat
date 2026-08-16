-- Add public_id column with uuid default, backfill existing rows, then set NOT NULL + UNIQUE
ALTER TABLE "surveys" ADD COLUMN "public_id" TEXT;
UPDATE "surveys" SET "public_id" = gen_random_uuid()::TEXT WHERE "public_id" IS NULL;
ALTER TABLE "surveys" ALTER COLUMN "public_id" SET NOT NULL;
CREATE UNIQUE INDEX "surveys_public_id_key" ON "surveys"("public_id");
