import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { InterlinearViewer } from '@/components/interlinear/interlinear-viewer'
import { prisma } from '@/lib/db'
import { resolveBibleBook, getBookViName } from '@/lib/utils'

interface PageProps {
  params: Promise<{ book: string; chapter: string }>
}

async function getInterlinearData(book: string, chapter: number) {
  const bibleBook = await resolveBibleBook(prisma, book)

  if (!bibleBook) return null

  const verses = await prisma.verse.findMany({
    where: { bookId: bibleBook.id, chapter },
    orderBy: { verse: 'asc' }
  })

  if (verses.length === 0) return null

  const verseWords = await prisma.verseWord.findMany({
    where: {
      book: bibleBook.name,
      chapter,
      verse: { in: verses.map(v => v.verse) }
    },
    orderBy: [{ verse: 'asc' }, { wordOrder: 'asc' }],
    include: {
      strongEntry: true
    }
  })

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

  const wordsByVerse = new Map<number, typeof verseWords>()
  for (const word of verseWords) {
    if (!wordsByVerse.has(word.verse)) {
      wordsByVerse.set(word.verse, [])
    }
    wordsByVerse.get(word.verse)!.push(word)
  }

  const interlinearVerses = verses.map(verse => ({
    book: bibleBook.name,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text,
    words: (wordsByVerse.get(verse.verse) || []).map(w => ({
      wordOrder: w.wordOrder,
      hebrewGreek: w.hebrewGreek,
      transliteration: w.transliteration,
      strongNumber: w.strongNumber,
      parsing: w.parsing,
      english: w.english,
      strongEntry: w.strongEntry ? {
        strongNumber: w.strongEntry.strongNumber,
        transliteration: w.strongEntry.transliteration,
        definition: w.strongEntry.definition,
        language: w.strongEntry.language
      } : null,
      morphology: w.strongNumber && morphByStrong.has(w.strongNumber)
        ? (() => {
            const m = morphByStrong.get(w.strongNumber)!
            return {
              parsings: m.parsings,
              tense: m.tense,
              voice: m.voice,
              mood: m.mood,
              case: m.case_,
              number: m.number,
              person: m.person,
              gender: m.gender
            }
          })()
        : null
    }))
  }))

  const [prevChapter, nextChapter] = await Promise.all([
    prisma.verse.findFirst({
      where: { bookId: bibleBook.id, chapter: chapter - 1 },
      select: { chapter: true }
    }),
    prisma.verse.findFirst({
      where: { bookId: bibleBook.id, chapter: chapter + 1 },
      select: { chapter: true }
    })
  ])

  return {
    book: {
      id: bibleBook.id,
      name: bibleBook.name,
      abbreviation: bibleBook.abbreviation,
      testament: bibleBook.testament,
      chapters: bibleBook.chapters
    },
    chapter,
    verses: interlinearVerses,
    navigation: {
      prevChapter: prevChapter?.chapter ?? null,
      nextChapter: nextChapter?.chapter ?? null
    }
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { book, chapter } = await params
  const chapterNum = parseInt(chapter, 10)
  
  const bibleBook = await resolveBibleBook(prisma, book)

  if (!bibleBook) return { title: 'Không tìm thấy' }
  
  return {
    title: `${bibleBook.name} ${chapterNum} - Kinh Thánh đối chiếu | BibleLex`,
    description: `Kinh Thánh đối chiếu ${bibleBook.name} chương ${chapterNum} với phân tích từ vựng nguyên ngữ Hê-bơ-rơ/Hy-lạp.`,
    openGraph: {
      title: `${bibleBook.name} ${chapterNum} - Kinh Thánh đối chiếu`,
      description: `Kinh Thánh đối chiếu ${bibleBook.name} chương ${chapterNum}`,
      type: 'article',
    }
  }
}

export default async function InterlinearPage({ params }: PageProps) {
  const { book, chapter } = await params
  const chapterNum = parseInt(chapter, 10)
  
  if (isNaN(chapterNum)) {
    notFound()
  }

  const data = await getInterlinearData(book, chapterNum)
  
  if (!data) {
    notFound()
  }

  return (
    <div className="container py-6 md:py-8">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><a href="/" className="hover:text-foreground transition-colors">Trang chủ</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/interlinear" className="hover:text-foreground transition-colors">Kinh Thánh đối chiếu</a></li>
          <li aria-hidden="true">/</li>
          <li><a href={`/interlinear/${data.book.abbreviation}`} className="hover:text-foreground transition-colors">{getBookViName(data.book.name)}</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Chương {data.chapter}</li>
        </ol>
      </nav>

      <InterlinearViewer
        book={data.book.name}
        chapter={data.chapter}
        verses={data.verses}
        language={data.book.testament === 'OLD' ? 'HEBREW' : 'GREEK'}
        navigation={data.navigation}
      />
    </div>
  )
}