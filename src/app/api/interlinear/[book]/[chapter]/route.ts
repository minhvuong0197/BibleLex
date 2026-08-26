import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { resolveBibleBook } from '@/lib/utils'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ book: string; chapter: string }> }
) {
  try {
    const { book, chapter } = await params
    const chapterNum = parseInt(chapter, 10)
    
    if (isNaN(chapterNum)) {
      return NextResponse.json(
        { error: 'Invalid chapter number' },
        { status: 400 }
      )
    }

    // Find the book
    const bibleBook = await resolveBibleBook(prisma, book)

    if (!bibleBook) {
      return NextResponse.json(
        { error: `Book "${book}" not found` },
        { status: 404 }
      )
    }

    // Get verses for this chapter
    const verses = await prisma.verse.findMany({
      where: { bookId: bibleBook.id, chapter: chapterNum },
      orderBy: { verse: 'asc' }
    })

    if (verses.length === 0) {
      return NextResponse.json(
        { error: `Chapter ${chapterNum} not found in ${bibleBook.name}` },
        { status: 404 }
      )
    }

    // Get all verse words for these verses
    const verseWords = await prisma.verseWord.findMany({
      where: {
        book: bibleBook.name,
        chapter: chapterNum,
        verse: { in: verses.map(v => v.verse) }
      },
      orderBy: [{ verse: 'asc' }, { wordOrder: 'asc' }],
      include: {
        strongEntry: true
      }
    })

    // Group words by verse
    const wordsByVerse = new Map<number, typeof verseWords>()
    for (const word of verseWords) {
      if (!wordsByVerse.has(word.verse)) {
        wordsByVerse.set(word.verse, [])
      }
      wordsByVerse.get(word.verse)!.push(word)
    }

    // Morphology is aggregated per Strong's number (not per word), so fetch it
    // separately and attach the most common form for each word's strong number.
    const strongNumbers = Array.from(
      new Set(verseWords.map(w => w.strongNumber).filter((s): s is string => s !== null))
    )
    const morphRows = strongNumbers.length
      ? await prisma.morphology.findMany({
          where: { strongNumber: { in: strongNumbers } },
          orderBy: { count: 'desc' }
        })
      : []
    const morphByStrong = new Map<string, typeof morphRows[number]>()
    for (const m of morphRows) {
      if (!morphByStrong.has(m.strongNumber)) morphByStrong.set(m.strongNumber, m)
    }

    const normalizeMorphology = (m: typeof morphRows[number] | undefined) =>
      m
        ? {
            parsings: m.parsings,
            tense: m.tense,
            voice: m.voice,
            mood: m.mood,
            case: m.case_,
            number: m.number,
            person: m.person,
            gender: m.gender
          }
        : null

    const interlinearVerses = verses.map(verse => ({
      book: bibleBook.name,
      chapter: verse.chapter,
      verse: verse.verse,
      text: verse.text,
      vietnameseText: verse.vietnameseText ?? null,
      words: (wordsByVerse.get(verse.verse) || []).map(w => ({
        wordOrder: w.wordOrder,
        hebrewGreek: w.hebrewGreek,
        transliteration: w.transliteration,
        strongNumber: w.strongNumber,
        parsing: w.parsing,
        english: w.english,
        strongEntry: w.strongEntry,
        morphology: w.strongNumber ? normalizeMorphology(morphByStrong.get(w.strongNumber)) : null
      }))
    }))

    // Get adjacent chapters for navigation
    const [prevChapter, nextChapter] = await Promise.all([
      prisma.verse.findFirst({
        where: { bookId: bibleBook.id, chapter: chapterNum - 1 },
        select: { chapter: true }
      }),
      prisma.verse.findFirst({
        where: { bookId: bibleBook.id, chapter: chapterNum + 1 },
        select: { chapter: true }
      })
    ])

    return NextResponse.json({
      book: {
        id: bibleBook.id,
        name: bibleBook.name,
        abbreviation: bibleBook.abbreviation,
        testament: bibleBook.testament,
        chapters: bibleBook.chapters
      },
      chapter: chapterNum,
      verses: interlinearVerses,
      navigation: {
        prevChapter: prevChapter?.chapter ?? null,
        nextChapter: nextChapter?.chapter ?? null
      }
    })
  } catch (error) {
    console.error('Error fetching interlinear:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}