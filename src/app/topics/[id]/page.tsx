import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/db'
import { TopicsClient } from './topics-client'

interface PageProps {
  params: Promise<{ id: string }>
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