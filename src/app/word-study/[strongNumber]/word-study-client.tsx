"use client"

import { cn, getBookAbbreviation, getBookViName, getLanguageLabel, TENSE_LABELS, VOICE_LABELS, MOOD_LABELS, CASE_LABELS, NUMBER_LABELS, PERSON_LABELS, GENDER_LABELS } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { BookOpen, Copy, Hash, BarChart, Network, BookMarked, ArrowRight } from "lucide-react"
import { useState } from "react"
import { AiAnalysisSection } from "@/components/ai/ai-analysis-section"

interface MorphologyBreakdown {
  parsing: string
  count: number
  tense?: string | null
  voice?: string | null
  mood?: string | null
  case?: string | null
  number?: string | null
  person?: string | null
  gender?: string | null
}

interface WordStudyClientProps {
  entry: {
    strongNumber: string
    language: 'HEBREW' | 'GREEK'
    transliteration: string
    pronunciation?: string | null
    etymology?: string | null
    definition: string
    kjvDef?: string | null
    outlineBiblicalUsage?: string | null
    thayersDef?: string | null
    bdbDef?: string | null
    lsjDef?: string | null
    derivation?: string | null
    tdk?: string | null
    gkNumber?: string | null
  }
  stats: {
    totalVerses: number
    books: string[]
    firstOccurrence: { book: string; chapter: number; verse: number } | null
    lastOccurrence: { book: string; chapter: number; verse: number } | null
  }
  sampleVerses: Array<{
    book: string
    chapter: number
    verse: number
    wordOrder: number
    transliteration: string
    verseText?: string
  }>
  morphologyBreakdown: MorphologyBreakdown[]
  relatedWords: Array<{
    type: string
    note?: string | null
    targetEntry: {
      strongNumber: string
      transliteration: string
      definition: string
      language: 'HEBREW' | 'GREEK'
    }
  }>
  reverseRelatedWords: Array<{
    type: string
    note?: string | null
    sourceEntry: {
      strongNumber: string
      transliteration: string
      definition: string
      language: 'HEBREW' | 'GREEK'
    }
  }>
}

const TYPE_LABELS: Record<string, string> = {
  RELATED: 'Liên quan',
  SYNONYM: 'Đồng nghĩa',
  ANTONYM: 'Trái nghĩa',
  ROOT: 'Gốc từ',
  DERIVATIVE: 'Từ phái sinh',
  COMPOUND: 'Từ ghép',
  CITATION: 'Trích dẫn',
  ALLUSION: 'Ngụ ý',
}

