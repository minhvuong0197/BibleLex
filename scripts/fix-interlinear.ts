/**
 * fix-interlinear.ts
 *
 * Corrects two data issues without a full re-import:
 *
 *  1. verse_words.english — previously filled from the *global* KJV rendition
 *     list (strongs.kjv_def.split(',')[0]), which produced wrong meanings
 *     (e.g. H1254 -> "choose" instead of "created"). We now align each word to
 *     the actual KJV word from the per-word aligned interlinear
 *     (kjvstudy.org / tahmmee/interlinear_bibledata, public domain).
 *
 *  2. verses.kjv_text — new column populated from the KJV 1769 text
 *     (midvash/bible-data, public domain) so the UI can show an English
 *     comparison text alongside the original and Vietnamese.
 *
 * The downloaded sources are cached under data/raw so the script is re-runnable.
 * The parsed maps are also written to data/kjv_interlinear.json and
 * data/kjv_text.json for reuse by the import pipeline.
 */
import "dotenv/config"
import { gunzipSync } from "zlib"
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs"
import { join } from "path"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const DATA = join(process.cwd(), "data")
const RAW = join(DATA, "raw")
mkdirSync(RAW, { recursive: true })

const INTERLINEAR_URL =
  "https://raw.githubusercontent.com/kennethreitz/kjvstudy.org/main/kjvstudy_org/data/interlinear.json.gz"
const KJV_TEXT_URL =
  "https://raw.githubusercontent.com/midvash/bible-data/main/versions/en/kjv/kjv.json"

