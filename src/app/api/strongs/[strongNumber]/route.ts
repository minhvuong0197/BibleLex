import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseStrongNumber, formatStrongNumber } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ strongNumber: string }> }
) {
  try {
    const { strongNumber } = await params
    const parsed = parseStrongNumber(strongNumber)
    
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid Strong\'s number format. Use G1234 or H1234' },
        { status: 400 }
      )
    }

    const formattedNumber = formatStrongNumber(strongNumber)
    
    const entry = await prisma.strongEntry.findUnique({
      where: { strongNumber: formattedNumber },
      include: {
        morphology: {
          orderBy: { count: 'desc' }
        },
        crossRefs: {
          include: { targetEntry: true },
          orderBy: { type: 'asc' }
        },
        crossRefTargets: {
          include: { sourceEntry: true },
          orderBy: { type: 'asc' }
        },
        verses: {
          take: 10,
          orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }],
          include: {
            // We'll fetch verse text separately if needed
          }
        }
      }
    })

    if (!entry) {
      return NextResponse.json(
        { error: `Strong's number ${formattedNumber} not found` },
        { status: 404 }
      )
    }

    // Get verse texts for the sample verses
    const verseWords = await prisma.verseWord.findMany({
      where: { strongNumber: formattedNumber },
      take: 5,
      orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }]
    })

    // Get verse texts
    const verseTexts = await Promise.all(
      verseWords.map(async (vw) => {
        const verse = await prisma.verse.findUnique({
          where: {
            bookId_chapter_verse: {
              bookId: vw.book,
              chapter: vw.chapter,
              verse: vw.verse
            }
          }
        })
        return verse ? { ...vw, verseText: verse.text } : vw
      })
    )

    // Get stats
    const [totalVerses, books, firstOccurrence, lastOccurrence] = await Promise.all([
      prisma.verseWord.count({ where: { strongNumber: formattedNumber } }),
      prisma.verseWord.findMany({
        where: { strongNumber: formattedNumber },
        select: { book: true },
        distinct: ['book']
      }),
      prisma.verseWord.findFirst({
        where: { strongNumber: formattedNumber },
        orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }, { wordOrder: 'asc' }]
      }),
      prisma.verseWord.findFirst({
        where: { strongNumber: formattedNumber },
        orderBy: [{ book: 'desc' }, { chapter: 'desc' }, { verse: 'desc' }, { wordOrder: 'desc' }]
      })
    ])

    return NextResponse.json({
      entry,
      sampleVerses: verseTexts,
      stats: {
        totalVerses,
        books: books.map(b => b.book),
        firstOccurrence: firstOccurrence ? { book: firstOccurrence.book, chapter: firstOccurrence.chapter, verse: firstOccurrence.verse } : null,
        lastOccurrence: lastOccurrence ? { book: lastOccurrence.book, chapter: lastOccurrence.chapter, verse: lastOccurrence.verse } : null
      }
    })
  } catch (error) {
    console.error('Error fetching Strong\'s entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}