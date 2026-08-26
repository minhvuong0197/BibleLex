"use client"

import { cn, getBookAbbreviation, getBookViName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Copy } from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface InterlinearWord {
  wordOrder: number
  hebrewGreek: string
  transliteration: string
  strongNumber: string | null
  parsing?: string | null
  english?: string | null
  strongEntry?: {
    strongNumber: string
    transliteration: string
    definition: string
    vietnameseDef?: string | null
    language: 'HEBREW' | 'GREEK'
  } | null
  morphology?: {
    parsings: string
    tense?: string | null
    voice?: string | null
    mood?: string | null
    case?: string | null
    number?: string | null
    person?: string | null
    gender?: string | null
  } | null
}

interface InterlinearVerse {
  book: string
  chapter: number
  verse: number
  text: string
  vietnameseText?: string | null
  kjvText?: string | null
  words: InterlinearWord[]
}

interface InterlinearViewerProps {
  book: string
  chapter: number
  verses: InterlinearVerse[]
  crossRefCounts: Record<number, number>
  language: 'HEBREW' | 'GREEK'
  navigation: {
    prevChapter: number | null
    nextChapter: number | null
  }
}

export function InterlinearViewer({ book, chapter, verses, crossRefCounts, language, navigation }: InterlinearViewerProps) {
  const router = useRouter()
  const goToChapter = useCallback(
    (ch: number) => router.push(`/interlinear/${getBookAbbreviation(book)}/${ch}`),
    [book, router]
  )

  const [showTransliteration, setShowTransliteration] = useState(true)
  const [showParsing, setShowParsing] = useState(true)
  const [showEnglish, setShowEnglish] = useState(true)
  const [showVietnamese, setShowVietnamese] = useState(true)
  const [showKjv, setShowKjv] = useState(true)
  const [selectedWord, setSelectedWord] = useState<InterlinearWord | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const toggleCls = (active: boolean) =>
    cn(
      "border min-h-[36px] px-2.5 py-1 rounded-md text-xs font-semibold transition-colors",
      active
        ? "bg-primary-foreground text-primary border-primary-foreground shadow"
        : "bg-transparent text-primary-foreground/70 border-primary-foreground/30 hover:bg-primary-foreground/10"
    )

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleKeyDown = useCallback(
    (e: { key: string }) => {
      if (e.key === 'ArrowLeft' && navigation.prevChapter) {
        goToChapter(navigation.prevChapter)
      } else if (e.key === 'ArrowRight' && navigation.nextChapter) {
        goToChapter(navigation.nextChapter)
      }
    },
    [navigation, goToChapter]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigation, book, goToChapter, handleKeyDown])

  return (
    <div className="space-y-6" onKeyDown={handleKeyDown}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigation.prevChapter && goToChapter(navigation.prevChapter)} disabled={!navigation.prevChapter} aria-label="Chương trước">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="text-center px-4">
              <h2 className="text-xl font-bold">{getBookViName(book)} {chapter}</h2>
              <p className="text-sm text-muted-foreground">{verses.length} câu</p>
            </div>
            <Button variant="outline" size="icon" onClick={() => navigation.nextChapter && goToChapter(navigation.nextChapter)} disabled={!navigation.nextChapter} aria-label="Chương sau">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" className={toggleCls(showTransliteration)} onClick={() => setShowTransliteration(!showTransliteration)} aria-pressed={showTransliteration}>
            <span className="mr-1" aria-hidden="true">ἀ/א</span> Phiên âm
          </Button>
          <Button variant="outline" size="sm" className={toggleCls(showParsing)} onClick={() => setShowParsing(!showParsing)} aria-pressed={showParsing}>
            <span className="mr-1" aria-hidden="true">𝔓</span> Phân tích
          </Button>
          <Button variant="outline" size="sm" className={toggleCls(showEnglish)} onClick={() => setShowEnglish(!showEnglish)} aria-pressed={showEnglish}>
            <span className="mr-1" aria-hidden="true">En</span> Tiếng Anh
          </Button>
          <Button variant="outline" size="sm" className={toggleCls(showKjv)} onClick={() => setShowKjv(!showKjv)} aria-pressed={showKjv}>
            <span className="mr-1" aria-hidden="true">KJV</span> Tiếng Anh (KJV)
          </Button>
          <Button variant="outline" size="sm" className={toggleCls(showVietnamese)} onClick={() => setShowVietnamese(!showVietnamese)} aria-pressed={showVietnamese}>
            <span className="mr-1" aria-hidden="true">Vi</span> Tiếng Việt
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[calc(100vh-300px)] min-h-[500px] rounded-lg border">
          <div className="p-3 sm:p-4 space-y-6" role="list" aria-label="Các câu Kinh Thánh đối chiếu">
          {verses.map((verse) => (
            <InterlinearVerseComponent
              key={`${verse.book}-${verse.chapter}-${verse.verse}`}
              verse={verse}
              language={language}
              showTransliteration={showTransliteration}
              showParsing={showParsing}
              showEnglish={showEnglish}
              showVietnamese={showVietnamese}
              onWordClick={setSelectedWord}
              onCopy={copyToClipboard}
              copied={copied}
              crossRefCount={crossRefCounts[verse.verse] ?? 0}
              kjvText={verse.kjvText ?? null}
              showKjv={showKjv}
            />
          ))}
        </div>
      </ScrollArea>

      {selectedWord && (
        <WordDetailPanel
          word={selectedWord}
          onClose={() => setSelectedWord(null)}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  )
}

