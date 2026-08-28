import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseStrongNumber, formatStrongNumber, getBookViName, BOOK_VI } from '@/lib/utils'
import type { Prisma } from '@prisma/client'

type SearchResult = {
  type: 'strong' | 'verse' | 'topic'
  id: string
  title: string
  snippet: string
  data: unknown
}

// ---------------------------------------------------------------------------
// Boolean query parsing: supports AND (space), OR, -term / NOT term, "phrase".
// ---------------------------------------------------------------------------
function tokenize(q: string): string[] {
  const out: string[] = []
  const re = /"[^"]+"|\S+/g
  let m: RegExpExecArray | null
  while ((m = re.exec(q)) !== null) out.push(m[0])
  return out
}

function termCond(term: string, field: 'text' | 'vietnameseText'): Prisma.VerseWhereInput {
  const t = term.replace(/^"|"$/g, '')
  return { [field]: { contains: t, mode: 'insensitive' } }
}

function buildVerseTextWhere(q: string): Prisma.VerseWhereInput {
  const tokens = tokenize(q)
  const groups: { and: string[]; not: string[] }[] = []
  let cur = { and: [] as string[], not: [] as string[] }
  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i]
    if (/^OR$/i.test(t)) {
      if (cur.and.length || cur.not.length) groups.push(cur)
      cur = { and: [], not: [] }
      continue
    }
    if (t.startsWith('-')) {
      cur.not.push(t.slice(1))
      continue
    }
    if (/^NOT$/i.test(t) && i + 1 < tokens.length) {
      cur.not.push(tokens[++i])
      continue
    }
    cur.and.push(t)
  }
  if (cur.and.length || cur.not.length) groups.push(cur)

  const orGroups = groups.map((g) => {
    const andConds: Prisma.VerseWhereInput[] = g.and.map((term) => ({
      OR: [termCond(term, 'text'), termCond(term, 'vietnameseText')],
    }))
    const notConds: Prisma.VerseWhereInput[] = g.not.map((term) => ({
      OR: [termCond(term, 'text'), termCond(term, 'vietnameseText')],
    }))
    const grp: Prisma.VerseWhereInput = { AND: andConds }
    if (notConds.length) grp.NOT = notConds
    return grp
  })
  if (orGroups.length === 0) return {}
  if (orGroups.length === 1) return orGroups[0]
  return { OR: orGroups }
}

