import { PrismaClient } from '@prisma/client'
import { BOOK_VI } from '../src/lib/utils'

const prisma = new PrismaClient()

const HTTLVN_ABBREVS = (
  '1co 1gi 1phi 1sa 1su 1te 1ti 1vua ' +
  '2co 2gi 2phi 2sa 2su 2te 2ti 2vua 3gi ' +
  'ag am ap ca cac ch co cong da dan eph es et exe exo ' +
  'ga gi gia gie gio gion giop gios giu ha he kh le lu ma mac mat mi na ne nha ' +
  'os phi phil phu ro ru sa so thi tit tr xa xu'
).split(/\s+/)

const VERSION_META: Record<string, { name: string; abbreviation: string; year?: number }> = {
  VI1934: { name: 'Truyền Thống', abbreviation: 'TT', year: 1925 },
  RVV11: { name: 'Hiệu Đính 2010', abbreviation: 'RVV11', year: 2010 },
  BD2011: { name: 'Bản Dịch 2011', abbreviation: 'BD2011', year: 2011 },
  BPT: { name: 'Bản Phổ Thông', abbreviation: 'BPT' },
  NVB: { name: 'Bản Dịch Mới', abbreviation: 'NVB', year: 2002 },
  BDY: { name: 'Bản Diễn Ý', abbreviation: 'BDY' },
}

function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCharCode(parseInt(d, 10)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&emsp;/g, ' ')
}

function normalizeVi(s: string): string {
  return s
    .normalize('NFD')
    .toLowerCase()
    .replace(/[^a-z]/g, '')
}

const VI_TO_EN = new Map<string, string>()
for (const [en, vi] of Object.entries(BOOK_VI)) {
  VI_TO_EN.set(normalizeVi(vi), en)
}

function stripHtml(html: string): string {
  return decodeEntities(
    html
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim(),
  )
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

import { execFileSync } from 'node:child_process'

async function fetchText(url: string): Promise<string> {
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      return execFileSync('curl', ['-sL', '-m', '25', '-A', 'ScriptlexImporter/1.0', url], {
        maxBuffer: 32 * 1024 * 1024,
        encoding: 'utf8',
      })
    } catch (e) {
      lastErr = e
      await sleep(300)
    }
  }
  console.warn(`! fetch failed after retries: ${url} (${String((lastErr as Error)?.message || lastErr).slice(0, 80)})`)
  return ''
}

async function buildAbbrevToBook(): Promise<Map<string, string>> {
  const map = new Map<string, string>()
  for (const ab of HTTLVN_ABBREVS) {
    const html = await fetchText(`https://kinhthanh.httlvn.org/doc-kinh-thanh/${ab}/1?v=VI1934`)
    const m = html.match(/<title>([^<]+)<\/title>/i)
    if (!m) {
      console.warn(`! no title for ${ab}`)
      continue
    }
    const raw = decodeEntities(m[1]).split('|')[0].trim().replace(/\s+\d+\s*$/, '')
    const en = VI_TO_EN.get(normalizeVi(raw))
    if (!en) {
      console.warn(`! cannot map httlvn book "${raw}" (${ab})`)
      continue
    }
    const book = await prisma.bibleBook.findFirst({ where: { name: en }, select: { id: true, chapters: true } })
    if (!book) {
      console.warn(`! no BibleBook for ${en} (${ab})`)
      continue
    }
    map.set(ab, book.id)
    console.log(`  map ${ab} -> ${en} (${book.id}, ${book.chapters} ch)`)
    await sleep(15)
  }
  return map
}

function parseChapter(html: string, abbrev: string, chapter: number): { verse: number; text: string }[] {
  const out: { verse: number; text: string }[] = []
  const re = /class="verse ([a-z0-9]+)_(\d+)_(\d+)"/g
  const hits: { verse: number; idx: number }[] = []
  let m: RegExpExecArray | null
  while ((m = re.exec(html))) {
    const ab = m[1]
    const ch = parseInt(m[2], 10)
    const vs = parseInt(m[3], 10)
    if (ab === abbrev && ch === chapter) hits.push({ verse: vs, idx: m.index })
  }
  for (let i = 0; i < hits.length; i++) {
    const startTagEnd = html.indexOf('>', hits[i].idx) + 1
    let depth = 1
    let pos = startTagEnd
    while (pos < html.length) {
      if (html.startsWith('<span', pos)) {
        depth++
        pos += 5
      } else if (html.startsWith('</span>', pos)) {
        depth--
        pos += 7
        if (depth === 0) break
      } else {
        pos++
      }
    }
    const raw = html.slice(startTagEnd, pos)
    let text = stripHtml(raw)
    // Bỏ số câu ở đầu (từ thẻ <sup>) và ký hiệu chú thích ở cuối (⚓, †, …)
    text = text.replace(/^\s*\d+\s*/, '').replace(/[⚓†*✡◊⁕•]+$/, '').trim()
    if (text) out.push({ verse: hits[i].verse, text })
  }
  return out
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

async function mapLimit<T, U>(items: T[], limit: number, fn: (t: T) => Promise<U>): Promise<U[]> {
  const results: U[] = new Array(items.length)
  let idx = 0
  async function worker() {
    while (idx < items.length) {
      const cur = idx++
      results[cur] = await fn(items[cur])
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

async function main() {
  const codes = process.argv.slice(2)
  const versionCodes = codes.length ? codes : ['VI1934']
  console.log('Import versions:', versionCodes.join(', '))

  const abbrevToBook = await buildAbbrevToBook()
  console.log(`Mapped ${abbrevToBook.size}/${HTTLVN_ABBREVS.length} books`)

  const books = await prisma.bibleBook.findMany({ select: { id: true, name: true, abbreviation: true, chapters: true } })
  const bookById = new Map(books.map((b) => [b.id, b]))

  for (const code of versionCodes) {
    const meta = VERSION_META[code] ?? { name: code, abbreviation: code }
    await prisma.bibleVersion.upsert({
      where: { id: code },
      update: { name: meta.name, abbreviation: meta.abbreviation, year: meta.year ?? null, source: 'kinhthanh.httlvn.org' },
      create: {
        id: code,
        name: meta.name,
        abbreviation: meta.abbreviation,
        language: 'vi',
        year: meta.year ?? null,
        source: 'kinhthanh.httlvn.org',
        note: `Nguồn: HTTLVN (kinhthanh.httlvn.org)`,
        ordinal: 0,
      },
    })

    let total = 0
    for (const [ab, bookId] of abbrevToBook) {
      const chapters = bookById.get(bookId)!.chapters
      const chapterNums = Array.from({ length: chapters }, (_, i) => i + 1)
      const results = await mapLimit(chapterNums, 8, async (ch) => {
        const html = await fetchText(`https://kinhthanh.httlvn.org/doc-kinh-thanh/${ab}/${ch}?v=${code}`)
        const vs = parseChapter(html, ab, ch)
        return vs.map((v) => ({ bookId, chapter: ch, verse: v.verse, versionId: code, text: v.text }))
      })
      const rows = results.flat()
      try {
        await upsertVerses(rows)
      } catch (e) {
        console.error(`  ! upsert failed for ${code}:${ab} (${String((e as Error).message).slice(0, 100)})`)
      }
      total += rows.length
      console.log(`  ${code}: ${ab} -> ${rows.length} verses (cum ${total})`)
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
