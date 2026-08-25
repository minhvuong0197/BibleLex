-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Language" AS ENUM ('HEBREW', 'GREEK');

-- CreateEnum
CREATE TYPE "Tense" AS ENUM ('PRESENT', 'IMPERFECT', 'FUTURE', 'AORIST', 'PERFECT', 'PLUPERFECT', 'FUTURE_PERFECT');

-- CreateEnum
CREATE TYPE "Voice" AS ENUM ('ACTIVE', 'MIDDLE', 'PASSIVE', 'MIDDLE_PASSIVE');

-- CreateEnum
CREATE TYPE "Mood" AS ENUM ('INDICATIVE', 'SUBJUNCTIVE', 'OPTATIVE', 'IMPERATIVE', 'INFINITIVE', 'PARTICIPLE');

-- CreateEnum
CREATE TYPE "Case" AS ENUM ('NOMINATIVE', 'GENITIVE', 'DATIVE', 'ACCUSATIVE', 'VOCATIVE', 'LOCATIVE', 'INSTRUMENTAL');

-- CreateEnum
CREATE TYPE "Number" AS ENUM ('SINGULAR', 'PLURAL', 'DUAL');

-- CreateEnum
CREATE TYPE "Person" AS ENUM ('FIRST', 'SECOND', 'THIRD');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MASCULINE', 'FEMININE', 'NEUTER');

-- CreateEnum
CREATE TYPE "Testament" AS ENUM ('OLD', 'NEW');

-- CreateEnum
CREATE TYPE "CrossRefType" AS ENUM ('RELATED', 'SYNONYM', 'ANTONYM', 'ROOT', 'DERIVATIVE', 'COMPOUND', 'CITATION', 'ALLUSION');

-- CreateTable
CREATE TABLE "strong_entries" (
    "id" TEXT NOT NULL,
    "strong_number" TEXT NOT NULL,
    "language" "Language" NOT NULL,
    "transliteration" TEXT NOT NULL,
    "pronunciation" TEXT,
    "etymology" TEXT,
    "definition" TEXT NOT NULL,
    "kjv_def" TEXT,
    "outline_biblical_usage" TEXT,
    "thayers_def" TEXT,
    "bdb_def" TEXT,
    "lsj_def" TEXT,
    "derivation" TEXT,
    "tdk" TEXT,
    "gk_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "strong_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "morphologies" (
    "id" TEXT NOT NULL,
    "strong_number" TEXT NOT NULL,
    "parsings" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 1,
    "tense" "Tense",
    "voice" "Voice",
    "mood" "Mood",
    "case" "Case",
    "number" "Number",
    "person" "Person",
    "gender" "Gender",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "morphologies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verse_words" (
    "id" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "word_order" INTEGER NOT NULL,
    "hebrew_greek" TEXT NOT NULL,
    "transliteration" TEXT NOT NULL,
    "strong_number" TEXT,
    "parsing" TEXT,
    "english" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verse_words_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cross_references" (
    "id" TEXT NOT NULL,
    "source_strong" TEXT NOT NULL,
    "target_strong" TEXT NOT NULL,
    "type" "CrossRefType" NOT NULL DEFAULT 'RELATED',
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cross_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bible_books" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "abbreviation" TEXT NOT NULL,
    "testament" "Testament" NOT NULL,
    "book_order" INTEGER NOT NULL,
    "chapters" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bible_books_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verses" (
    "id" TEXT NOT NULL,
    "book_id" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "vietnamese_text" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topical_entries" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topical_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "topical_references" (
    "id" TEXT NOT NULL,
    "topic_id" TEXT NOT NULL,
    "book" TEXT NOT NULL,
    "chapter" INTEGER NOT NULL,
    "verse_start" INTEGER NOT NULL,
    "verse_end" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topical_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "strong_number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "model" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "strong_entries_strong_number_key" ON "strong_entries"("strong_number");

-- CreateIndex
CREATE INDEX "strong_entries_language_idx" ON "strong_entries"("language");

-- CreateIndex
CREATE INDEX "morphologies_strong_number_idx" ON "morphologies"("strong_number");

-- CreateIndex
CREATE INDEX "verse_words_book_chapter_verse_idx" ON "verse_words"("book", "chapter", "verse");

-- CreateIndex
CREATE INDEX "verse_words_strong_number_idx" ON "verse_words"("strong_number");

-- CreateIndex
CREATE UNIQUE INDEX "verse_words_book_chapter_verse_word_order_key" ON "verse_words"("book", "chapter", "verse", "word_order");

-- CreateIndex
CREATE INDEX "cross_references_source_strong_idx" ON "cross_references"("source_strong");

-- CreateIndex
CREATE INDEX "cross_references_target_strong_idx" ON "cross_references"("target_strong");

-- CreateIndex
CREATE UNIQUE INDEX "bible_books_name_key" ON "bible_books"("name");

-- CreateIndex
CREATE UNIQUE INDEX "bible_books_abbreviation_key" ON "bible_books"("abbreviation");

-- CreateIndex
CREATE UNIQUE INDEX "bible_books_book_order_key" ON "bible_books"("book_order");

-- CreateIndex
CREATE INDEX "verses_book_id_chapter_idx" ON "verses"("book_id", "chapter");

-- CreateIndex
CREATE UNIQUE INDEX "verses_book_id_chapter_verse_key" ON "verses"("book_id", "chapter", "verse");

-- CreateIndex
CREATE UNIQUE INDEX "topical_entries_topic_key" ON "topical_entries"("topic");

-- CreateIndex
CREATE INDEX "topical_references_topic_id_idx" ON "topical_references"("topic_id");

-- CreateIndex
CREATE INDEX "topical_references_book_chapter_verse_start_idx" ON "topical_references"("book", "chapter", "verse_start");

-- CreateIndex
CREATE INDEX "ai_analyses_strong_number_idx" ON "ai_analyses"("strong_number");

-- CreateIndex
CREATE UNIQUE INDEX "ai_analyses_strong_number_type_key" ON "ai_analyses"("strong_number", "type");

-- AddForeignKey
ALTER TABLE "morphologies" ADD CONSTRAINT "morphologies_strong_number_fkey" FOREIGN KEY ("strong_number") REFERENCES "strong_entries"("strong_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verse_words" ADD CONSTRAINT "verse_words_strong_number_fkey" FOREIGN KEY ("strong_number") REFERENCES "strong_entries"("strong_number") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_references" ADD CONSTRAINT "cross_references_source_strong_fkey" FOREIGN KEY ("source_strong") REFERENCES "strong_entries"("strong_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cross_references" ADD CONSTRAINT "cross_references_target_strong_fkey" FOREIGN KEY ("target_strong") REFERENCES "strong_entries"("strong_number") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "verses" ADD CONSTRAINT "verses_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "bible_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "topical_references" ADD CONSTRAINT "topical_references_topic_id_fkey" FOREIGN KEY ("topic_id") REFERENCES "topical_entries"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