async function buildScope(request: NextRequest): Promise<Prisma.VerseWhereInput> {
  const sp = request.nextUrl.searchParams
  const bookParam = sp.get('book')
  const testParam = sp.get('testament')
  const where: Prisma.VerseWhereInput = {}
  let bookIds: string[] | null = null
  if (bookParam) {
    const bk = await prisma.bibleBook.findFirst({
      where: {
        OR: [
          { abbreviation: { equals: bookParam, mode: 'insensitive' } },
          { name: { equals: bookParam, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    })
    if (bk) bookIds = [bk.id]
  } else if (testParam === 'OT' || testParam === 'NT') {
    const testamentEnum = testParam === 'OT' ? 'OLD' : 'NEW'
    const bs = await prisma.bibleBook.findMany({
      where: { testament: testamentEnum },
      select: { id: true },
    })
    bookIds = bs.map((b) => b.id)
  }
  if (bookIds) where.bookId = bookIds.length ? { in: bookIds } : { equals: '__none__' }
  return where
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  try {
    const q = searchParams.get('q')?.trim()
    const type = searchParams.get('type') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!q || q.length < 1) {
      return NextResponse.json({ results: [] })
    }

    const results: SearchResult[] = []

    // Strong's number search
    if (type === 'all' || type === 'strong') {
      const parsed = parseStrongNumber(q)
      if (parsed) {
        const formatted = formatStrongNumber(q)
        const entries = await prisma.strongEntry.findMany({
          where: { strongNumber: formatted },
          take: 1,
        })
        for (const entry of entries) {
          results.push({
            type: 'strong',
            id: entry.strongNumber,
            title: `${entry.strongNumber} — ${entry.transliteration}`,
            snippet: entry.definition.substring(0, 150),
            data: entry,
          })
        }
      } else {
        const strongWhere: Prisma.StrongEntryWhereInput = {
          OR: [
            { transliteration: { contains: q, mode: 'insensitive' } },
            { definition: { contains: q, mode: 'insensitive' } },
            { kjvDef: { contains: q, mode: 'insensitive' } },
          ],
        }
        const lang = searchParams.get('lang')
        if (lang === 'HEBREW' || lang === 'GREEK') strongWhere.language = lang
        const entries = await prisma.strongEntry.findMany({
          where: strongWhere,
          take: limit,
          orderBy: { strongNumber: 'asc' },
        })
        for (const entry of entries) {
          results.push({
            type: 'strong',
            id: entry.strongNumber,
            title: `${entry.strongNumber} — ${entry.transliteration}`,
            snippet: entry.definition.substring(0, 150),
            data: entry,
          })
        }
      }
    }

    // Verse search
    if (type === 'all' || type === 'verse') {
      const strongParsed = parseStrongNumber(q)
      const explicitStrong = searchParams.get('strong')?.trim()
      const lemmaNumber = explicitStrong
        ? formatStrongNumber(explicitStrong)
        : strongParsed
          ? formatStrongNumber(q)
          : null

      if (lemmaNumber) {
        // Lemma search: find verses containing this Strong's number
        const rawWords = await prisma.verseWord.findMany({
          where: { strongNumber: lemmaNumber },
          take: 1000,
          orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }],
          select: { book: true, chapter: true, verse: true, hebrewGreek: true, transliteration: true },
        })
        const seen = new Set<string>()
        const words: typeof rawWords = []
        for (const w of rawWords) {
          const key = `${w.book}-${w.chapter}-${w.verse}`
          if (seen.has(key)) continue
          seen.add(key)
          words.push(w)
          if (words.length >= limit) break
        }
        for (const w of words) {
          results.push({
            type: 'verse',
            id: `${w.book} ${w.chapter}:${w.verse}`,
            title: `${w.book} ${w.chapter}:${w.verse}`,
            snippet: `${w.hebrewGreek} (${w.transliteration}) — bấm để xem đối chiếu nguyên ngữ`,
            data: {
              lemma: true,
              book: w.book,
              chapter: w.chapter,
              verse: w.verse,
              hebrewGreek: w.hebrewGreek,
              transliteration: w.transliteration,
            },
          })
        }
      } else {
        const verseMatch = q.match(/^(.+)\s+(\d+):(\d+)(?:-(\d+))?$/)
        if (verseMatch) {
          const [, bookName, chapter, verseStart, verseEnd] = verseMatch
          const trimmed = bookName.trim()
          let book = await prisma.bibleBook.findFirst({
            where: { name: { contains: trimmed } },
          })
          if (!book) {
            const englishName = Object.keys(BOOK_VI).find(
              (k) => BOOK_VI[k] === trimmed || BOOK_VI[k].toLowerCase().startsWith(trimmed.toLowerCase())
            )
            if (englishName) {
              book = await prisma.bibleBook.findFirst({ where: { name: englishName } })
            }
          }
          if (book) {
            const scope = await buildScope(request)
            const verses = await prisma.verse.findMany({
              where: {
                bookId: book.id,
                chapter: parseInt(chapter),
                verse: { gte: parseInt(verseStart), lte: parseInt(verseEnd || verseStart) },
                ...scope,
              },
              orderBy: { verse: 'asc' },
              include: { book: true },
            })
            for (const verse of verses) {
              results.push({
                type: 'verse',
                id: `${verse.book?.abbreviation} ${chapter}:${verse.verse}`,
                title: `${getBookViName(verse.book?.name || '')} ${chapter}:${verse.verse}`,
                snippet: (verse.vietnameseText || verse.text).substring(0, 200),
                data: verse,
              })
            }
          }
        } else {
          const scope = await buildScope(request)
          const textWhere = buildVerseTextWhere(q)
          const verses = await prisma.verse.findMany({
            where: { ...scope, ...textWhere },
            take: limit,
            orderBy: [{ bookId: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }],
            include: { book: true },
          })
          for (const verse of verses) {
            results.push({
              type: 'verse',
              id: `${verse.book?.abbreviation} ${verse.chapter}:${verse.verse}`,
              title: `${getBookViName(verse.book?.name || '')} ${verse.chapter}:${verse.verse}`,
              snippet: (verse.vietnameseText || verse.text).substring(0, 200),
              data: verse,
            })
          }
        }
      }
    }

    // Topic search
    if (type === 'all' || type === 'topic') {
      const topics = await prisma.topicalEntry.findMany({
        where: {
          OR: [
            { topic: { contains: q, mode: 'insensitive' } },
            { description: { contains: q, mode: 'insensitive' } },
          ],
        },
        take: limit,
        include: { references: { take: 3 } },
      })
      for (const topic of topics) {
        results.push({
          type: 'topic',
          id: topic.id,
          title: topic.topic,
          snippet: topic.description?.substring(0, 150) || `${topic.references.length} references`,
          data: topic,
        })
      }
    }

    return NextResponse.json({ results: results.slice(0, limit) })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