export function WordStudyClient({ entry, stats, sampleVerses, morphologyBreakdown, relatedWords, reverseRelatedWords }: WordStudyClientProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'morphology' | 'usage' | 'network' | 'verses' | 'ai'>('overview')
  const [copied, setCopied] = useState<string | null>(null)

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const totalMorphCount = morphologyBreakdown.reduce((sum, m) => sum + m.count, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Badge variant="outline" className={cn("text-lg px-4 py-2", entry.language === 'HEBREW' ? 'border-green-500 text-green-700 dark:border-green-400 dark:text-green-400' : 'border-blue-500 text-blue-700 dark:border-blue-400 dark:text-blue-400')}>
            {entry.strongNumber}
          </Badge>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{entry.transliteration}</h1>
            {entry.pronunciation && (
              <p className="text-muted-foreground font-mono text-sm">/{entry.pronunciation}/</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(entry.strongNumber, 'Số Strongs')} aria-label="Sao chép số Strongs">
            <Hash className="h-4 w-4 mr-1" />
            {copied === 'Số Strongs' ? 'Đã copy!' : 'Copy'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(entry.transliteration, 'Transliteration')} aria-label="Copy transliteration">
            <Copy className="h-4 w-4 mr-1" />
            {copied === 'Transliteration' ? 'Đã copy!' : 'Copy'}
          </Button>
          <Link href={`/strongs/${entry.strongNumber}`}>
            <Button variant="secondary" size="sm" className="gap-1">
              <BookOpen className="h-4 w-4" />
              Xem trang Strongs
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{stats.totalVerses.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">Lần xuất hiện</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{stats.books.length}</p>
            <p className="text-sm text-muted-foreground">Các sách có chứa từ này</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{morphologyBreakdown.length}</p>
            <p className="text-sm text-muted-foreground">Dạng hình thái</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-primary">{relatedWords.length + reverseRelatedWords.length}</p>
            <p className="text-sm text-muted-foreground">Tham chiếu chéo</p>
          </CardContent>
        </Card>
      </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'overview' | 'morphology' | 'usage' | 'network' | 'verses' | 'ai')} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-6 gap-1">
          <TabsTrigger value="overview" className="text-center leading-tight">Tổng quan</TabsTrigger>
          <TabsTrigger value="morphology" className="text-center leading-tight">Hình thái</TabsTrigger>
          <TabsTrigger value="usage" className="text-center leading-tight">Cách dùng</TabsTrigger>
          <TabsTrigger value="network" className="text-center leading-tight">Mạng lưới từ vựng</TabsTrigger>
          <TabsTrigger value="verses" className="text-center leading-tight">Các câu Kinh Thánh</TabsTrigger>
          <TabsTrigger value="ai" className="text-center leading-tight">AI</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="prose prose-sm max-w-none">
             <h3 className="font-semibold mb-2">Định nghĩa Strongs</h3>
            <p className="whitespace-pre-wrap">{entry.definition}</p>
          </div>

          {entry.kjvDef && (
            <div className="prose prose-sm max-w-none border-l-4 border-primary pl-4">
              <h3 className="font-semibold mb-2">Cách dịch KJV</h3>
              <p className="whitespace-pre-wrap">{entry.kjvDef}</p>
            </div>
          )}

          {entry.outlineBiblicalUsage && (
            <div className="prose prose-sm max-w-none border-l-4 border-green-500 pl-4">
              <h3 className="font-semibold mb-2">Cách dùng trong Kinh Thánh (Outline)</h3>
              <p className="whitespace-pre-wrap">{entry.outlineBiblicalUsage}</p>
            </div>
          )}

          {entry.thayersDef && (
            <div className="prose prose-sm max-w-none border-l-4 border-blue-500 pl-4">
              <h3 className="font-semibold mb-2">Thayer&apos;s Greek Lexicon</h3>
              <p className="whitespace-pre-wrap">{entry.thayersDef}</p>
            </div>
          )}

          {entry.bdbDef && (
            <div className="prose prose-sm max-w-none border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold mb-2">Brown-Driver-Briggs Hebrew Lexicon</h3>
              <p className="whitespace-pre-wrap">{entry.bdbDef}</p>
            </div>
          )}

          {entry.lsjDef && (
            <div className="prose prose-sm max-w-none border-l-4 border-purple-500 pl-4">
              <h3 className="font-semibold mb-2">Liddell-Scott-Jones Greek Lexicon</h3>
              <p className="whitespace-pre-wrap">{entry.lsjDef}</p>
            </div>
          )}

          {entry.etymology && (
            <div className="prose prose-sm max-w-none border-l-4 border-gray-500 pl-4">
              <h3 className="font-semibold mb-2">Nguồn gốc từ vựng (Etymology)</h3>
              <p className="whitespace-pre-wrap">{entry.etymology}</p>
            </div>
          )}

          {entry.derivation && (
            <div className="prose prose-sm max-w-none border-l-4 border-gray-500 pl-4">
              <h3 className="font-semibold mb-2">Sự phái sinh (Derivation)</h3>
              <p className="whitespace-pre-wrap">{entry.derivation}</p>
            </div>
          )}

          {entry.tdk && (
            <div className="prose prose-sm max-w-none border-l-4 border-gray-500 pl-4">
              <h3 className="font-semibold mb-2">TDK (Từ điển Thần học Tân Ước)</h3>
              <p className="whitespace-pre-wrap">{entry.tdk}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="morphology" className="space-y-6">
          {morphologyBreakdown.length > 0 ? (
            <div className="space-y-6">
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-primary">{totalMorphCount}</p>
                    <p className="text-sm text-muted-foreground">Tổng phân tích</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-primary">{morphologyBreakdown.length}</p>
                    <p className="text-sm text-muted-foreground">Dạng khác nhau</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6 text-center">
                    <p className="text-3xl font-bold text-primary">{morphologyBreakdown[0]?.parsing || 'N/A'}</p>
                    <p className="text-sm text-muted-foreground">Dạng phổ biến nhất</p>
                  </CardContent>
                </Card>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Parsing</th>
                      <th className="pb-2 pr-4 font-medium text-right">Số lần</th>
                       <th className="pb-2 pr-4 font-medium">% Tổng</th>
                      <th className="pb-2 pr-4 font-medium">Thì</th>
                      <th className="pb-2 pr-4 font-medium">Thể</th>
                      <th className="pb-2 pr-4 font-medium">Cách</th>
                      <th className="pb-2 pr-4 font-medium">Cách thức</th>
                      <th className="pb-2 pr-4 font-medium">Số</th>
                      <th className="pb-2 pr-4 font-medium">Ngôi</th>
                      <th className="pb-2 font-medium">Giống</th>
                    </tr>
                  </thead>
                  <tbody>
                    {morphologyBreakdown.map((m, i) => (
                      <tr key={i} className="border-b hover:bg-accent/50">
                        <td className="py-2 pr-4 font-mono font-medium">{m.parsing}</td>
                        <td className="py-2 pr-4 text-right font-medium">{m.count}</td>
                        <td className="py-2 pr-4 text-right">
                          <span className="text-xs text-muted-foreground">
                            {((m.count / totalMorphCount) * 100).toFixed(1)}%
                          </span>
                        </td>
                        <td className="py-2 pr-4">
                          {m.tense && <Badge variant="outline" className="text-xs">{TENSE_LABELS[m.tense] || m.tense}</Badge>}
                        </td>
                        <td className="py-2 pr-4">
                          {m.voice && <Badge variant="outline" className="text-xs">{VOICE_LABELS[m.voice] || m.voice}</Badge>}
                        </td>
                        <td className="py-2 pr-4">
                          {m.mood && <Badge variant="outline" className="text-xs">{MOOD_LABELS[m.mood] || m.mood}</Badge>}
                        </td>
                        <td className="py-2 pr-4">
                          {m.case && <Badge variant="outline" className="text-xs">{CASE_LABELS[m.case] || m.case}</Badge>}
                        </td>
                        <td className="py-2 pr-4">
                          {m.number && <Badge variant="outline" className="text-xs">{NUMBER_LABELS[m.number] || m.number}</Badge>}
                        </td>
                        <td className="py-2 pr-4">
                          {m.person && <Badge variant="outline" className="text-xs">{PERSON_LABELS[m.person] || m.person}</Badge>}
                        </td>
                        <td className="py-2">
                          {m.gender && <Badge variant="outline" className="text-xs">{GENDER_LABELS[m.gender] || m.gender}</Badge>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Phân bố theo Thì (Tense)</h3>
                <div className="flex flex-wrap gap-2">
                  {['PRESENT', 'IMPERFECT', 'FUTURE', 'AORIST', 'PERFECT', 'PLUPERFECT', 'FUTURE_PERFECT'].map(tense => {
                    const count = morphologyBreakdown.filter(m => m.tense === tense).reduce((sum, m) => sum + m.count, 0)
                    if (count === 0) return null
                    return (
                      <Badge key={tense} variant="secondary" className="text-xs">
                        {TENSE_LABELS[tense] || tense}: {count}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Phân bố theo Thể (Voice)</h3>
                <div className="flex flex-wrap gap-2">
                  {['ACTIVE', 'MIDDLE', 'PASSIVE', 'MIDDLE_PASSIVE'].map(voice => {
                    const count = morphologyBreakdown.filter(m => m.voice === voice).reduce((sum, m) => sum + m.count, 0)
                    if (count === 0) return null
                    return (
                      <Badge key={voice} variant="secondary" className="text-xs">
                        {VOICE_LABELS[voice] || voice}: {count}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">Phân bố theo Cách (Mood)</h3>
                <div className="flex flex-wrap gap-2">
                  {['INDICATIVE', 'SUBJUNCTIVE', 'OPTATIVE', 'IMPERATIVE', 'INFINITIVE', 'PARTICIPLE'].map(mood => {
                    const count = morphologyBreakdown.filter(m => m.mood === mood).reduce((sum, m) => sum + m.count, 0)
                    if (count === 0) return null
                    return (
                      <Badge key={mood} variant="secondary" className="text-xs">
                        {MOOD_LABELS[mood] || mood}: {count}
                      </Badge>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Không có dữ liệu hình thái học cho từ này</p>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Thống kê xuất hiện theo sách</h3>
            <div className="space-y-2">
              {stats.books.slice(0, 20).map((book) => {
                const count = sampleVerses.filter(v => v.book === book).length
                const percentage = ((count / stats.totalVerses) * 100).toFixed(1)
                return (
                  <div key={book} className="flex items-center gap-4">
                    <span className="w-20 text-sm text-muted-foreground font-mono">{getBookViName(book)}</span>
                    <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${percentage}%` }} />
                    </div>
                    <span className="w-16 text-right text-sm font-mono">{count} ({percentage}%)</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Lần xuất hiện đầu tiên và cuối cùng</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              {stats.firstOccurrence && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Lần đầu tiên</p>
                     <p className="font-semibold">{getBookViName(stats.firstOccurrence.book)} {stats.firstOccurrence.chapter}:{stats.firstOccurrence.verse}</p>
                    <Link href={`/interlinear/${getBookAbbreviation(stats.firstOccurrence.book)}/${stats.firstOccurrence.chapter}`} className="text-primary text-sm hover:underline">
                      Xem bối cảnh
                    </Link>
                  </CardContent>
                </Card>
              )}
              {stats.lastOccurrence && (
                <Card>
                  <CardContent className="pt-6">
                    <p className="text-sm text-muted-foreground mb-1">Lần cuối cùng</p>
                     <p className="font-semibold">{getBookViName(stats.lastOccurrence.book)} {stats.lastOccurrence.chapter}:{stats.lastOccurrence.verse}</p>
                    <Link href={`/interlinear/${getBookAbbreviation(stats.lastOccurrence.book)}/${stats.lastOccurrence.chapter}`} className="text-primary text-sm hover:underline">
                      Xem bối cảnh
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Các sách có chứa từ này ({stats.books.length})</h3>
            <div className="flex flex-wrap gap-2">
              {stats.books.map((book) => (
                <Badge key={book} variant="outline" className="text-xs">
                  {getBookViName(book)}
                </Badge>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="network" className="space-y-6">
          {(relatedWords.length > 0 || reverseRelatedWords.length > 0) ? (
            <>
              {relatedWords.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Từ có liên quan ({relatedWords.length})
                  </h3>
                  <div className="space-y-3">
                    {relatedWords.map((ref, i) => (
                      <WordNetworkCard key={i} cr={ref} isReverse={false} />
                    ))}
                  </div>
                </div>
              )}
              {reverseRelatedWords.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 mt-6 flex items-center gap-2">
                    <Network className="h-5 w-5" />
                    Được tham chiếu từ ({reverseRelatedWords.length})
                  </h3>
                  <div className="space-y-3">
                    {reverseRelatedWords.map((ref, i) => (
                      <WordNetworkCard key={i} cr={ref} isReverse={true} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">Không có dữ liệu mạng lưới từ vựng cho từ này</p>
          )}

          <div className="border-t pt-6">
            <h3 className="font-semibold mb-4">Gợi ý khảo cứu sâu hơn</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="border-l-4 border-primary">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BookMarked className="h-4 w-4" />
                    Xem từ gốc (Root)
                  </h4>
                  <p className="text-sm text-muted-foreground">Tìm từ gốc trong derivation/etymology để hiểu nguồn gốc lịch sử</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-green-500">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    So sánh đồng nghĩa
                  </h4>
                  <p className="text-sm text-muted-foreground">So sánh cách dùng các từ đồng nghĩa trong các bối cảnh khác nhau</p>
                </CardContent>
              </Card>
              <Card className="border-l-4 border-blue-500">
                <CardContent className="pt-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <BarChart className="h-4 w-4" />
                    Phân bố hình thái
                  </h4>
                  <p className="text-sm text-muted-foreground">Phân tích tại sao tác giả chọn dạng hình thái cụ thể này</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="verses" className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Thí dụ cách dùng ({sampleVerses.length} trong {stats.totalVerses} câu)</h3>
            {sampleVerses.length > 0 ? (
              <div className="space-y-3">
                {sampleVerses.map((sv, i) => (
                  <Card key={i} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-4 pb-4 pr-4 pl-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-24 text-right text-sm text-muted-foreground font-mono">
                          {getBookViName(sv.book)} {sv.chapter}:{sv.verse}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium mb-1">
                            {getBookViName(sv.book)} {sv.chapter}:{sv.verse}
                          </p>
                          {sv.verseText && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{sv.verseText}</p>
                          )}
                        </div>
                        <Link href={`/interlinear/${getBookAbbreviation(sv.book)}/${sv.chapter}`} className="flex-shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Không có câu thí dụ</p>
            )}
          </div>

          {stats.totalVerses > sampleVerses.length && (
            <div className="text-center pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-4">Và {stats.totalVerses - sampleVerses.length} câu khác...</p>
              <Button variant="outline" asChild>
                <Link href={`/strongs/${entry.strongNumber}#usage`}>
                  Xem tất cả trên trang Strongs <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai" className="space-y-6">
          <AiAnalysisSection
            strongNumber={entry.strongNumber}
            language={entry.language}
            transliteration={entry.transliteration}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

interface CrossRefEntry {
  strongNumber: string
  transliteration: string
  definition: string
  language: "HEBREW" | "GREEK"
}
interface CrossRef {
  type: string
  note?: string | null
  targetEntry?: CrossRefEntry
  sourceEntry?: CrossRefEntry
}

function WordNetworkCard({ cr, isReverse }: { cr: CrossRef; isReverse: boolean }) {
  const target = isReverse ? cr.sourceEntry : cr.targetEntry
  if (!target) return null
  const typeLabel = TYPE_LABELS[cr.type] || cr.type
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4 pr-4 pl-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {typeLabel}
            </Badge>
            <div>
              <Link href={`/strongs/${target.strongNumber}`} className="font-mono font-medium hover:text-primary transition-colors">
                {target.strongNumber} — {target.transliteration}
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-1">{target.definition}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-xs whitespace-nowrap">
            {getLanguageLabel(target.language)}
          </Badge>
        </div>
        {cr.note && (
          <p className="mt-2 text-xs text-muted-foreground italic">{cr.note}</p>
        )}
      </CardContent>
    </Card>
  )
}