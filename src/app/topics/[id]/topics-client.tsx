import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getBookAbbreviation, getBookViName } from "@/lib/utils"
import { BookOpen, ArrowRight, Layers } from "lucide-react"

interface TopicReference {
  id: string
  book: string
  chapter: number
  verseStart: number
  verseEnd: number | null
  note?: string | null
  verseText?: string | null
}

interface RelatedTopic {
  id: string
  topic: string
  description?: string | null
  _count?: { references: number }
}

interface TopicsClientProps {
  topic: { topic: string; description?: string | null }
  references: TopicReference[]
  relatedTopics: RelatedTopic[]
}

export function TopicsClient({ topic, references, relatedTopics }: TopicsClientProps) {
  const refs = [...references].sort(
    (a, b) => a.book.localeCompare(b.book) || a.chapter - b.chapter || a.verseStart - b.verseStart
  )

  return (
    <div className="space-y-8">
      {refs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BookOpen className="h-5 w-5 text-primary" />
               Các câu Kinh Thánh liên quan ({refs.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {refs.map((ref) => {
              const refLabel = `${getBookViName(ref.book)} ${ref.chapter}:${ref.verseStart}${
                ref.verseEnd && ref.verseEnd !== ref.verseStart ? `-${ref.verseEnd}` : ""
              }`
              return (
                <Card key={ref.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-24 text-right text-sm text-muted-foreground font-mono">
                        {refLabel}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium mb-1">{refLabel}</p>
                        {ref.verseText && (
                          <p className="text-sm text-muted-foreground line-clamp-3">{ref.verseText}</p>
                        )}
                        {ref.note && <p className="text-xs text-muted-foreground italic mt-1">{ref.note}</p>}
                      </div>
                      <Link href={`/interlinear/${getBookAbbreviation(ref.book)}/${ref.chapter}`} className="flex-shrink-0">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </CardContent>
        </Card>
      )}

      {refs.length === 0 && (
        <Card>
          <CardContent className="pt-8 pb-8 text-center text-muted-foreground">
            Chưa có câu Kinh Thánh nào được gán cho chủ đề này.
          </CardContent>
        </Card>
      )}

      {relatedTopics.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Chủ đề liên quan
          </h2>
          <div className="flex flex-wrap gap-2">
            {relatedTopics.map((t) => (
              <Link key={t.id} href={`/topics/${t.id}`}>
                <Badge variant="outline" className="text-sm hover:bg-accent transition-colors">
                  {t.topic}
                  {t._count ? ` (${t._count.references})` : ""}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
