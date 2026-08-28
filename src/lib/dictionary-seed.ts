import { readFileSync, existsSync } from "fs"
import { join } from "path"
import { prisma } from "@/lib/db"

const HF = "https://huggingface.co/datasets/JWBickel/BibleDictionaries/resolve/main"
const LOCAL_DIR = join(process.cwd(), "scripts", "data")

const SOURCES: { file: string; local: string; source: string }[] = [
  { file: "Easton%27s%20Bible%20Dictionary.jsonl", local: "easton.jsonl", source: "Easton's Bible Dictionary" },
  { file: "Smith%27s%20Bible%20Dictionary.jsonl", local: "smith.jsonl", source: "Smith's Bible Dictionary" },
  { file: "Hitchcock%27s%20Bible%20Names%20Dictionary.jsonl", local: "hitchcock.jsonl", source: "Hitchcock's Bible Names" },
  { file: "TorreysTopicalTextbook.jsonl", local: "torrey.jsonl", source: "Torrey's Topical Textbook" },
]

interface RawLine {
  term: string
  definitions: string[]
}

function parseLines(text: string, source: string) {
  const merged = new Map<string, string>()
  let count = 0
  for (const line of text.split("\n")) {
    const t = line.trim()
    if (!t) continue
    let row: RawLine
    try {
      row = JSON.parse(t)
    } catch {
      continue
    }
    const term = (row.term || "").trim()
    if (!term) continue
    const def = (row.definitions || []).join("\n\n").trim()
    if (!def) continue
    const prev = merged.get(term)
    merged.set(term, prev ? `${prev}\n\n---\n\n${def}` : def)
    count++
  }
  const rows = Array.from(merged.entries()).map(([term, definition]) => ({
    term,
    source,
    definition,
  }))
  console.log(`[${source}] parsed ${count} lines -> ${rows.length} unique terms`)
  return rows
}

async function fetchSource(file: string, local: string, source: string) {
  const localPath = join(LOCAL_DIR, local)
  if (existsSync(localPath)) {
    return parseLines(readFileSync(localPath, "utf8"), source)
  }
  const res = await fetch(`${HF}/${file}`, { redirect: "follow" })
  if (!res.ok) throw new Error(`fetch ${source} failed: ${res.status}`)
  return parseLines(await res.text(), source)
}

export async function seedDictionaries() {
  const existing = await prisma.dictionaryEntry.count()
  if (existing > 0) {
    console.log(`dictionary_entries already has ${existing} rows, skipping seed.`)
    return existing
  }
  const all: { term: string; source: string; definition: string }[] = []
  for (const s of SOURCES) {
    const rows = await fetchSource(s.file, s.local, s.source)
    all.push(...rows)
  }
  console.log(`Total rows to insert: ${all.length}`)

  const CHUNK = 1000
  let inserted = 0
  for (let i = 0; i < all.length; i += CHUNK) {
    const batch = all.slice(i, i + CHUNK)
    const res = await prisma.dictionaryEntry.createMany({
      data: batch,
      skipDuplicates: true,
    })
    inserted += res.count
    process.stdout.write(`\r  inserted ${inserted}/${all.length}`)
  }
  console.log(`\nDone. Inserted ${inserted} new entries.`)
  return inserted
}
