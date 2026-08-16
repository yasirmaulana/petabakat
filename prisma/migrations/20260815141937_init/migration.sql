-- CreateTable
CREATE TABLE "parents" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "children" (
    "id" SERIAL NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" VARCHAR(1) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "children_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hasab_categories" (
    "id" SERIAL NOT NULL,
    "code" VARCHAR(20) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "hasab_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "category_id" INTEGER,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "type" VARCHAR(10) NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surveys" (
    "id" SERIAL NOT NULL,
    "child_id" INTEGER NOT NULL,
    "parent_id" INTEGER NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'in_progress',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_answers" (
    "id" SERIAL NOT NULL,
    "survey_id" INTEGER NOT NULL,
    "question_id" INTEGER NOT NULL,
    "value" SMALLINT NOT NULL,

    CONSTRAINT "survey_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "child_natural_responses" (
    "id" SERIAL NOT NULL,
    "survey_id" INTEGER NOT NULL,
    "response_option" VARCHAR(255) NOT NULL,
    "free_text" TEXT,

    CONSTRAINT "child_natural_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_results" (
    "id" SERIAL NOT NULL,
    "survey_id" INTEGER NOT NULL,
    "score_asyiha" SMALLINT NOT NULL,
    "score_ilmi" SMALLINT NOT NULL,
    "score_amali" SMALLINT NOT NULL,
    "score_wajdan" SMALLINT NOT NULL,
    "pct_asyiha" DECIMAL(5,2) NOT NULL,
    "pct_ilmi" DECIMAL(5,2) NOT NULL,
    "pct_amali" DECIMAL(5,2) NOT NULL,
    "pct_wajdan" DECIMAL(5,2) NOT NULL,
    "dominant_hasab" VARCHAR(20) NOT NULL,
    "source" VARCHAR(10) NOT NULL DEFAULT 'ai',
    "persona_label" VARCHAR(100) NOT NULL,
    "persona_description" TEXT,
    "score_narrative" TEXT,
    "parent_notes" TEXT,
    "microdosing_plan" JSONB,
    "ai_raw_response" JSONB,
    "ai_model" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_reports" (
    "id" SERIAL NOT NULL,
    "survey_id" INTEGER NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "sent_via_wa" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pdf_reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "parents_phone_key" ON "parents"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "hasab_categories_code_key" ON "hasab_categories"("code");

-- CreateIndex
CREATE UNIQUE INDEX "survey_answers_survey_id_question_id_key" ON "survey_answers"("survey_id", "question_id");

-- CreateIndex
CREATE UNIQUE INDEX "survey_results_survey_id_key" ON "survey_results"("survey_id");

-- AddForeignKey
ALTER TABLE "children" ADD CONSTRAINT "children_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questions" ADD CONSTRAINT "questions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "hasab_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_child_id_fkey" FOREIGN KEY ("child_id") REFERENCES "children"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "parents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_answers" ADD CONSTRAINT "survey_answers_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_answers" ADD CONSTRAINT "survey_answers_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "child_natural_responses" ADD CONSTRAINT "child_natural_responses_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_results" ADD CONSTRAINT "survey_results_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pdf_reports" ADD CONSTRAINT "pdf_reports_survey_id_fkey" FOREIGN KEY ("survey_id") REFERENCES "surveys"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
