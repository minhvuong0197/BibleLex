import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseStrongNumber, formatStrongNumber, getBookViName, BOOK_VI } from '@/lib/utils'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  try {
    const q = searchParams.get('q')?.trim()
    const type = searchParams.get('type') || 'all'
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (!q || q.length < 1) {
      return NextResponse.json({ results: [] })
    }

    const results: any[] = []

    // Strong's number search
    if (type === 'all' || type === 'strong') {
      const parsed = parseStrongNumber(q)
      if (parsed) {
        const formatted = formatStrongNumber(q)
        const entries = await prisma.strongEntry.findMany({
          where: { strongNumber: formatted },
          take: 1
        })
        for (const entry of entries) {
          results.push({
            type: 'strong',
            id: entry.strongNumber,
            title: `${entry.strongNumber} — ${entry.transliteration}`,
            snippet: entry.definition.substring(0, 150),
            data: entry
          })
        }
      } else {
        // Search by transliteration or definition
        const entries = await prisma.strongEntry.findMany({
          where: {
            OR: [
              { transliteration: { contains: q } },
              { definition: { contains: q } },
              { kjvDef: { contains: q } }
            ]
          },
          take: limit,
          orderBy: { strongNumber: 'asc' }
        })
        for (const entry of entries) {
          results.push({
            type: 'strong',
            id: entry.strongNumber,
            title: `${entry.strongNumber} — ${entry.transliteration}`,
            snippet: entry.definition.substring(0, 150),
            data: entry
          })
        }
      }
    }

    // Verse search (if looking for reference like "John 3:16")
    if (type === 'all' || type === 'verse') {
        const verseMatch = q.match(/^(.+)\s+(\d+):(\d+)(?:-(\d+))?$/)
      if (verseMatch) {
        const [, bookName, chapter, verseStart, verseEnd] = verseMatch
        const trimmed = bookName.trim()
        let book = await prisma.bibleBook.findFirst({
          where: { name: { contains: trimmed } }
        })
        if (!book) {
          // Cho phép tra cứu theo tên sách tiếng Việt (TTHĐ 2010)
          const englishName = Object.keys(BOOK_VI).find(
            (k) => BOOK_VI[k] === trimmed ||
              BOOK_VI[k].toLowerCase().startsWith(trimmed.toLowerCase())
          )
          if (englishName) {
            book = await prisma.bibleBook.findFirst({ where: { name: englishName } })
          }
        }
        if (book) {
           const verses = await prisma.verse.findMany({
             where: {
               bookId: book.id,
               chapter: parseInt(chapter),
               verse: { gte: parseInt(verseStart), lte: parseInt(verseEnd || verseStart) }
             },
             orderBy: { verse: 'asc' },
             include: { book: true }
           })
          for (const verse of verses) {
            results.push({
              type: 'verse',
              id: `${book.abbreviation} ${chapter}:${verse.verse}`,
              title: `${getBookViName(book.name)} ${chapter}:${verse.verse}`,
              snippet: verse.text.substring(0, 200),
              data: verse
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
            { topic: { contains: q } },
            { description: { contains: q } }
          ]
        },
        take: limit,
        include: {
          references: { take: 3 }
        }
      })
      for (const topic of topics) {
        results.push({
          type: 'topic',
          id: topic.id,
          title: topic.topic,
          snippet: topic.description?.substring(0, 150) || `${topic.references.length} references`,
          data: topic
        })
      }
    }

    return NextResponse.json({ results: results.slice(0, limit) })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}