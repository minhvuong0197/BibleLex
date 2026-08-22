import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { StrongsEntry } from '@/components/strongs/strongs-entry'
import { prisma } from '@/lib/db'
import { formatStrongNumber, parseStrongNumber, getLanguageLabel } from '@/lib/utils'

interface PageProps {
  params: Promise<{ strongNumber: string }>
}

async function getStrongEntry(strongNumber: string) {
  const parsed = parseStrongNumber(strongNumber)
  if (!parsed) return null
  
  const formatted = formatStrongNumber(strongNumber)

  const [entry, totalVerses, books, firstOccurrence, lastOccurrence, sampleVerses] = await Promise.all([
    prisma.strongEntry.findUnique({
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
    }),
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
      take: 10,
      orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }]
    })
  ])

  let verseTexts = sampleVerses
  if (sampleVerses.length > 0) {
    const verses = await prisma.verse.findMany({
      where: {
        OR: sampleVerses.map((vw) => ({
          bookId: vw.book,
          chapter: vw.chapter,
          verse: vw.verse,
        })),
      },
    })
    const verseMap = new Map(
      verses.map((v) => [`${v.bookId}-${v.chapter}-${v.verse}`, v.text])
    )
    verseTexts = sampleVerses.map((vw) => ({
      ...vw,
      verseText: verseMap.get(`${vw.book}-${vw.chapter}-${vw.verse}`),
    }))
  }

  const stats = {
    totalVerses,
    books: books.map(b => b.book),
    firstOccurrence: firstOccurrence ? { book: firstOccurrence.book, chapter: firstOccurrence.chapter, verse: firstOccurrence.verse } : null,
    lastOccurrence: lastOccurrence ? { book: lastOccurrence.book, chapter: lastOccurrence.chapter, verse: lastOccurrence.verse } : null
  }

  if (!entry) {
    if (totalVerses === 0) return null

    const language = parsed.lang === 'H' ? 'HEBREW' : 'GREEK'
    const placeholderEntry = {
      strongNumber: formatted,
      language,
      transliteration: formatted,
      pronunciation: null,
      etymology: null,
      definition: `Chưa có mục từ điển (Strongs ${formatted}) trong dữ liệu hiện tại. Từ này xuất hiện ${totalVerses} lần trong Kinh Thánh — xem các chỗ trích dẫn bên dưới.`,
      kjvDef: null,
      outlineBiblicalUsage: null,
      thayersDef: null,
      bdbDef: null,
      lsjDef: null,
      derivation: null,
      tdk: null,
      gkNumber: null,
      morphology: [],
      crossRefs: [],
      crossRefTargets: [],
    }
    return { entry: placeholderEntry, stats, sampleVerses: verseTexts }
  }

  return {
    entry,
    stats,
    sampleVerses: verseTexts
  }
}

const getCachedStrongEntry = unstable_cache(
  getStrongEntry,
  ['strongs-entry-v2'],
  { tags: ['strongs'], revalidate: 86400 }
)

async function getStrongEntryCached(strongNumber: string) {
  try {
    return await getCachedStrongEntry(strongNumber)
  } catch {
    return getStrongEntry(strongNumber)
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { strongNumber } = await params
  const parsed = parseStrongNumber(strongNumber)
  if (!parsed) return { title: 'Không tìm thấy' }
  
  const formatted = formatStrongNumber(strongNumber)
  const data = await getStrongEntryCached(strongNumber)
  if (!data) return { title: `${formatted} - Không tìm thấy` }
  
  const entry = data.entry
  const description = entry.definition?.substring(0, 150) ?? ''

  return {
    title: `${formatted} — ${entry.transliteration} | BibleLex`,
    description: `${getLanguageLabel(entry.language)}: ${description}...`,
    openGraph: {
      title: `${formatted} — ${entry.transliteration}`,
      description,
      type: 'article',
    }
  }
}

export default async function StrongsPage({ params }: PageProps) {
  const { strongNumber } = await params
  const data = await getStrongEntryCached(strongNumber)
  
  if (!data) {
    notFound()
  }

  const formattedNumber = formatStrongNumber(strongNumber)
  const langLabel = getLanguageLabel(data.entry.language)

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><a href="/" className="hover:text-foreground transition-colors">Trang chủ</a></li>
          <li aria-hidden="true">/</li>
           <li><a href="/strongs" className="hover:text-foreground transition-colors">Tra cứu Strongs</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">{formattedNumber}</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {formattedNumber} <span className="text-primary">—</span> {data.entry.transliteration}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {langLabel} · Xuất hiện {data.stats.totalVerses} lần trong {data.stats.books.length} sách Kinh Thánh
        </p>
      </div>

      <StrongsEntry
        entry={data.entry}
        stats={data.stats}
        sampleVerses={data.sampleVerses}
      />
    </div>
  )
}
