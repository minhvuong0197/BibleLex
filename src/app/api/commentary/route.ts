import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { COMMENTARIES } from "@/lib/commentary-data"
import { BOOK_ABBREVIATIONS } from "@/lib/utils"

function toEnglishName(book: string): string {
  if (BOOK_ABBREVIATIONS[book]) return book
  const byAbbr = Object.keys(BOOK_ABBREVIATIONS).find((k) => BOOK_ABBREVIATIONS[k] === book)
  return byAbbr ?? book
}

interface Entry {
  verse?: number
  section: string
  content: string
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const book = searchParams.get("book")
  const chapter = parseInt(searchParams.get("chapter") || "", 10)
  if (!book || isNaN(chapter)) {
    return NextResponse.json({ entries: [] })
  }
  const en = toEnglishName(book)

  // Ưu tiên DB (cho phép nhập dữ liệu lớn qua script seed).
  const dbRows = await prisma.commentary.findMany({ where: { book: en, chapter } })
  if (dbRows.length > 0) {
    const entries: Entry[] = dbRows.map((r) => ({ verse: r.verse ?? undefined, section: r.section, content: r.content }))
    return NextResponse.json({ entries, source: "db" })
  }

  // Fallback: dữ liệu seed trong code.
  const prefix = `${en} ${chapter}`
  const entries: Entry[] = []
  for (const [key, list] of Object.entries(COMMENTARIES)) {
    if (key === prefix) {
      for (const e of list) entries.push({ section: e.section, content: e.content })
    } else if (key.startsWith(prefix + ":")) {
      const verse = parseInt(key.split(":")[1], 10)
      for (const e of list) entries.push({ verse, section: e.section, content: e.content })
    }
  }
  return NextResponse.json({ entries, source: "seed" })
}
