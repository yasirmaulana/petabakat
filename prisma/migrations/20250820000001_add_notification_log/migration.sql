BEGIN;

CREATE TABLE IF NOT EXISTS "notification_logs" (
    "id" SERIAL NOT NULL,
    "survey_id" INTEGER NOT NULL,
    "channel" VARCHAR(20) NOT NULL,
    "sent_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" VARCHAR(20) NOT NULL DEFAULT 'sent',
    "response" JSONB,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "notification_logs_survey_id_key" ON "notification_logs"("survey_id");

ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_survey_id_fkey"
    FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;
