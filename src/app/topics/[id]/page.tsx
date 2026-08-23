import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { TopicsClient } from './topics-client'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateStaticParams() {
  const topics = await prisma.topicalEntry.findMany({ select: { id: true } })
  return topics.map((t) => ({ id: t.id }))
}

async function getTopicData(id: string) {
  const topic = await prisma.topicalEntry.findUnique({
    where: { id },
    include: {
      references: {
        orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verseStart: 'asc' }],
        take: 200
      }
    }
  })

  if (!topic) return null

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

  const relatedTopics = await prisma.topicalEntry.findMany({
    where: {
      id: { not: id },
      references: {
        some: {
          book: { in: topic.references.map(r => r.book) }
        }
      }
    },
    take: 10,
    include: {
      _count: { select: { references: true } }
    }
  })

  return { topic, references: refsWithText, relatedTopics }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const topic = await prisma.topicalEntry.findUnique({
    where: { id },
    select: { topic: true, description: true }
  })
  
  if (!topic) return { title: 'Không tìm thấy' }
  
  return {
    title: `${topic.topic} — Chủ đề Kinh Thánh | BibleLex`,
    description: topic.description || `Khảo cứu chủ đề ${topic.topic} với các câu Kinh Thánh liên quan.`,
    openGraph: {
      title: `${topic.topic} — Chủ đề Kinh Thánh`,
      description: topic.description?.substring(0, 150) || `Khảo cứu chủ đề ${topic.topic}`,
      type: 'article',
    }
  }
}

export default async function TopicPage({ params }: PageProps) {
  const { id } = await params
  const data = await getTopicData(id)
  
  if (!data) {
    notFound()
  }

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><a href="/" className="hover:text-foreground transition-colors">Trang chủ</a></li>
          <li aria-hidden="true">/</li>
          <li><a href="/topics" className="hover:text-foreground transition-colors">Chủ đề</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">{data.topic.topic}</li>
        </ol>
      </nav>

      <div className="mb-6">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{data.topic.topic}</h1>
        {data.topic.description && (
          <p className="mt-2 text-lg text-muted-foreground">{data.topic.description}</p>
        )}
      </div>

      <TopicsClient
        topic={data.topic}
        references={data.references}
        relatedTopics={data.relatedTopics}
      />
    </div>
  )
}