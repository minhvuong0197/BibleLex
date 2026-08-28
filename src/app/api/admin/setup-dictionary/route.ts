import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { seedDictionaries } from "@/lib/dictionary-seed"

export const maxDuration = 60

const CREATE_SQL = [
  `CREATE TABLE IF NOT EXISTS dictionary_entries (
    id TEXT PRIMARY KEY,
    term TEXT NOT NULL,
    source TEXT NOT NULL,
    definition TEXT NOT NULL,
    vietnamese_def TEXT,
    created_at TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP(3) NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS dictionary_entries_term_idx ON dictionary_entries (term)`,
  `CREATE INDEX IF NOT EXISTS dictionary_entries_source_idx ON dictionary_entries (source)`,
  `ALTER TABLE dictionary_entries DROP CONSTRAINT IF EXISTS dictionary_entries_term_source_key`,
  `ALTER TABLE dictionary_entries ADD CONSTRAINT dictionary_entries_term_source_key UNIQUE (term, source)`,
]

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || ""
  if (!process.env.SEED_KEY || key !== process.env.SEED_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    for (const sql of CREATE_SQL) {
      await prisma.$executeRawUnsafe(sql)
    }
    const inserted = await seedDictionaries()
    const total = await prisma.dictionaryEntry.count()
    return NextResponse.json({ ok: true, inserted, total })
  } catch (e) {
    console.error("setup error", e)
    return NextResponse.json({ error: String((e as Error)?.message || e) }, { status: 500 })
  }
}
