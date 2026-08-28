"use client"

import { useState, useEffect, FormEvent, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Search, X, Loader2, Hash, BookOpen, Link as LinkIcon, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { cn, getBookAbbreviation, BOOKS_OT, BOOKS_NT, BOOK_VI } from "@/lib/utils"

interface StrongSearchData {
  language?: 'HEBREW' | 'GREEK'
  strongNumber: string
  transliteration: string
}
interface VerseSearchData {
  book?: string | { name?: string | null; abbreviation?: string | null } | null
  chapter: number
  verse?: number
  lemma?: boolean
  hebrewGreek?: string
  transliteration?: string
}
interface TopicSearchData {
  id: string
  topic: string
  description?: string | null
}
type SearchResult =
  | { type: 'strong'; id: string; title: string; snippet: string; data: StrongSearchData }
  | { type: 'verse'; id: string; title: string; snippet: string; data: VerseSearchData }
  | { type: 'topic'; id: string; title: string; snippet: string; data: TopicSearchData }

const ALL_BOOKS = [...BOOKS_OT, ...BOOKS_NT]

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container py-8 md:py-12 text-muted-foreground">Đang tải…</div>}>
      <SearchContent />
    </Suspense>
  )
}

function SearchContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') || '')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [lang, setLang] = useState(searchParams.get('lang') || 'all')
  const [book, setBook] = useState(searchParams.get('book') || 'all')
  const [testament, setTestament] = useState(searchParams.get('testament') || 'all')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<SearchResult[]>([])
  const [showSuggest, setShowSuggest] = useState(false)

  function runSearch(q: string, t: string, l: string, b: string, te: string) {
    if (!q.trim()) {
      setResults([])
      return
    }
    setIsLoading(true)
    setError(null)
    const params = new URLSearchParams({ q: q.trim(), type: t })
    if (l !== 'all') params.set('lang', l)
    if (t === 'verse' || t === 'all') {
      if (b !== 'all') params.set('book', b)
      if (te !== 'all') params.set('testament', te)
    }
    fetch(`/api/search?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error('Search failed')
        return res.json()
      })
      .then((data) => setResults(data.results || []))
      .catch(() => {
        setError('Có lỗi xảy ra khi tìm kiếm')
        setResults([])
      })
      .finally(() => setIsLoading(false))
  }

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, react-hooks/immutability */
  useEffect(() => {
    const q = searchParams.get('q')
    const t = searchParams.get('type') || 'all'
    const l = searchParams.get('lang') || 'all'
    const b = searchParams.get('book') || 'all'
    const te = searchParams.get('testament') || 'all'
    if (q) {
      setQuery(q)
      setType(t)
      setLang(l)
      setBook(b)
      setTestament(te)
      runSearch(q, t, l, b, te)
    }
  }, [searchParams])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps, react-hooks/immutability */

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([])
      return
    }
    const handle = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&type=strong&limit=8`)
        const data = await res.json()
        setSuggestions((data.results || []).filter((r: SearchResult) => r.type === 'strong'))
      } catch {
        setSuggestions([])
      }
    }, 250)
    return () => clearTimeout(handle)
  }, [query])
  /* eslint-enable react-hooks/set-state-in-effect */

  const pushParams = (q: string, t: string, l: string, b: string, te: string) => {
    const params = new URLSearchParams({ q, type: t })
    if (l !== 'all') params.set('lang', l)
    if (b !== 'all') params.set('book', b)
    if (te !== 'all') params.set('testament', te)
    router.push(`/search?${params}`)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim()
    if (!trimmed) return
    pushParams(trimmed, type, lang, book, testament)
  }

  const handleTypeChange = (newType: string) => {
    setType(newType)
    pushParams(query.trim() || query, newType, lang, book, testament)
  }
  const handleLangChange = (newLang: string) => {
    setLang(newLang)
    pushParams(query.trim() || query, type, newLang, book, testament)
  }
  const handleBookChange = (newBook: string) => {
    setBook(newBook)
    pushParams(query.trim() || query, type, lang, newBook, testament)
  }
  const handleTestamentChange = (newTe: string) => {
    setTestament(newTe)
    pushParams(query.trim() || query, type, lang, book, newTe)
  }

  const clearSearch = () => {
    setQuery('')
    setResults([])
    setBook('all')
    setTestament('all')
    router.push('/search')
  }

  const showScope = type === 'verse' || type === 'all'

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Tìm kiếm</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tìm kiếm</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tìm kiếm số Strongs, câu Kinh Thánh, hoặc chủ đề
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative" onBlur={() => setTimeout(() => setShowSuggest(false), 150)}>
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ví dụ: G26, John 3:16, yêu thương, đức tin..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setShowSuggest(true)}
                className="pl-10 pr-12 text-lg"
                disabled={isLoading}
              />
              {query && (
                <Button type="button" variant="ghost" size="icon" className="absolute right-10 top-1/2 -translate-y-1/2" onClick={clearSearch} aria-label="Xóa tìm kiếm">
                  <X className="h-5 w-5" />
                </Button>
              )}
              {isLoading && (
                <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary animate-spin" />
              )}
              {showSuggest && suggestions.length > 0 && (
                <ul className="absolute z-20 mt-1 w-full rounded-md border bg-background shadow-lg max-h-72 overflow-auto">
                  {suggestions.map((s) => (
                    <li key={s.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-accent"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => { setShowSuggest(false); setSuggestions([]); router.push(`/strongs/${s.id}`) }}
                      >
                        <span className={cn("rounded px-2 py-0.5 font-mono text-xs", s.type === 'strong' && s.data.language === 'HEBREW' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300")}>{s.id}</span>
                        <span className="truncate">{s.title.replace(/^[^—]*—\s*/, '')}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Loại tìm kiếm">
              {['all', 'strong', 'verse', 'topic'].map((t) => (
                <Button
                  key={t}
                  type="button"
                  variant={type === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleTypeChange(t)}
                  role="radio"
                  aria-checked={type === t}
                >
                  {t === 'all' && 'Tất cả'}
                  {t === 'strong' && <><Hash className="h-4 w-4 mr-1" /> Strongs</>}
                  {t === 'verse' && <><BookOpen className="h-4 w-4 mr-1" /> Kinh Thánh</>}
                  {t === 'topic' && <><LinkIcon className="h-4 w-4 mr-1" /> Chủ đề</>}
                </Button>
              ))}
            </div>

            {(type === 'all' || type === 'strong') && (
              <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label="Ngôn ngữ">
                <span className="text-xs text-muted-foreground">Ngôn ngữ:</span>
                {[['all', 'Tất cả'], ['HEBREW', 'Hê-bơ-rơ'], ['GREEK', 'Hy-lạp']].map(([l, label]) => (
                  <Button
                    key={l}
                    type="button"
                    variant={lang === l ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => handleLangChange(l)}
                    role="radio"
                    aria-checked={lang === l}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}

            {showScope && (
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Sách:</span>
                  <select
                    value={book}
                    onChange={(e) => handleBookChange(e.target.value)}
                    className="h-8 rounded-md border bg-background px-2 text-xs"
                  >
                    <option value="all">Tất cả</option>
                    <optgroup label="Cựu Ước">
                      {BOOKS_OT.map((b) => (
                        <option key={b} value={b}>{BOOK_VI[b] || b}</option>
                      ))}
                    </optgroup>
                    <optgroup label="Tân Ước">
                      {BOOKS_NT.map((b) => (
                        <option key={b} value={b}>{BOOK_VI[b] || b}</option>
                      ))}
                    </optgroup>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Testament:</span>
                  {[['all', 'Tất cả'], ['OT', 'Cựu Ước'], ['NT', 'Tân Ước']].map(([te, label]) => (
                    <Button
                      key={te}
                      type="button"
                      variant={testament === te ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => handleTestamentChange(te)}
                    >
                      {label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {showScope && (
              <p className="text-xs text-muted-foreground">
                Mẹo: dùng <code className="rounded bg-muted px-1">OR</code>, <code className="rounded bg-muted px-1">-từ</code> (loại trừ), <code className="rounded bg-muted px-1">"cụm từ"</code> (trích dẫn). Nhập số Strongs (vd <code className="rounded bg-muted px-1">G26</code>) ở mục Kinh Thánh để tìm mọi câu chứa từ gốc đó.
              </p>
            )}
          </form>
        </CardContent>
      </Card>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive" role="alert">
          {error}
        </div>
      )}

      {query && (
        <div className="space-y-4" role="list" aria-label="Kết quả tìm kiếm">
          {results.length === 0 && !isLoading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy kết quả</h3>
                <p className="text-muted-foreground">Thử từ khóa khác hoặc kiểm tra chính tả</p>
              </CardContent>
            </Card>
          ) : (
            results.map((result, index) => (
              <SearchResultCard key={`${result.type}-${result.id}-${index}`} result={result} />
            ))
          )}
        </div>
      )}
    </div>
  )
}

function SearchResultCard({ result }: { result: SearchResult }) {
  const { type, title, snippet, data } = result

  if (type === 'strong') {
    const entry = data
    const isHebrew = entry.language === 'HEBREW'
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4 pb-4 pr-4 pl-4">
          <Link href={`/strongs/${entry.strongNumber}`} className="flex items-start gap-4 group">
            <span className={cn(
              "px-3 py-1.5 rounded font-mono font-semibold text-sm flex-shrink-0",
              isHebrew ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
            )}>
              {entry.strongNumber}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold group-hover:text-primary transition-colors">{entry.transliteration}</h3>
                <Badge variant="outline" className="text-xs">{isHebrew ? 'Hê-bơ-rơ' : 'Hy-lạp'}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{snippet}</p>
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (type === 'verse') {
    const v = data
    if (v.lemma) {
      return (
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-4 pb-4 pr-4 pl-4">
            <Link href={`/interlinear/${v.book}/${v.chapter}`} className="group">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold group-hover:text-primary transition-colors">{typeof v.book === 'string' ? v.book : ''} {v.chapter}:{v.verse}</h3>
                    <Badge variant="outline" className="text-xs">Lemma · {v.hebrewGreek}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{snippet}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
              </div>
            </Link>
          </CardContent>
        </Card>
      )
    }
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4 pb-4 pr-4 pl-4">
          <Link href={`/interlinear/${getBookAbbreviation((v.book && typeof v.book === 'object' ? v.book.name || '' : '') || '')}/${v.chapter}`} className="group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{title}</h3>
                  <Badge variant="outline" className="text-xs">Kinh Thánh</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{snippet}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </div>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (type === 'topic') {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="pt-4 pb-4 pr-4 pl-4">
          <Link href={`/topics/${data.id}`} className="group">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold group-hover:text-primary transition-colors">{data.topic}</h3>
                  <Badge variant="outline" className="text-xs">Chủ đề</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">{snippet}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors flex-shrink-0" />
            </div>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return null
}
