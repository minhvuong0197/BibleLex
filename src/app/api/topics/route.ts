import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('id')
    const q = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

    if (topicId) {
      const topic = await prisma.topicalEntry.findUnique({
        where: { id: topicId },
        include: {
          references: {
            orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verseStart: 'asc' }],
            take: 100
          }
        }
      })

      if (!topic) {
        return NextResponse.json({ error: 'Topic not found' }, { status: 404 })
      }

      // Get verse texts for references
      const bookRows = await prisma.bibleBook.findMany({
        select: { id: true, name: true },
      })
      const bookIdByName = new Map(bookRows.map((b) => [b.name, b.id]))
      const lookups = topic.references
        .map((ref) => {
          const bookId = bookIdByName.get(ref.book)
          return bookId ? { bookId, chapter: ref.chapter, verse: ref.verseStart } : null
        })
        .filter((l): l is { bookId: string; chapter: number; verse: number } => l !== null)
      const verses = lookups.length
        ? await prisma.verse.findMany({ where: { OR: lookups } })
        : []
      const verseMap = new Map(verses.map((v) => [`${v.bookId}-${v.chapter}-${v.verse}`, v.text]))
      const refsWithText = topic.references.map((ref) => {
        const bookId = bookIdByName.get(ref.book)
        const key = bookId ? `${bookId}-${ref.chapter}-${ref.verseStart}` : ''
        return { ...ref, verseText: (bookId && verseMap.get(key)) || null }
      })

      return NextResponse.json({ topic, references: refsWithText })
    }

    if (q) {
      const topics = await prisma.topicalEntry.findMany({
        where: {
          OR: [
            { topic: { contains: q } },
            { description: { contains: q } }
          ]
        },
        take: limit,
        orderBy: { topic: 'asc' }
      })
      return NextResponse.json({ topics })
    }

    const topics = await prisma.topicalEntry.findMany({
      orderBy: { topic: 'asc' },
      take: limit
    })
    return NextResponse.json({ topics })
  } catch (error) {
    console.error('Error fetching topics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}