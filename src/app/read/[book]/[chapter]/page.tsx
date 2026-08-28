import { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { prisma } from '@/lib/db'
import { resolveBibleBook, getBookViName } from '@/lib/utils'
import { VersionMultiSelector } from '@/components/reader/version-multi-selector'
import { BibleNav } from '@/components/layout/bible-nav'
import { CommentaryPanel } from '@/components/reader/commentary-panel'
import { BibleReader } from '@/components/reader/bible-reader'

interface PageProps {
  params: Promise<{ book: string; chapter: string }>
  searchParams: Promise<{ versions?: string }>
}

export const metadata: Metadata = {
  title: 'Đọc Kinh Thánh | Scriptlex',
  description: 'Không gian đọc Kinh Thánh với nhiều bản dịch song song và đọc tự động (audio).',
}

const getPublicVersions = unstable_cache(
  () => prisma.bibleVersion.findMany({ where: { public: true }, orderBy: { ordinal: 'asc' } }),
  ['public-versions'],
  { revalidate: 86400 },
)

async function getReadChapter(book: string, chapterNum: number, codes: string[]) {
  return unstable_cache(
    async () => {
      const bibleBook = await resolveBibleBook(prisma, book)
      if (!bibleBook) return null
      const [verses, translations, prevChapter, nextChapter] = await Promise.all([
        prisma.verse.findMany({
          where: { bookId: bibleBook.id, chapter: chapterNum },
          orderBy: { verse: 'asc' },
          select: { verse: true },
        }),
        prisma.verseTranslation.findMany({
          where: { bookId: bibleBook.id, chapter: chapterNum, versionId: { in: codes } },
          select: { verse: true, versionId: true, text: true },
        }),
        prisma.verse.findFirst({ where: { bookId: bibleBook.id, chapter: chapterNum - 1 }, select: { chapter: true } }),
        prisma.verse.findFirst({ where: { bookId: bibleBook.id, chapter: chapterNum + 1 }, select: { chapter: true } }),
      ])

      const byVerse = new Map<number, Record<string, string>>()
      for (const t of translations) {
        if (!byVerse.has(t.verse)) byVerse.set(t.verse, {})
        byVerse.get(t.verse)![t.versionId] = t.text
      }
      const readerVerses = verses.map((v) => ({ verse: v.verse, texts: byVerse.get(v.verse) ?? {} }))
      return {
        bibleBook: { id: bibleBook.id, name: bibleBook.name, abbreviation: bibleBook.abbreviation },
        readerVerses,
        prevChapter,
        nextChapter,
      }
    },
    ['read-chapter', book, String(chapterNum), codes.join(',')],
    { revalidate: 3600 },
  )()
}

export default async function ReadPage({ params, searchParams }: PageProps) {
  const { book, chapter } = await params
  const { versions: versionsParam } = await searchParams
  const cookieStore = await cookies()
  const chapterNum = parseInt(chapter, 10)
  if (isNaN(chapterNum)) notFound()

  const allVersions = await getPublicVersions()
  const paramCodes = (versionsParam || cookieStore.get('scriptlex_read_versions')?.value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  const selectedCodes = paramCodes.filter((c) => allVersions.some((v) => v.id === c))
  const codes = selectedCodes.length ? selectedCodes : ['VI1934', 'KJV'].filter((c) => allVersions.some((v) => v.id === c))

  const data = await getReadChapter(book, chapterNum, codes)
  if (!data) notFound()
  const { bibleBook, readerVerses, prevChapter, nextChapter } = data

  const selectedVersions = codes
    .map((c) => allVersions.find((v) => v.id === c)!)
    .filter(Boolean)
    .map((v) => ({ code: v.id, name: v.name, abbreviation: v.abbreviation, language: v.language }))

  const versionsForSelector = allVersions.map((v) => ({ code: v.id, name: v.name, abbreviation: v.abbreviation, language: v.language }))

  return (
    <div className="container py-6 md:py-8">
      <nav className="mb-4 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href="/interlinear" className="hover:text-foreground transition-colors">Kinh Thánh</Link></li>
          <li aria-hidden="true">/</li>
          <li><Link href={`/interlinear/${bibleBook.abbreviation}`} className="hover:text-foreground transition-colors">{getBookViName(bibleBook.name)}</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Chương {chapterNum}</li>
        </ol>
      </nav>

      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{getBookViName(bibleBook.name)} {chapterNum}</h1>
          <p className="text-sm text-muted-foreground">Đọc Kinh Thánh — nhiều bản dịch song song</p>
        </div>
        <div className="flex items-center gap-2">
          <BibleNav variant="button" />
          <VersionMultiSelector
            versions={versionsForSelector}
            selected={selectedVersions.map((v) => v.code)}
            book={bibleBook.abbreviation}
            chapter={chapterNum}
          />
        </div>
      </div>

      <BibleReader
        book={bibleBook.name}
        bookAbbrev={bibleBook.abbreviation}
        chapter={chapterNum}
        verses={readerVerses}
        versions={selectedVersions}
        navigation={{ prevChapter: prevChapter?.chapter ?? null, nextChapter: nextChapter?.chapter ?? null }}
      />

      <CommentaryPanel book={bibleBook.name} chapter={chapterNum} />
    </div>
  )
}
