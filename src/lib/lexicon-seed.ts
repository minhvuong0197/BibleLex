import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { prisma } from "@/lib/db"

const LOCAL_DIR = join(process.cwd(), "scripts", "data")

const SOURCES: { file?: string; url?: string; lang: "H" | "G"; source: string }[] = [
  { file: "tbesH.txt", lang: "H", source: "Brown-Driver-Briggs Hebrew Lexicon" },
  { file: "tbesg.txt", lang: "G", source: "Thayer's Greek Lexicon" },
  {
    url: "https://raw.githubusercontent.com/STEPBible/STEPBible-Data/master/Lexicons/TFLSJ%20%200-5624%20-%20Translators%20Formatted%20full%20LSJ%20Bible%20lexicon%20-%20STEPBible.org%20CC%20BY.txt",
    lang: "G",
    source: "Liddell-Scott-Jones Greek Lexicon",
  },
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

async function getText(s: { file?: string; url?: string }) {
  if (s.file) {
    const p = join(LOCAL_DIR, s.file)
    if (existsSync(p)) return readFileSync(p, "utf8")
  }
  if (s.url) {
    const res = await fetch(s.url, { redirect: "follow" })
    if (!res.ok) throw new Error(`fetch ${s.url} failed: ${res.status}`)
    return await res.text()
  }
  throw new Error("no source available")
}

export async function seedLexicons() {
  let total = 0
  for (const s of SOURCES) {
    let text: string
    try {
      text = await getText(s)
    } catch (e) {
      console.log(`[lexicon] ${s.source}: ${(e as Error).message}`)
      continue
    }
    const map = parseBriefLexicon(text, s.lang)
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

