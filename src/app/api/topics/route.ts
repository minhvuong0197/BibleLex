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
      const refsWithText = await Promise.all(
        topic.references.map(async (ref) => {
          const bookId = bookIdByName.get(ref.book)
          if (!bookId) return { ...ref, verseText: undefined }
          const verse = await prisma.verse.findFirst({
            where: { bookId, chapter: ref.chapter, verse: ref.verseStart }
          })
          return { ...ref, verseText: verse?.text }
        })
      )

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