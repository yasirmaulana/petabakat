# Database Schema — PetaBakat

## ERD Overview

```
parents 1──N children 1──N surveys 1──N survey_answers
                                    │
                                    ├── 1──N child_natural_responses
                                    │
                                    └── 1──1 survey_results 1──1 pdf_reports

questions N──1 hasab_categories
survey_answers N──1 questions
```

## Tabel

### 1. `parents`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID / AUTO_INCREMENT | PK |
| name | VARCHAR(255) | Nama orang tua/wali |
| phone | VARCHAR(20) UNIQUE | Nomor HP/WhatsApp — kunci lookup |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### 2. `children`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID / AUTO_INCREMENT | PK |
| parent_id | FK → parents | |
| name | VARCHAR(255) | Nama anak |
| birth_date | DATE | Tanggal lahir |
| gender | ENUM('L','P') | Jenis kelamin |
| created_at | TIMESTAMP | |

### 3. `hasab_categories`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT | PK |
| code | VARCHAR(20) | asyiha / ilmi / amali / wajdan |
| name | VARCHAR(100) | Nama lengkap rumpun |
| description | TEXT | Deskripsi rumpun |

Seed data (4 baris tetap):
- `asyiha` — Kepemimpinan & Sosial
- `ilmi` — Intelektual & Keilmuan
- `amali` — Bisnis & Teknis
- `wajdan` — Seni & Spiritual

### 4. `questions`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | INT | PK |
| category_id | FK → hasab_categories | |
| order | INT | Urutan tampil dalam kategori (1-5) |
| text | TEXT | Teks pertanyaan |
| type | ENUM('hasab','nasab') | Jenis pertanyaan |

20 pertanyaan hasab (5 per kategori) + pertanyaan nasab.

### 5. `surveys`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | UUID / AUTO_INCREMENT | PK |
| child_id | FK → children | |
| parent_id | FK → parents | Denormalisasi untuk query cepat |
| status | ENUM('in_progress','completed') | |
| created_at | TIMESTAMP | Waktu mulai survey |
| completed_at | TIMESTAMP NULL | Waktu selesai |

### 6. `survey_answers`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | AUTO_INCREMENT | PK |
| survey_id | FK → surveys | |
| question_id | FK → questions | |
| value | SMALLINT (1-5) | Skor Likert |

UNIQUE(survey_id, question_id)

### 7. `child_natural_responses`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | AUTO_INCREMENT | PK |
| survey_id | FK → surveys | |
| response_option | VARCHAR(255) | Pilihan minat (bongkar barang, menggambar, dll) |
| free_text | TEXT NULL | Input teks bebas jika ada |

Respon alami / minat dominan anak saat ini. Bisa lebih dari satu per survey.

### 8. `survey_results`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | AUTO_INCREMENT | PK |
| survey_id | FK → surveys | UNIQUE |
| score_asyiha | SMALLINT | Skor 0-25 |
| score_ilmi | SMALLINT | Skor 0-25 |
| score_amali | SMALLINT | Skor 0-25 |
| score_wajdan | SMALLINT | Skor 0-25 |
| pct_asyiha | DECIMAL(5,2) | Persentase |
| pct_ilmi | DECIMAL(5,2) | |
| pct_amali | DECIMAL(5,2) | |
| pct_wajdan | DECIMAL(5,2) | |
| dominant_hasab | VARCHAR(20) | Kode rumpun dominan |
| source | ENUM('ai','fallback') | Sumber analisis: AI model atau rule statis |
| persona_label | VARCHAR(100) | Label persona dari AI / fallback |
| persona_description | TEXT | Deskripsi persona personal |
| score_narrative | TEXT | Narasi penjelasan skor dari AI |
| parent_notes | TEXT | Catatan & saran pola asuh dari AI |
| microdosing_plan | JSON | Rencana aktivitas mingguan (structured) |
| ai_raw_response | JSON NULL | Response mentah dari AI (untuk debugging & re-render) |
| ai_model | VARCHAR(50) NULL | Model ID yang digunakan (e.g. claude-sonnet-5) |
| created_at | TIMESTAMP | |

### 9. `pdf_reports`
| Kolom | Tipe | Keterangan |
|-------|------|------------|
| id | AUTO_INCREMENT | PK |
| survey_id | FK → surveys | |
| file_path | VARCHAR(500) | Path/URL file PDF |
| sent_via_wa | BOOLEAN DEFAULT FALSE | Sudah dikirim via WA? |
| sent_at | TIMESTAMP NULL | Waktu pengiriman WA |
| created_at | TIMESTAMP | |

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Parent {
  id        Int       @id @default(autoincrement())
  name      String
  phone     String    @unique
  createdAt DateTime  @default(now()) @map("created_at")
  updatedAt DateTime  @updatedAt @map("updated_at")
  children  Child[]
  surveys   Survey[]

  @@map("parents")
}

