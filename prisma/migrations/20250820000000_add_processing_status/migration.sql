BEGIN;

-- Survey status becomes more explicit: in_progress / processing / completed
ALTER TABLE "surveys"
  ADD COLUMN IF NOT EXISTS "status" VARCHAR(20) NOT NULL DEFAULT 'completed';

-- Existing rows were previously completed, normalize them.
UPDATE "surveys" SET "status" = 'completed' WHERE "status" IS NULL;

CREATE INDEX IF NOT EXISTS "idx_surveys_status" ON "surveys"("status");

-- Ensure publicId lookup is efficient for result/pdf endpoints.
CREATE UNIQUE INDEX IF NOT EXISTS "idx_surveys_public_id_unique" ON "surveys"("public_id");

COMMIT;
