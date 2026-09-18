-- v1.1.0: Rename rumpun asyiha→qiyadah dan wajdan→karam
-- Non-destruktif: RENAME COLUMN tidak menyentuh data

-- SurveyResult
ALTER TABLE survey_results RENAME COLUMN score_asyiha TO score_qiyadah;
ALTER TABLE survey_results RENAME COLUMN pct_asyiha   TO pct_qiyadah;
ALTER TABLE survey_results RENAME COLUMN score_wajdan TO score_karam;
ALTER TABLE survey_results RENAME COLUMN pct_wajdan   TO pct_karam;

-- FamilyResult
ALTER TABLE family_results RENAME COLUMN score_wajdan TO score_karam;

-- FamilyQuestion: nilai dimension string 'wajdan' → 'karam'
UPDATE family_questions SET dimension = 'karam' WHERE dimension = 'wajdan';

-- HasabCategory: kode dan nama
UPDATE hasab_categories SET code = 'qiyadah', name = 'Hasab Al-Qiyadah' WHERE code = 'asyiha';
UPDATE hasab_categories SET code = 'karam',   name = 'Hasab Al-Karam'   WHERE code = 'wajdan';