function InterlinearVerseComponent({
  verse,
  language,
  showTransliteration,
  showParsing,
  showEnglish,
  showVietnamese,
  onWordClick,
  onCopy,
  copied,
  crossRefCount,
  kjvText,
  showKjv
}: {
  verse: InterlinearVerse
  language: 'HEBREW' | 'GREEK'
  showTransliteration: boolean
  showParsing: boolean
  showEnglish: boolean
  showVietnamese: boolean
  onWordClick: (word: InterlinearWord) => void
  onCopy: (text: string, label: string) => Promise<void>
  copied: string | null
  crossRefCount: number
  kjvText: string | null
  showKjv: boolean
}) {
  const isHebrew = language === 'HEBREW'
  const [xrefOpen, setXrefOpen] = useState(false)
  return (
    <article id={`${verse.book}-${verse.chapter}-${verse.verse}`} className="space-y-3 scroll-mt-20" role="listitem">
      <div className="flex items-start gap-4">
          <span className="flex-shrink-0 w-16 sm:w-20 text-right text-sm text-muted-foreground font-mono select-none">
          {getBookViName(verse.book)} {verse.chapter}:{verse.verse}
        </span>
        <div className="flex-1 min-w-0">
          <p className={cn("text-lg sm:text-xl leading-relaxed font-medium text-foreground break-words", isHebrew ? "hebrew-font text-right" : "greek-font")}>
            {verse.text}
          </p>
          {showVietnamese && verse.vietnameseText && (
            <p className="mt-1 text-sm leading-relaxed text-foreground/80 border-r-2 border-primary/40 pr-3 text-right" dir="ltr">
              {verse.vietnameseText}
            </p>
          )}
          {showKjv && kjvText && (
            <p className="mt-1 text-sm leading-relaxed text-foreground/70 border-l-2 border-amber-400/60 pl-3" dir="ltr">
              {kjvText}
            </p>
          )}
        </div>
      </div>

        <div className="ml-0 sm:ml-20 flex flex-wrap gap-1.5 sm:gap-2">
        {verse.words.map((word, idx) => (
          <WordToken
            key={idx}
            word={word}
            language={language}
            index={idx}
            showTransliteration={showTransliteration}
            showParsing={showParsing}
            showEnglish={showEnglish}
            onClick={onWordClick}
            onCopy={onCopy}
            copied={copied}
          />
        ))}
      </div>

      {crossRefCount > 0 && (
        <div className="ml-0 sm:ml-20 mt-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setXrefOpen((o) => !o)}
            aria-expanded={xrefOpen}
            className="text-xs"
          >
            <span aria-hidden="true" className="mr-1">📖</span>
            Cross-references ({crossRefCount})
          </Button>
          {xrefOpen && (
            <CrossRefPanel book={verse.book} chapter={verse.chapter} verse={verse.verse} />
          )}
        </div>
      )}
    </article>
  )
}

interface CrossRefItem {
  toBook: string | null
  toChapter: number
  toVerse: number
  toLabel: string
  anchor: string | null
}

