"use client"

import { cn, getLanguageLabel, getBookViName } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Link2, Hash, Loader2, Languages } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AiAnalysisSection } from "@/components/ai/ai-analysis-section"
import { useState } from "react"

interface StrongsEntryProps {
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
    vietnameseDef?: string | null
    derivation?: string | null
    tdk?: string | null
    gkNumber?: string | null
    morphology?: Array<{
      parsings: string
      count: number
      tense?: string | null
      voice?: string | null
      mood?: string | null
      case?: string | null
      number?: string | null
      person?: string | null
      gender?: string | null
    }>
    crossRefs?: Array<{
      type: string
      note?: string | null
      targetEntry: {
        strongNumber: string
        transliteration: string
        definition: string
        language: 'HEBREW' | 'GREEK'
      }
    }>
    crossRefTargets?: Array<{
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
    vietnameseText?: string | null
  }>
}

// Nhãn khi xem ở trang từ NGUỒN (hiển thị từ ĐÍCH): target là gốc/thành phần của từ này
const FORWARD_LABELS: Record<string, string> = {
  RELATED: 'Liên quan',
  SYNONYM: 'Đồng nghĩa',
  ANTONYM: 'Trái nghĩa',
  ROOT: 'Gốc từ',
  DERIVATIVE: 'Gốc từ',
  COMPOUND: 'Thành phần',
  CITATION: 'Xem / Tham khảo',
  ALLUSION: 'Ngụ ý',
}

// Nhãn khi xem ở trang từ ĐÍCH (hiển thị từ NGUỒN): source là từ phái sinh/từ ghép của từ này
const REVERSE_LABELS: Record<string, string> = {
  RELATED: 'Liên quan',
  SYNONYM: 'Đồng nghĩa',
  ANTONYM: 'Trái nghĩa',
  ROOT: 'Có gốc từ',
  DERIVATIVE: 'Từ phái sinh',
  COMPOUND: 'Từ ghép',
  CITATION: 'Trích dẫn bởi',
  ALLUSION: 'Được ngụ ý',
}

