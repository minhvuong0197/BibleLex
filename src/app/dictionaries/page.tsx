"use client"

import { useState } from "react"
import { Search, Loader2, BookA, Languages } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DICTIONARIES } from "@/lib/dictionary-data"

interface Entry {
  term: string
  source: string
  definition: string
  vietnameseDef: string | null
}

const FEATURED: Entry[] = Object.entries(DICTIONARIES).flatMap(([term, list]) =>
  list.map((e) => ({ term, source: e.dict, definition: e.definition, vietnameseDef: null }))
)

export default function DictionariesPage() {
  const [term, setTerm] = useState("")
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [translations, setTranslations] = useState<Record<string, string>>({})
  const [translating, setTranslating] = useState<Record<string, boolean>>({})

  const key = (e: Entry) => `${e.term}__${e.source}`

  const run = async (q: string) => {
    if (!q.trim()) return
    setIsLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/dictionary?term=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setEntries(data.entries ?? [])
    } catch {
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    run(term)
  }

  const translate = async (e: Entry) => {
    const k = key(e)
    if (translations[k] || translating[k]) return
    setTranslating((t) => ({ ...t, [k]: true }))
    try {
      const res = await fetch(
        `/api/dictionary/translate?term=${encodeURIComponent(e.term)}&source=${encodeURIComponent(e.source)}`
      )
      const data = await res.json()
      if (data.vietnameseDef) {
        setTranslations((t) => ({ ...t, [k]: data.vietnameseDef }))
      } else {
        setTranslations((t) => ({ ...t, [k]: "__UNAVAILABLE__" }))
      }
    } catch {
      setTranslations((t) => ({ ...t, [k]: "__UNAVAILABLE__" }))
    } finally {
      setTranslating((t) => ({ ...t, [k]: false }))
    }
  }

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Từ điển Kinh Thánh</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Từ điển Kinh Thánh</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tổng hợp từ điển công cộng (Easton, Smith, Hitchcock, Torrey) — giống BLB / TheWord. Gõ thuật ngữ để tra cứu, bấm “Dịch tiếng Việt” khi cần.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nhập thuật ngữ, ví dụ: love, covenant, baptism, Aaron, Jerusalem…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Tìm
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Kết quả tìm kiếm */}
      {searched && (
        <div className="space-y-4">
          {isLoading && <p className="text-muted-foreground">Đang tra cứu…</p>}
          {!isLoading && entries.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <BookA className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Chưa có mục từ này</h3>
                <p className="text-muted-foreground">Thử thuật ngữ khác.</p>
              </CardContent>
            </Card>
          )}
          {entries.map((e) => {
            const k = key(e)
            const vi = translations[k]
            return (
              <Card key={k}>
                <CardContent className="pt-4 pb-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">{e.source}</Badge>
                    <span className="text-sm font-semibold text-primary">{e.term}</span>
                  </div>
                  {vi && vi !== "__UNAVAILABLE__" ? (
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{vi}</p>
                  ) : (
                    <>
                      <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{e.definition}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-3"
                        onClick={() => translate(e)}
                        disabled={translating[k] || vi === "__UNAVAILABLE__"}
                      >
                        {translating[k] ? <Loader2 className="h-4 w-4 animate-spin" /> : <Languages className="h-4 w-4" />}
                        {vi === "__UNAVAILABLE__" ? "Chưa dịch được" : "Dịch tiếng Việt"}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Mục nổi bật (tiếng Việt tóm tắt) khi chưa tìm */}
      {!searched && (
        <div>
          <h2 className="mb-3 text-lg font-semibold">Mục nổi bật (giải nghĩa tiếng Việt)</h2>
          <div className="space-y-4">
            {FEATURED.map((e, i) => (
              <Card key={`f-${i}`}>
                <CardContent className="pt-4 pb-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="text-xs">{e.source}</Badge>
                    <span className="text-sm font-semibold text-primary">{e.term}</span>
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{e.definition}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <p className="mt-8 border-t pt-4 text-xs text-muted-foreground">
        Nguồn: từ điển công cộng (Easton, Smith, Hitchcock, Torrey) và lexicon gốc từ STEPBible (Thayer / Abbott-Smith, BDB, LSJ) — giấy phép CC BY 4.0. Định nghĩa tiếng Việt được dịch tự động theo yêu cầu.
      </p>
    </div>
  )
}