function CrossRefPanel({ book, chapter, verse }: { book: string; chapter: number; verse: number }) {
  const [data, setData] = useState<CrossRefItem[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/crossrefs/verse?book=${encodeURIComponent(book)}&chapter=${chapter}&verse=${verse}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setData(d.references ?? [])
      })
      .catch(() => {
        if (!cancelled) setData([])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [book, chapter, verse])

  if (loading) return <p className="mt-2 text-xs text-muted-foreground">Đang tải cross-references…</p>
  if (!data || data.length === 0)
    return <p className="mt-2 text-xs text-muted-foreground">Không có cross-reference cho câu này.</p>

  return (
    <ul className="mt-2 space-y-1 text-sm">
      {data.map((r, i) => {
        const href = r.toBook
          ? `/interlinear/${getBookAbbreviation(r.toBook)}/${r.toChapter}#${r.toBook}-${r.toChapter}-${r.toVerse}`
          : null
        return (
          <li key={i} className="leading-snug">
            {href ? (
              <Link href={href} className="text-primary hover:underline">
                {r.toLabel}
              </Link>
            ) : (
              <span className="text-foreground/80">{r.toLabel}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}

function WordToken({
  word,
  language,
  showTransliteration,
  showParsing,
  showEnglish,
  onClick,
  onCopy,
  copied
}: {
  word: InterlinearWord
  language: 'HEBREW' | 'GREEK'
  index: number
  showTransliteration: boolean
  showParsing: boolean
  showEnglish: boolean
  onClick: (word: InterlinearWord) => void
  onCopy: (text: string, label: string) => Promise<void>
  copied: string | null
}) {
  const lang = word.strongEntry?.language || language
  const isHebrew = lang === 'HEBREW'

  return (
    <button
      type="button"
      onClick={() => onClick(word)}
      className={cn(
        "inline-flex items-start gap-2 px-2 py-1 rounded transition-all cursor-pointer max-w-full",
        "hover:bg-accent hover:shadow-md relative z-10",
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
      )}
      aria-label={`Chữ ${word.hebrewGreek}, số Strongs ${word.strongNumber}`}
      title={
        word.strongEntry
          ? `${word.hebrewGreek} (${word.transliteration}) · ${word.strongEntry.definition}`
          : `${word.hebrewGreek} (${word.transliteration})`
      }
    >
      <span className={cn("font-semibold select-none text-foreground break-words", isHebrew ? "text-2xl hebrew-font" : "text-xl greek-font")}>
        {word.hebrewGreek}
      </span>
      
        <div className="flex flex-col min-w-0 break-words">
        {showTransliteration && (
          <span className="text-xs font-mono text-muted-foreground select-all">
            {word.transliteration}
          </span>
        )}
        
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={cn(
            "px-1.5 py-0.5 text-xs font-mono rounded select-all cursor-pointer",
            "hover:bg-primary/10 transition-colors",
            isHebrew ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
          )} onClick={(e) => { e.stopPropagation(); onCopy(word.strongNumber ?? '', word.strongNumber ?? '') }}>
            {word.strongNumber}
            {copied === word.strongNumber && <span className="ml-1 text-green-600">✓</span>}
          </span>
          
          {showParsing && word.parsing && (
            <span className="px-1.5 py-0.5 text-xs font-mono rounded bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 select-all">
              {word.parsing}
            </span>
          )}
        </div>

        {showEnglish && word.english && (
          <span className="text-xs text-muted-foreground italic select-all">{word.english}</span>
        )}
        {word.strongEntry?.vietnameseDef && (
          <span className="line-clamp-2 text-xs text-primary/90 select-all">{word.strongEntry.vietnameseDef}</span>
        )}
      </div>
    </button>
  )
}

function WordDetailPanel({
  word,
  onClose,
  onCopy
}: {
  word: InterlinearWord
  onClose: () => void
  onCopy: (text: string, label: string) => Promise<void>
}) {
  if (!word.strongEntry) return null

  const entry = word.strongEntry
  const lang = entry.language
  const isHebrew = lang === 'HEBREW'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="word-detail-title">
      <div className="bg-primary text-primary-foreground w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl border border-primary-foreground/20" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between p-4 border-b border-primary-foreground/20 bg-primary">
            <div className="flex items-center gap-3 min-w-0">
            <span className={cn("text-3xl sm:text-4xl font-bold break-words", isHebrew ? "text-emerald-300 hebrew-font" : "text-sky-300 greek-font")}>
              {word.hebrewGreek}
            </span>
            <div className="min-w-0">
              <h3 id="word-detail-title" className="font-semibold break-words">{word.transliteration}</h3>
              <p className="text-sm text-primary-foreground/80">{entry.strongNumber} · {isHebrew ? 'Hê-bơ-rơ' : 'Hy-lạp'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng" className="text-primary-foreground hover:bg-primary-foreground/10">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-primary-foreground/80 block mb-1">Số Strongs</label>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg px-2 py-1 bg-primary-foreground text-primary rounded">{entry.strongNumber}</code>
                <Button variant="outline" size="sm" className="bg-primary-foreground/25 text-primary-foreground border border-primary-foreground/40 hover:bg-primary-foreground/40" onClick={() => onCopy(entry.strongNumber, 'Số Strongs')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs text-primary-foreground/80 block mb-1">Phiên âm</label>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg px-2 py-1 bg-primary-foreground text-primary rounded flex-1">{word.transliteration}</code>
                <Button variant="outline" size="sm" className="bg-primary-foreground/25 text-primary-foreground border border-primary-foreground/40 hover:bg-primary-foreground/40" onClick={() => onCopy(word.transliteration, 'Phiên âm')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {word.parsing && (
            <div>
              <label className="text-xs text-primary-foreground/80 block mb-1">Phân tích</label>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg px-2 py-1 bg-primary-foreground text-primary rounded flex-1">{word.parsing}</code>
                <Button variant="outline" size="sm" className="bg-primary-foreground/25 text-primary-foreground border border-primary-foreground/40 hover:bg-primary-foreground/40" onClick={() => onCopy(word.parsing!, 'Parsing')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {word.morphology && (
            <div className="sm:col-span-2">
              <label className="text-xs text-primary-foreground/80 block mb-2">Chi tiết hình thái</label>
              <div className="grid gap-2 sm:grid-cols-4">
                {word.morphology.tense && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">Thì: {word.morphology.tense}</Badge>}
                {word.morphology.voice && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">Thể: {word.morphology.voice}</Badge>}
                {word.morphology.mood && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">Cách: {word.morphology.mood}</Badge>}
                {word.morphology.case && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">Cách thức: {word.morphology.case}</Badge>}
                {word.morphology.number && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">Số: {word.morphology.number}</Badge>}
                {word.morphology.person && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">Ngôi: {word.morphology.person}</Badge>}
                {word.morphology.gender && <Badge variant="outline" className="border-primary-foreground/30 text-primary-foreground">Giống: {word.morphology.gender}</Badge>}
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="text-xs text-primary-foreground/80 block mb-2">Định nghĩa</label>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground">{entry.definition}</p>
          </div>

          {word.strongEntry?.vietnameseDef && (
            <div className="sm:col-span-2">
              <label className="text-xs text-primary-foreground/80 block mb-2">Nghĩa tiếng Việt</label>
              <p className="text-sm leading-relaxed whitespace-pre-wrap text-primary-foreground">{word.strongEntry.vietnameseDef}</p>
            </div>
          )}

           <div className="sm:col-span-2 flex flex-wrap gap-2">
             <Link href={`/strongs/${entry.strongNumber}`} onClick={onClose} className="flex-1 min-w-[160px]">
                <Button className="w-full bg-primary-foreground text-primary font-semibold hover:bg-primary-foreground/90">Xem chi tiết Strongs</Button>
             </Link>
             <Link href={`/word-study/${entry.strongNumber}`} onClick={onClose} className="flex-1 min-w-[160px]">
               <Button variant="outline" className="w-full bg-primary-foreground text-primary font-semibold border border-primary-foreground/60 hover:bg-primary-foreground/90">Khảo cứu từ vựng</Button>
             </Link>
             <Link href={`/genealogy/${entry.strongNumber}`} onClick={onClose} className="flex-1 min-w-[160px]">
               <Button variant="outline" className="w-full bg-primary-foreground text-primary font-semibold border border-primary-foreground/60 hover:bg-primary-foreground/90">Xem phả hệ từ vựng</Button>
             </Link>
           </div>
        </div>
      </div>
    </div>
  )
}