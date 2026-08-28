import { NextRequest, NextResponse } from "next/server"
import { COMMENTARIES } from "@/lib/commentary-data"
import { BOOK_ABBREVIATIONS } from "@/lib/utils"

function toEnglishName(book: string): string {
  if (BOOK_ABBREVIATIONS[book]) return book
  const byAbbr = Object.keys(BOOK_ABBREVIATIONS).find((k) => BOOK_ABBREVIATIONS[k] === book)
  return byAbbr ?? book
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const book = searchParams.get("book")
  const chapter = parseInt(searchParams.get("chapter") || "", 10)
  if (!book || isNaN(chapter)) {
    return NextResponse.json({ entries: [] })
  }
  const en = toEnglishName(book)
  const prefix = `${en} ${chapter}`
  const entries: { verse?: number; section: string; content: string }[] = []
  for (const [key, list] of Object.entries(COMMENTARIES)) {
    if (key === prefix) {
      for (const e of list) entries.push({ section: e.section, content: e.content })
    } else if (key.startsWith(prefix + ":")) {
      const verse = parseInt(key.split(":")[1], 10)
      for (const e of list) entries.push({ verse, section: e.section, content: e.content })
    }
  }
  return NextResponse.json({ entries })
}