export function StrongsEntry({ entry, stats, sampleVerses }: StrongsEntryProps) {
  const [activeTab, setActiveTab] = useState<'definition' | 'morphology' | 'crossrefs' | 'usage' | 'ai'>('definition')
  const [copied, setCopied] = useState<string | null>(null)
  const [lexVi, setLexVi] = useState<Record<string, string>>({})
  const [lexBusy, setLexBusy] = useState<Record<string, boolean>>({})

  const translateLex = async (kind: 'thayer' | 'bdb' | 'lsj', source: string) => {
    if (lexVi[kind] || lexBusy[kind]) return
    setLexBusy((b) => ({ ...b, [kind]: true }))
    try {
      const res = await fetch(
        `/api/dictionary/translate?term=${encodeURIComponent(entry.strongNumber)}&source=${encodeURIComponent(source)}`
      )
      const data = await res.json()
      setLexVi((v) => ({ ...v, [kind]: data.vietnameseDef || '__NA__' }))
    } catch {
      setLexVi((v) => ({ ...v, [kind]: '__NA__' }))
    } finally {
      setLexBusy((b) => ({ ...b, [kind]: false }))
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const langLabel = getLanguageLabel(entry.language)

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
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(entry.strongNumber, 'mã')} aria-label={`Sao chép mã ${entry.strongNumber}`}>
            <Hash className="h-4 w-4 mr-1" />
            {copied === 'mã' ? 'Đã copy!' : 'Copy mã'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => copyToClipboard(window.location.href, 'liên kết')} aria-label="Sao chép liên kết">
            <Link2 className="h-4 w-4 mr-1" />
            {copied === 'liên kết' ? 'Đã copy!' : 'Copy liên kết'}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Ngôn ngữ</dt>
                <dd className="font-medium">{langLabel}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Xuất hiện</dt>
                <dd className="font-medium">{stats.totalVerses} lần trong {stats.books.length} sách</dd>
              </div>
              {stats.firstOccurrence && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Lần đầu</dt>
                  <dd className="font-medium">
                    {getBookViName(stats.firstOccurrence.book)} {stats.firstOccurrence.chapter}:{stats.firstOccurrence.verse}
                  </dd>
                </div>
              )}
              {stats.lastOccurrence && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Lần cuối</dt>
                  <dd className="font-medium">
                    {getBookViName(stats.lastOccurrence.book)} {stats.lastOccurrence.chapter}:{stats.lastOccurrence.verse}
                  </dd>
                </div>
              )}
              {entry.gkNumber && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">GK Number</dt>
                  <dd className="font-medium font-mono">{entry.gkNumber}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "definition" | "morphology" | "crossrefs" | "usage" | "ai")} className="w-full">
        <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5 gap-1">
          <TabsTrigger value="definition" className="text-center leading-tight">Định nghĩa</TabsTrigger>
          <TabsTrigger value="morphology" className="text-center leading-tight">Hình thái</TabsTrigger>
          <TabsTrigger value="crossrefs" className="text-center leading-tight">Tham chiếu chéo</TabsTrigger>
          <TabsTrigger value="usage" className="text-center leading-tight">Cách dùng</TabsTrigger>
          <TabsTrigger value="ai" className="text-center leading-tight">AI</TabsTrigger>
        </TabsList>

        <TabsContent value="definition" className="space-y-6">
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
            <h3 className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs">VI</span>
              Nghĩa tiếng Việt
            </h3>
            {entry.vietnameseDef ? (
              <p className="whitespace-pre-wrap text-[15px] leading-relaxed">{entry.vietnameseDef}</p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Chưa có bản dịch tiếng Việt cho mã này. (Đang cập nhật dữ liệu song ngữ.)
              </p>
            )}
          </div>

          <div className="prose prose-sm max-w-none">
             <h3 className="font-semibold mb-2">Định nghĩa Strongs (tiếng Anh)</h3>
            <p className="whitespace-pre-wrap">{entry.definition || 'Chưa có định nghĩa cho mục này.'}</p>
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
              <LexTranslate kind="thayer" source="Thayer's Greek Lexicon" vi={lexVi.thayer} busy={lexBusy.thayer} onTranslate={translateLex} />
            </div>
          )}

          {entry.bdbDef && (
            <div className="prose prose-sm max-w-none border-l-4 border-amber-500 pl-4">
              <h3 className="font-semibold mb-2">Brown-Driver-Briggs Hebrew Lexicon</h3>
              <p className="whitespace-pre-wrap">{entry.bdbDef}</p>
              <LexTranslate kind="bdb" source="Brown-Driver-Briggs Hebrew Lexicon" vi={lexVi.bdb} busy={lexBusy.bdb} onTranslate={translateLex} />
            </div>
          )}

          {entry.lsjDef && (
            <details className="prose prose-sm max-w-none border-l-4 border-purple-500 pl-4 rounded">
              <summary className="cursor-pointer select-none py-2 font-semibold">
                Liddell-Scott-Jones Greek Lexicon (LSJ đầy đủ — nhấn để mở)
              </summary>
              <p className="whitespace-pre-wrap pt-2">{entry.lsjDef}</p>
              <LexTranslate kind="lsj" source="Liddell-Scott-Jones Greek Lexicon" vi={lexVi.lsj} busy={lexBusy.lsj} onTranslate={translateLex} />
            </details>
          )}

          <p className="mt-6 text-xs text-muted-foreground">
            Nguồn lexicon gốc: STEPBible (Thayer / Abbott-Smith, BDB, LSJ) — giấy phép CC BY 4.0.
          </p>

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
          {entry.morphology && entry.morphology.length > 0 ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Phân tích hình thái học từ {entry.morphology.reduce((sum, m) => sum + m.count, 0)} lần xuất hiện
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Parsing</th>
                      <th className="pb-2 pr-4 font-medium text-right">Số lần</th>
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
                    {entry.morphology.map((m, i) => (
                      <tr key={i} className="border-b hover:bg-accent/50">
                        <td className="py-2 pr-4 font-mono font-medium">{m.parsings}</td>
                        <td className="py-2 pr-4 text-right font-medium">{m.count}</td>
                        <td className="py-2 pr-4">{m.tense || '-'}</td>
                        <td className="py-2 pr-4">{m.voice || '-'}</td>
                        <td className="py-2 pr-4">{m.mood || '-'}</td>
                        <td className="py-2 pr-4">{m.case || '-'}</td>
                        <td className="py-2 pr-4">{m.number || '-'}</td>
                        <td className="py-2 pr-4">{m.person || '-'}</td>
                        <td className="py-2">{m.gender || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">Không có dữ liệu hình thái học cho từ này</p>
          )}
        </TabsContent>

        <TabsContent value="crossrefs" className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Quan hệ từ vựng suy từ trường từ nguyên (derivation / etymology).
            </p>
            <Link
              href={`/genealogy/${entry.strongNumber}`}
              className="inline-flex items-center gap-1 whitespace-nowrap rounded border border-border px-2 py-1 text-xs hover:border-primary hover:text-primary transition-colors"
            >
              Xem phả hệ từ vựng →
            </Link>
          </div>
          {(entry.crossRefs && entry.crossRefs.length > 0) || (entry.crossRefTargets && entry.crossRefTargets.length > 0) ? (
            <>
              {entry.crossRefs && entry.crossRefs.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4">Từ có liên quan</h3>
                  <div className="space-y-3">
                    {entry.crossRefs.map((ref, i) => (
                      <CrossRefCard key={i} cr={ref} isReverse={false} />
                    ))}
                  </div>
                </div>
              )}
              {entry.crossRefTargets && entry.crossRefTargets.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-4 mt-6">Được tham chiếu từ</h3>
                  <div className="space-y-3">
                    {entry.crossRefTargets.map((ref, i) => (
                      <CrossRefCard key={i} cr={ref} isReverse={true} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-center py-8">Không có tham chiếu chéo cho từ này</p>
          )}
        </TabsContent>

        <TabsContent value="usage" className="space-y-6">
          <div>
            <h3 className="font-semibold mb-4">Thí dụ cách dùng ({sampleVerses.length} trong {stats.totalVerses} câu)</h3>
            {sampleVerses.length > 0 ? (
              <div className="space-y-4">
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
                          {sv.vietnameseText && (
                            <p className="text-sm text-foreground/80 line-clamp-2 border-r-2 border-primary/40 pr-3 text-right">{sv.vietnameseText}</p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">Không có câu thí dụ</p>
            )}
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
  language: 'HEBREW' | 'GREEK'
  vietnameseDef?: string | null
}
interface CrossRef {
  type: string
  note?: string | null
  targetEntry?: CrossRefEntry
  sourceEntry?: CrossRefEntry
}

function CrossRefCard({ cr, isReverse }: { cr: CrossRef; isReverse: boolean }) {
  const target = isReverse ? cr.sourceEntry : cr.targetEntry
  if (!target) return null
  const labelMap = isReverse ? REVERSE_LABELS : FORWARD_LABELS
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4 pb-4 pr-4 pl-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Badge variant="outline" className="text-xs whitespace-nowrap">
              {labelMap[cr.type] || cr.type}
            </Badge>
            <div>
              <Link href={`/strongs/${target.strongNumber}`} className="font-mono font-medium hover:text-primary transition-colors">
                {target.strongNumber} — {target.transliteration}
              </Link>
              <p className="text-sm text-muted-foreground line-clamp-1">{target.definition}</p>
              {target.vietnameseDef && (
                <p className="mt-0.5 text-xs text-primary/90 line-clamp-1">{target.vietnameseDef}</p>
              )}
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

function LexTranslate({
  kind,
  source,
  vi,
  busy,
  onTranslate,
}: {
  kind: 'thayer' | 'bdb' | 'lsj'
  source: string
  vi?: string
  busy?: boolean
  onTranslate: (k: 'thayer' | 'bdb' | 'lsj', s: string) => void
}) {
  if (!vi)
    return (
      <Button variant="ghost" size="sm" className="mt-2" onClick={() => onTranslate(kind, source)} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
        Dịch tiếng Việt
      </Button>
    )
  if (vi === '__NA__') return <p className="mt-2 text-xs text-muted-foreground">Chưa dịch được.</p>
  return <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-primary/90">{vi}</p>
}