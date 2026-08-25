export const dynamic = "force-dynamic"
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { formatStrongNumber, parseStrongNumber, getLanguageLabel, getLanguageCode } from '@/lib/utils'
import { WordStudyClient } from './word-study-client'

interface PageProps {
  params: Promise<{ strongNumber: string }>
}

async function getWordStudyData(strongNumber: string) {
  const parsed = parseStrongNumber(strongNumber)
  if (!parsed) return null
  
  const formatted = formatStrongNumber(strongNumber)
  
  const entry = await prisma.strongEntry.findUnique({
    where: { strongNumber: formatted },
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
      }
    }
  })
  
  if (!entry) return null

  const [totalVerses, books, firstOccurrence, lastOccurrence, verseWords] = await Promise.all([
    prisma.verseWord.count({ where: { strongNumber: formatted } }),
    prisma.verseWord.findMany({
      where: { strongNumber: formatted },
      select: { book: true },
      distinct: ['book']
    }),
    prisma.verseWord.findFirst({
      where: { strongNumber: formatted },
      orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }, { wordOrder: 'asc' }]
    }),
    prisma.verseWord.findFirst({
      where: { strongNumber: formatted },
      orderBy: [{ book: 'desc' }, { chapter: 'desc' }, { verse: 'desc' }, { wordOrder: 'desc' }]
    }),
    prisma.verseWord.findMany({
      where: { strongNumber: formatted },
      take: 20,
      orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }]
    })
  ])

  const lookups = verseWords.map((vw) => ({ bookId: vw.book, chapter: vw.chapter, verse: vw.verse }))
  const verses = lookups.length
    ? await prisma.verse.findMany({ where: { OR: lookups } })
    : []
  const verseMap = new Map(verses.map((v) => [`${v.bookId}-${v.chapter}-${v.verse}`, v.text]))
  const verseTexts = verseWords.map((vw) => {
    const text = verseMap.get(`${vw.book}-${vw.chapter}-${vw.verse}`)
    return text ? { ...vw, verseText: text } : vw
  })

  const morphologyBreakdown = entry.morphology.map(m => ({
    parsing: m.parsings,
    count: m.count,
    tense: m.tense,
    voice: m.voice,
    mood: m.mood,
    case: m.case_,
    number: m.number,
    person: m.person,
    gender: m.gender
  }))

  return {
    entry,
    stats: {
      totalVerses,
      books: books.map(b => b.book),
      firstOccurrence: firstOccurrence ? { book: firstOccurrence.book, chapter: firstOccurrence.chapter, verse: firstOccurrence.verse } : null,
      lastOccurrence: lastOccurrence ? { book: lastOccurrence.book, chapter: lastOccurrence.chapter, verse: lastOccurrence.verse } : null
    },
    sampleVerses: verseTexts,
    morphologyBreakdown,
    relatedWords: entry.crossRefs,
    reverseRelatedWords: entry.crossRefTargets
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { strongNumber } = await params
  const parsed = parseStrongNumber(strongNumber)
  if (!parsed) return { title: 'Không tìm thấy' }
  
  const formatted = formatStrongNumber(strongNumber)
  const entry = await prisma.strongEntry.findUnique({
    where: { strongNumber: formatted },
    select: { transliteration: true, definition: true, language: true }
  })
  
  if (!entry) return { title: `${formatted} - Không tìm thấy` }
  
  return {
    title: `${formatted} — Khảo cứu từ vựng: ${entry.transliteration} | Scriptlex`,
    description: `Khảo cứu chuyên sâu ${getLanguageLabel(entry.language)}: ${entry.definition.substring(0, 150)}...`,
    openGraph: {
      title: `${formatted} — Khảo cứu từ vựng: ${entry.transliteration}`,
      description: entry.definition.substring(0, 150),
      type: 'article',
    }
  }
}

export default async function WordStudyPage({ params }: PageProps) {
  const { strongNumber } = await params
  const data = await getWordStudyData(strongNumber)
  
  if (!data) {
    notFound()
  }

  const formattedNumber = formatStrongNumber(strongNumber)
  const langLabel = getLanguageLabel(data.entry.language)
  const langCode = getLanguageCode(data.entry.language)

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><a href="/" className="hover:text-foreground transition-colors">Trang chủ</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/word-study" className="hover:text-foreground transition-colors">Khảo cứu từ vựng</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">{formattedNumber}</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {formattedNumber} <span className="text-primary">—</span> {data.entry.transliteration}
        </h1>
        <p className="mt-2 text-muted-foreground">
          Khảo cứu chuyên sâu từ vựng {langLabel} · Xuất hiện {data.stats.totalVerses} lần
        </p>
      </div>

      <WordStudyClient
        entry={data.entry}
        stats={data.stats}
        sampleVerses={data.sampleVerses}
        morphologyBreakdown={data.morphologyBreakdown}
        relatedWords={data.relatedWords}
        reverseRelatedWords={data.reverseRelatedWords}
      />
    </div>
  )
}