async function download(url: string, dest: string) {
  if (existsSync(dest)) return dest
  console.log(`  ↓ ${url.split("/").pop()} ...`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`)
  writeFileSync(dest, Buffer.from(await res.arrayBuffer()))
  return dest
}

function normStrong(s?: string | null) {
  return s ? s.toUpperCase().replace(/[^HG0-9]/g, "") : null
}
function stripMarks(s = "") {
  return s.replace(/[֑-ׁׂ-ֽֽׄ]/g, "").replace(/[\u0591-\u05BD\u05BF]/g, "")
}

async function main() {
  /* ---- 1. Aligned KJV interlinear (english) ---- */
  console.log("\n[A] Aligning verse_words.english from KJV interlinear")
  const interPath = await download(INTERLINEAR_URL, join(RAW, "interlinear.json.gz"))
  const inter = JSON.parse(gunzipSync(readFileSync(interPath)).toString("utf-8"))
  const interMap = new Map<string, Array<{ strongs: string; english: string; original: string }>>()
  for (const [key, words] of Object.entries<any>(inter)) {
    const [book, chapter, verse] = key.split(":")
    interMap.set(`${book}|${chapter}|${verse}`, words)
  }
  writeFileSync(join(DATA, "kjv_interlinear.json"), JSON.stringify(Object.fromEntries(interMap)))

  const books = await prisma.bibleBook.findMany({ select: { id: true, name: true, abbreviation: true } })
  let updatedWords = 0
  let matched = 0
  let total = 0

  for (const b of books) {
    const words = await prisma.verseWord.findMany({
      where: { book: b.name },
      orderBy: [{ chapter: "asc" }, { verse: "asc" }, { wordOrder: "asc" }],
      select: { id: true, chapter: true, verse: true, wordOrder: true, strongNumber: true, hebrewGreek: true },
    })
    if (!words.length) continue

    const byVerse = new Map<string, typeof words>()
    for (const w of words) {
      const k = `${w.chapter}:${w.verse}`
      if (!byVerse.has(k)) byVerse.set(k, [])
      byVerse.get(k)!.push(w)
    }

    const updates: Array<{ id: string; english: string | null }> = []
    for (const [vk, list] of byVerse) {
      const [chapter, verse] = vk.split(":")
      const kjv = interMap.get(`${b.name}|${chapter}|${verse}`) || []
      const kn = kjv.map((k) => ({ ...k, s: normStrong(k.strongs), o: stripMarks(k.original) }))
      let p = 0
      for (const w of list) {
        total++
        const ws = normStrong(w.strongNumber)
        const wo = stripMarks(w.hebrewGreek)
        let j = -1
        if (ws) {
          for (let i = p; i < kn.length; i++) if (kn[i].s === ws) { j = i; break }
        }
        if (j < 0 && wo) {
          for (let i = p; i < kn.length; i++) if (kn[i].o && kn[i].o === wo) { j = i; break }
        }
        if (j >= 0) {
          updates.push({ id: w.id, english: kn[j].english || null })
          matched++
          p = j + 1
        } else {
          updates.push({ id: w.id, english: null })
        }
      }
    }

    // Bulk UPDATE via CASE
    for (let i = 0; i < updates.length; i += 1500) {
      const chunk = updates.slice(i, i + 1500)
      const whens = chunk.map((u) => `WHEN '${u.id}' THEN ${u.english ? `'${u.english.replace(/'/g, "''")}'` : "NULL"}`).join(" ")
      const ids = chunk.map((u) => `'${u.id}'`).join(",")
      await prisma.$executeRawUnsafe(
        `UPDATE "verse_words" SET "english" = CASE "id" ${whens} ELSE "english" END WHERE "id" IN (${ids})`
      )
    }
    updatedWords += updates.length
    process.stdout.write(`  ✓ ${b.name} (${updates.length} words)\n`)
  }
  console.log(`  ✓ english updated: ${updatedWords.toLocaleString()} words, matched ${matched}/${total} (${(100 * matched / total).toFixed(1)}%)`)

  /* ---- 2. KJV verse text ---- */
  console.log("\n[B] Populating verses.kjv_text from KJV 1769")
  const kjvPath = await download(KJV_TEXT_URL, join(RAW, "kjv.json"))
  const kjvJson = JSON.parse(readFileSync(kjvPath, "utf-8"))
  const abbrToText = new Map<string, Map<number, Map<number, string>>>()
  for (const bk of kjvJson.books as any[]) {
    const m = new Map<number, Map<number, string>>()
    for (const c of bk.chapters) {
      const vm = new Map<number, string>()
      for (const v of c.verses) vm.set(v.number, v.text)
      m.set(c.chapter, vm)
    }
    abbrToText.set(bk.book, m)
  }
  writeFileSync(join(DATA, "kjv_text.json"), JSON.stringify(Object.fromEntries(
    [...abbrToText].map(([k, v]) => [k, Object.fromEntries([...v].map(([c, vm]) => [c, Object.fromEntries(vm)]))])
  )))

  let kjvUpdated = 0
  for (const b of books) {
    const tm = abbrToText.get(b.abbreviation)
    if (!tm) continue
    const verses = await prisma.verse.findMany({
      where: { bookId: b.id },
      select: { id: true, chapter: true, verse: true },
    })
    const ups: Array<{ id: string; text: string | null }> = []
    for (const v of verses) {
      const t = tm.get(v.chapter)?.get(v.verse) ?? null
      ups.push({ id: v.id, text: t })
    }
    for (let i = 0; i < ups.length; i += 1500) {
      const chunk = ups.slice(i, i + 1500)
      const whens = chunk.map((u) => `WHEN '${u.id}' THEN ${u.text ? `'${u.text.replace(/'/g, "''")}'` : "NULL"}`).join(" ")
      const ids = chunk.map((u) => `'${u.id}'`).join(",")
      await prisma.$executeRawUnsafe(
        `UPDATE "verses" SET "kjv_text" = CASE "id" ${whens} ELSE "kjv_text" END WHERE "id" IN (${ids})`
      )
    }
    kjvUpdated += ups.length
    process.stdout.write(`  ✓ ${b.name}\n`)
  }
  console.log(`  ✓ kjv_text populated: ${kjvUpdated.toLocaleString()} verses`)

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error("\n✗ Fix failed:", e)
  process.exit(1)
})
