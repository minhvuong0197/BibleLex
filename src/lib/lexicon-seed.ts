import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { prisma } from "@/lib/db"

const LOCAL_DIR = join(process.cwd(), "scripts", "data")

const SOURCES: { file: string; lang: "H" | "G"; source: string }[] = [
  { file: "tbesH.txt", lang: "H", source: "Brown-Driver-Briggs Hebrew Lexicon" },
  { file: "tbesg.txt", lang: "G", source: "Thayer's Greek Lexicon" },
]

function stripHtml(s: string) {
  return String(s)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[a-zA-Z][^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#?[\w]+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function parseBriefLexicon(text: string, lang: "H" | "G") {
  const map = new Map<string, string>()
  const lines = String(text).split(/\r?\n/)
  let started = false
  for (const line of lines) {
    if (!started) {
      if (/^eStrong#?\t/.test(line) && /Gloss/.test(line) && /Transliteration/.test(line)) {
        started = true
      }
      continue
    }
    if (!line.trim()) continue
    const parts = line.split("\t")
    const es = (parts[0] || "").trim()
    const m = es.match(/^([HG])(\d+)/)
    if (!m || m[1] !== lang) continue
    const key = m[1] + parseInt(m[2], 10)
    if (map.has(key)) continue
    const meaning = parts[parts.length - 1] || ""
    const clean = stripHtml(meaning).replace(/\s+/g, " ").trim()
    if (clean) map.set(key, clean)
  }
  return map
}

export async function seedLexicons() {
  let total = 0
  for (const s of SOURCES) {
    const path = join(LOCAL_DIR, s.file)
    if (!existsSync(path)) {
      console.log(`[lexicon] missing ${s.file}, skipping`)
      continue
    }
    const map = parseBriefLexicon(readFileSync(path, "utf8"), s.lang)
    console.log(`[lexicon] ${s.source}: ${map.size} entries parsed`)

    const rows = Array.from(map.entries()).map(([term, definition]) => ({
      term,
      source: s.source,
      definition,
    }))

    const CHUNK = 1000
    let inserted = 0
    for (let i = 0; i < rows.length; i += CHUNK) {
      const batch = rows.slice(i, i + CHUNK)
      const res = await prisma.dictionaryEntry.createMany({
        data: batch,
        skipDuplicates: true,
      })
      inserted += res.count
      total += res.count
      process.stdout.write(`\r  ${s.source}: ${inserted}/${rows.length}`)
    }
    console.log("")
  }
  return total
}
