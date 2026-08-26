import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DDL = [
  `CREATE TABLE IF NOT EXISTS "bible_versions" (
    "code" text NOT NULL,
    "name" text NOT NULL,
    "abbreviation" text NOT NULL,
    "language" text NOT NULL DEFAULT 'vi',
    "year" integer,
    "source" text,
    "note" text,
    "ordinal" integer NOT NULL DEFAULT 0,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "bible_versions_pkey" PRIMARY KEY ("code")
  )`,
  `CREATE TABLE IF NOT EXISTS "verse_translations" (
    "id" text NOT NULL,
    "book_id" text NOT NULL,
    "chapter" integer NOT NULL,
    "verse" integer NOT NULL,
    "version_id" text NOT NULL,
    "text" text NOT NULL,
    "created_at" timestamptz NOT NULL DEFAULT now(),
    "updated_at" timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT "verse_translations_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "verse_translations_book_id_fkey" FOREIGN KEY ("book_id") REFERENCES "bible_books"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "verse_translations_version_id_fkey" FOREIGN KEY ("version_id") REFERENCES "bible_versions"("code") ON DELETE RESTRICT ON UPDATE CASCADE
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS "verse_translations_book_id_chapter_verse_version_id_key" ON "verse_translations" ("book_id","chapter","verse","version_id")`,
  `CREATE INDEX IF NOT EXISTS "verse_translations_book_id_chapter_idx" ON "verse_translations" ("book_id","chapter")`,
  `CREATE INDEX IF NOT EXISTS "verse_translations_version_id_idx" ON "verse_translations" ("version_id")`,
  `CREATE INDEX IF NOT EXISTS "bible_versions_ordinal_idx" ON "bible_versions" ("ordinal")`,
]

async function main() {
  for (const sql of DDL) {
    await prisma.$executeRawUnsafe(sql)
    console.log('DDL ok:', sql.slice(0, 48))
  }

  await prisma.bibleVersion.upsert({
    where: { id: 'VI1934' },
    update: {},
    create: {
      id: 'VI1934',
      name: 'Truyền Thống',
      abbreviation: 'TT',
      language: 'vi',
      year: 1925,
      source: 'kinhthanh.httlvn.org',
      note: 'Kinh Thánh Truyền Thống (bản in lịch sử 1925/1934). Nguồn: HTTLVN.',
      ordinal: 0,
    },
  })
  console.log('BibleVersion VI1934 ensured')

  const res = await prisma.$executeRawUnsafe(
    `INSERT INTO "verse_translations" ("id","book_id","chapter","verse","version_id","text")
     SELECT gen_random_uuid(), "book_id","chapter","verse",'VI1934',"vietnamese_text"
     FROM "verses" WHERE "vietnamese_text" IS NOT NULL
     ON CONFLICT ("book_id","chapter","verse","version_id") DO NOTHING`,
  )
  const after = await prisma.verseTranslation.count({ where: { versionId: 'VI1934' } })
  console.log(`Seeded verse translations VI1934: ${after} rows (insert result ${String(res)})`)

  // Bản tiếng Anh: King James Version (public domain), lấy từ cột kjv_text
  await prisma.bibleVersion.upsert({
    where: { id: 'KJV' },
    update: {},
    create: {
      id: 'KJV',
      name: 'King James Version',
      abbreviation: 'KJV',
      language: 'en',
      year: 1611,
      source: 'public domain',
      note: 'Tiếng Anh - Kinh James (1611)',
      ordinal: 100,
    },
  })
  const kjvExisting = await prisma.verseTranslation.count({ where: { versionId: 'KJV' } })
  if (kjvExisting === 0) {
    const kres = await prisma.$executeRawUnsafe(
      `INSERT INTO "verse_translations" ("id","book_id","chapter","verse","version_id","text")
       SELECT gen_random_uuid(), "book_id","chapter","verse",'KJV',"kjv_text"
       FROM "verses" WHERE "kjv_text" IS NOT NULL
       ON CONFLICT ("book_id","chapter","verse","version_id") DO NOTHING`,
    )
    const kafter = await prisma.verseTranslation.count({ where: { versionId: 'KJV' } })
    console.log(`Seeded verse translations KJV: ${kafter} rows (insert result ${String(kres)})`)
  } else {
    console.log(`VerseTranslation KJV already has ${kjvExisting} rows; skip copy`)
  }
}

main()
  .catch((e) => {
    console.error('FAILED', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
