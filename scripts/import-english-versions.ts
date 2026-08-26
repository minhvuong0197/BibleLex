import { PrismaClient } from '@prisma/client'
import { execFileSync } from 'node:child_process'
import 'dotenv/config'

const prisma = new PrismaClient()

const VERSION_META: Record<string, { name: string; abbreviation: string; year?: number; url: string }> = {
  ASV: {
    name: 'American Standard Version',
    abbreviation: 'ASV',
    year: 1901,
    url: 'https://raw.githubusercontent.com/midvash/bible-data/main/versions/en/asv/asv.json',
  },
  WEB: {
    name: 'World English Bible',
    abbreviation: 'WEB',
    year: 2000,
    url: 'https://raw.githubusercontent.com/midvash/bible-data/main/versions/en/web/web.json',
  },
}

function normalize(s: string): string {
  return s.normalize('NFD').toLowerCase().replace(/[^a-z]/g, '')
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchJson(url: string): Promise<any> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const out = execFileSync('curl', ['-sL', '-m', '60', '-A', 'ScriptlexImporter/1.0', url], {
        maxBuffer: 64 * 1024 * 1024,
        encoding: 'utf8',
      })
      return JSON.parse(out)
    } catch (e) {
      console.warn(`! download failed (${url}), retry ${attempt + 1}`)
      await sleep(500)
    }
  }
  throw new Error(`Cannot download ${url}`)
}

async function upsertVerses(rows: { bookId: string; chapter: number; verse: number; versionId: string; text: string }[]) {
  if (rows.length === 0) return
  const seen = new Map<string, { bookId: string; chapter: number; verse: number; versionId: string; text: string }>()
  for (const r of rows) seen.set(`${r.bookId}:${r.chapter}:${r.verse}`, r)
  const uniq = [...seen.values()]
  const placeholders: string[] = []
  const params: unknown[] = []
  let i = 1
  for (const r of uniq) {
    placeholders.push(`(gen_random_uuid(), $${i++}, $${i++}, $${i++}, $${i++}, $${i++})`)
    params.push(r.bookId, r.chapter, r.verse, r.versionId, r.text)
  }
  const sql =
    `INSERT INTO "verse_translations" ("id","book_id","chapter","verse","version_id","text") VALUES ${placeholders.join(', ')} ` +
    `ON CONFLICT ("book_id","chapter","verse","version_id") DO UPDATE SET "text"=EXCLUDED."text", "updated_at"=now()`
  await prisma.$executeRawUnsafe(sql, ...params)
}

async function main() {
  const codes = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(VERSION_META)
  const dbBooks = await prisma.bibleBook.findMany({ select: { id: true, name: true, abbreviation: true } })
  const abbrMap = new Map<string, string>()
  const nameMap = new Map<string, string>()
  for (const b of dbBooks) {
    abbrMap.set(b.abbreviation, b.id)
    nameMap.set(normalize(b.name), b.id)
  }

  for (const code of codes) {
    const meta = VERSION_META[code]
    if (!meta) {
      console.warn(`! unknown code ${code}`)
      continue
    }
    await prisma.bibleVersion.upsert({
      where: { id: code },
      update: { name: meta.name, abbreviation: meta.abbreviation, language: 'en', year: meta.year ?? null, source: 'midvash/bible-data (public domain)' },
      create: {
        id: code,
        name: meta.name,
        abbreviation: meta.abbreviation,
        language: 'en',
        year: meta.year ?? null,
        source: 'midvash/bible-data (public domain)',
        note: `Tiếng Anh - ${meta.name} (public domain)`,
        ordinal: 200,
      },
    })

    const data = await fetchJson(meta.url)
    const entries: any[] = Object.values(data.books)
    let total = 0
    for (const entry of entries) {
      const bookId = abbrMap.get(entry.book) || nameMap.get(normalize(entry.englishName))
      if (!bookId) {
        console.warn(`! skip book ${entry.book} / ${entry.englishName}`)
        continue
      }
      const rows: { bookId: string; chapter: number; verse: number; versionId: string; text: string }[] = []
      for (const [chStr, chObj] of Object.entries(entry.chapters)) {
        const chapter = Number(chStr)
        const verses = (chObj as any).verses || []
        for (const v of verses) {
          if (v && v.text) rows.push({ bookId, chapter, verse: v.number, versionId: code, text: v.text })
        }
      }
      try {
        await upsertVerses(rows)
      } catch (e) {
        console.error(`! upsert failed ${code}:${entry.book} (${String((e as Error).message).slice(0, 100)})`)
      }
      total += rows.length
    }
    console.log(`DONE ${code}: ${total} verses`)
  }
}

main()
  .catch((e) => {
    console.error('IMPORT FAILED', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