model Child {
  id        Int       @id @default(autoincrement())
  parentId  Int       @map("parent_id")
  name      String
  birthDate DateTime  @map("birth_date") @db.Date
  gender    String    @db.VarChar(1) // L atau P
  createdAt DateTime  @default(now()) @map("created_at")
  parent    Parent    @relation(fields: [parentId], references: [id])
  surveys   Survey[]

  @@map("children")
}

model HasabCategory {
  id          Int        @id @default(autoincrement())
  code        String     @unique @db.VarChar(20)
  name        String     @db.VarChar(100)
  description String?
  questions   Question[]

  @@map("hasab_categories")
}

model Question {
  id         Int           @id @default(autoincrement())
  categoryId Int?          @map("category_id")
  order      Int
  text       String
  type       String        @db.VarChar(10) // hasab atau nasab
  category   HasabCategory? @relation(fields: [categoryId], references: [id])
  answers    SurveyAnswer[]

  @@map("questions")
}

model Survey {
  id          Int       @id @default(autoincrement())
  childId     Int       @map("child_id")
  parentId    Int       @map("parent_id")
  status      String    @default("in_progress") @db.VarChar(20)
  createdAt   DateTime  @default(now()) @map("created_at")
  completedAt DateTime? @map("completed_at")
  child       Child     @relation(fields: [childId], references: [id])
  parent      Parent    @relation(fields: [parentId], references: [id])
  answers     SurveyAnswer[]
  responses   ChildNaturalResponse[]
  result      SurveyResult?
  pdfReports  PdfReport[]

  @@map("surveys")
}

model SurveyAnswer {
  id         Int      @id @default(autoincrement())
  surveyId   Int      @map("survey_id")
  questionId Int      @map("question_id")
  value      Int      @db.SmallInt
  survey     Survey   @relation(fields: [surveyId], references: [id])
  question   Question @relation(fields: [questionId], references: [id])

  @@unique([surveyId, questionId])
  @@map("survey_answers")
}

model ChildNaturalResponse {
  id             Int     @id @default(autoincrement())
  surveyId       Int     @map("survey_id")
  responseOption String  @map("response_option") @db.VarChar(255)
  freeText       String? @map("free_text")
  survey         Survey  @relation(fields: [surveyId], references: [id])

  @@map("child_natural_responses")
}

model SurveyResult {
  id                 Int      @id @default(autoincrement())
  surveyId           Int      @unique @map("survey_id")
  scoreAsyiha        Int      @map("score_asyiha") @db.SmallInt
  scoreIlmi          Int      @map("score_ilmi") @db.SmallInt
  scoreAmali         Int      @map("score_amali") @db.SmallInt
  scoreWajdan        Int      @map("score_wajdan") @db.SmallInt
  pctAsyiha          Decimal  @map("pct_asyiha") @db.Decimal(5, 2)
  pctIlmi            Decimal  @map("pct_ilmi") @db.Decimal(5, 2)
  pctAmali           Decimal  @map("pct_amali") @db.Decimal(5, 2)
  pctWajdan          Decimal  @map("pct_wajdan") @db.Decimal(5, 2)
  dominantHasab      String   @map("dominant_hasab") @db.VarChar(20)
  source             String   @default("ai") @db.VarChar(10) // ai atau fallback
  personaLabel       String   @map("persona_label") @db.VarChar(100)
  personaDescription String?  @map("persona_description")
  scoreNarrative     String?  @map("score_narrative")
  parentNotes        String?  @map("parent_notes")
  microdosingPlan    Json?    @map("microdosing_plan")
  aiRawResponse      Json?    @map("ai_raw_response")
  aiModel            String?  @map("ai_model") @db.VarChar(50)
  createdAt          DateTime @default(now()) @map("created_at")
  survey             Survey   @relation(fields: [surveyId], references: [id])

  @@map("survey_results")
}

model PdfReport {
  id        Int       @id @default(autoincrement())
  surveyId  Int       @map("survey_id")
  filePath  String    @map("file_path") @db.VarChar(500)
  sentViaWa Boolean   @default(false) @map("sent_via_wa")
  sentAt    DateTime? @map("sent_at")
  createdAt DateTime  @default(now()) @map("created_at")
  survey    Survey    @relation(fields: [surveyId], references: [id])

  @@map("pdf_reports")
}
```
