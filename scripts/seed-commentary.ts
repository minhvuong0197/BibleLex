import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"
import { COMMENTARIES } from "../src/lib/commentary-data"

const prisma = new PrismaClient()

interface SeedEntry {
  book: string
  chapter: number
  verse: number | null
  section: string
  content: string
  source?: string
}

function buildFromModule(): SeedEntry[] {
  const out: SeedEntry[] = []
  for (const [key, list] of Object.entries(COMMENTARIES)) {
    const [head, verseStr] = key.includes(":") ? key.split(":") : [key, undefined]
    const parts = head.trim().split(" ")
    const chapter = parseInt(parts[parts.length - 1], 10)
    const book = parts.slice(0, -1).join(" ")
    const verse = verseStr ? parseInt(verseStr, 10) : null
    for (const e of list) out.push({ book, chapter, verse, section: e.section, content: e.content, source: "seed" })
  }
  return out
}

async function main() {
  let count = 0
  const entries = buildFromModule()

  // Bulk file do user cung cấp (vd Matthew Henry full) — tùy chọn.
  const bulkPath = path.join(process.cwd(), "data", "commentary-bulk.json")
  if (fs.existsSync(bulkPath)) {
    try {
      const bulk = JSON.parse(fs.readFileSync(bulkPath, "utf8"))
      if (Array.isArray(bulk)) entries.push(...bulk)
    } catch (e) {
      console.warn("Không đọc được data/commentary-bulk.json:", (e as Error).message)
    }
  }

  for (const item of entries) {
    if (item.verse !== null) {
      await prisma.commentary.upsert({
        where: {
          book_chapter_verse_section: {
            book: item.book,
            chapter: item.chapter,
            verse: item.verse,
            section: item.section,
          },
        },
        update: { content: item.content, source: item.source ?? "bulk" },
        create: {
          book: item.book,
          chapter: item.chapter,
          verse: item.verse,
          section: item.section,
          content: item.content,
          source: item.source ?? "bulk",
        },
      })
    } else {
      const existing = await prisma.commentary.findFirst({
        where: { book: item.book, chapter: item.chapter, verse: null, section: item.section },
      })
      if (existing) {
        await prisma.commentary.update({ where: { id: existing.id }, data: { content: item.content, source: item.source ?? "bulk" } })
      } else {
        await prisma.commentary.create({
          data: { book: item.book, chapter: item.chapter, verse: null, section: item.section, content: item.content, source: item.source ?? "bulk" },
        })
      }
    }
    count++
  }
  console.log(`Đã seed ${count} mục giải kinh.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
