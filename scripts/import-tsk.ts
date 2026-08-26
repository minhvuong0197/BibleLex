/**
 * Import Treasury of Scripture Knowledge (TSK) verse-level cross-references.
 * Source: CrossReferences-org / crossreferences.org (public domain, CC BY 4.0).
 * Data file: data/tsk_kjv.tsv  (book, chapter, verse, anchor, references)
 * Each reference target is parsed into book/chapter/verse and mapped to the
 * app's BibleBook names so the UI can deep-link.
 */
import "dotenv/config"
import { readFileSync } from "fs"
import { join } from "path"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// TSK (KJV) book abbreviation -> app BibleBook.name
const BOOK_ALIAS: Record<string, string> = {
  Gen: "Genesis", Exod: "Exodus", Lev: "Leviticus", Num: "Numbers", Deut: "Deuteronomy",
  Josh: "Joshua", Judg: "Judges", Ruth: "Ruth", "1 Sam": "1 Samuel", "2 Sam": "2 Samuel",
  "1 Kgs": "1 Kings", "2 Kgs": "2 Kings", "1 Chr": "1 Chronicles", "2 Chr": "2 Chronicles",
  Ezra: "Ezra", Neh: "Nehemiah", Est: "Esther", Job: "Job", Ps: "Psalms", Prov: "Proverbs",
  Eccl: "Ecclesiastes", Song: "Song of Solomon", Isa: "Isaiah", Jer: "Jeremiah",
  Lam: "Lamentations", Ezek: "Ezekiel", Dan: "Daniel", Hos: "Hosea", Joel: "Joel",
  Amos: "Amos", Obad: "Obadiah", Jonah: "Jonah", Mic: "Micah", Nah: "Nahum",
  Hab: "Habakkuk", Zeph: "Zephaniah", Hag: "Haggai", Zech: "Zechariah", Mal: "Malachi",
  Matt: "Matthew", Mark: "Mark", Luke: "Luke", John: "John", Acts: "Acts", Rom: "Romans",
  "1 Cor": "1 Corinthians", "2 Cor": "2 Corinthians", Gal: "Galatians", Eph: "Ephesians",
  Phil: "Philippians", Col: "Colossians", "1 Thes": "1 Thessalonians", "2 Thes": "2 Thessalonians",
  "1 Tim": "1 Timothy", "2 Tim": "2 Timothy", Titus: "Titus", Phlm: "Philemon", Heb: "Hebrews",
  Jas: "James", "1 Pet": "1 Peter", "2 Pet": "2 Peter", "1 John": "1 John", "2 John": "2 John",
  "3 John": "3 John", Jude: "Jude", Rev: "Revelation",
}

const REF_RE = /^(\d?\s*[A-Za-z]+(?:\s+[A-Za-z]+)?)\s+(\d+):(\d+)(?:-(\d+))?/

function resolveBook(raw: string): string | null {
  const key = raw.trim().replace(/\s+/g, " ")
  if (BOOK_ALIAS[key]) return BOOK_ALIAS[key]
  // fallback: first word (handles e.g. "Song of Sol" -> "Song")
  const first = key.split(" ")[0]
  if (BOOK_ALIAS[first]) return BOOK_ALIAS[first]
  return null
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

async function main() {
  const knownBooks = new Set((await prisma.bibleBook.findMany({ select: { name: true } })).map((b) => b.name))
  const tsv = readFileSync(join(process.cwd(), "data", "tsk_kjv.tsv"), "utf-8")
  const lines = tsv.split("\n").filter((l) => l.trim().length > 0)
  const header = lines.shift()
  if (header && !header.startsWith("book")) {
    // already removed by filter; keep safe
  }

  const rows: Array<{
    fromBook: string
    fromChapter: number
    fromVerse: number
    toBook: string | null
    toChapter: number
    toVerse: number
    toLabel: string
    anchor: string | null
  }> = []

  let skipped = 0
  for (const line of lines) {
    const [book, chapter, verse, anchor, refs] = line.split("\t")
    const fromName = resolveBook(book)
    if (!fromName || !knownBooks.has(fromName)) {
      skipped++
      continue
    }
    const fromChapter = parseInt(chapter, 10)
    const fromVerse = parseInt(verse, 10)
    if (!fromChapter || !fromVerse) continue
    if (!refs) continue
    for (const ref of refs.split("|")) {
      const r = ref.trim()
      if (!r) continue
      const m = r.match(REF_RE)
      if (!m) continue
      const toName = resolveBook(m[1])
      const toChapter = parseInt(m[2], 10)
      const toVerse = parseInt(m[3], 10)
      if (!toChapter || !toVerse) continue
      rows.push({
        fromBook: fromName,
        fromChapter,
        fromVerse,
        toBook: toName && knownBooks.has(toName) ? toName : null,
        toChapter,
        toVerse,
        toLabel: r,
        anchor: (anchor || null) as string | null,
      })
    }
  }

  console.log(`Parsed ${rows.length} cross-reference rows (skipped ${skipped} unmapped source verses)`)
  await prisma.verseCrossReference.deleteMany({})
  let inserted = 0
  for (const c of chunk(rows, 2000)) {
    await prisma.verseCrossReference.createMany({ data: c, skipDuplicates: true })
    inserted += c.length
    process.stdout.write(`\r  inserted ${inserted.toLocaleString()} / ${rows.length.toLocaleString()}`)
  }
  console.log(`\n✓ Done. Total verse_cross_references: ${(await prisma.verseCrossReference.count()).toLocaleString()}`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
