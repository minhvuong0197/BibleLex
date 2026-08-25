"use client"

import { cn, getBookAbbreviation, getBookViName } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ChevronLeft, ChevronRight, Search, BookOpen, Eye, EyeOff, Copy } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface InterlinearWord {
  wordOrder: number
  hebrewGreek: string
  transliteration: string
  strongNumber: string
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
  words: InterlinearWord[]
}

interface InterlinearViewerProps {
  book: string
  chapter: number
  verses: InterlinearVerse[]
  language: 'HEBREW' | 'GREEK'
  navigation: {
    prevChapter: number | null
    nextChapter: number | null
  }
}

const MORPH_LABELS: Record<string, string> = {
  tense: 'Thì',
  voice: 'Thể',
  mood: 'Cách',
  case: 'Cách thức',
  number: 'Số',
  person: 'Ngôi',
  gender: 'Giống',
}

export function InterlinearViewer({ book, chapter, verses, language, navigation }: InterlinearViewerProps) {
  const router = useRouter()
  const goToChapter = (ch: number) =>
    router.push(`/interlinear/${getBookAbbreviation(book)}/${ch}`)

  const [showTransliteration, setShowTransliteration] = useState(true)
  const [showParsing, setShowParsing] = useState(true)
  const [showEnglish, setShowEnglish] = useState(true)
  const [showVietnamese, setShowVietnamese] = useState(true)
  const [selectedWord, setSelectedWord] = useState<InterlinearWord | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const copyToClipboard = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(label)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft' && navigation.prevChapter) {
      goToChapter(navigation.prevChapter)
    } else if (e.key === 'ArrowRight' && navigation.nextChapter) {
      goToChapter(navigation.nextChapter)
    }
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navigation, book])

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
          <Button variant="outline" size="sm" onClick={() => setShowTransliteration(!showTransliteration)} aria-pressed={showTransliteration} className={showTransliteration ? 'bg-accent' : ''}>
            <span className="mr-1" aria-hidden="true">ἀ/א</span> Phiên âm
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowParsing(!showParsing)} aria-pressed={showParsing} className={showParsing ? 'bg-accent' : ''}>
            <span className="mr-1" aria-hidden="true">𝔓</span> Phân tích
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEnglish(!showEnglish)} aria-pressed={showEnglish} className={showEnglish ? 'bg-accent' : ''}>
            <span className="mr-1" aria-hidden="true">En</span> Tiếng Anh
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowVietnamese(!showVietnamese)} aria-pressed={showVietnamese} className={showVietnamese ? 'bg-accent' : ''}>
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
  copied
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
}) {
  const isHebrew = language === 'HEBREW'
  return (
    <article className="space-y-3" role="listitem">
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
    </article>
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
  const isSelected = copied === word.strongNumber
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
          )} onClick={(e) => { e.stopPropagation(); onCopy(word.strongNumber, word.strongNumber) }}>
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
      <div className="bg-background w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 flex items-center justify-between p-4 border-b bg-background">
            <div className="flex items-center gap-3 min-w-0">
            <span className={cn("text-3xl sm:text-4xl font-bold break-words", isHebrew ? "text-green-600 hebrew-font" : "text-blue-600 greek-font")}>
              {word.hebrewGreek}
            </span>
            <div className="min-w-0">
              <h3 id="word-detail-title" className="font-semibold break-words">{word.transliteration}</h3>
              <p className="text-sm text-muted-foreground">{entry.strongNumber} · {isHebrew ? 'Hê-bơ-rơ' : 'Hy-lạp'}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Đóng">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </Button>
        </div>

        <div className="p-4 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Số Strongs</label>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg px-2 py-1 bg-muted rounded">{entry.strongNumber}</code>
                <Button variant="outline" size="sm" onClick={() => onCopy(entry.strongNumber, 'Số Strongs')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Phiên âm</label>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg px-2 py-1 bg-muted rounded flex-1">{word.transliteration}</code>
                <Button variant="outline" size="sm" onClick={() => onCopy(word.transliteration, 'Phiên âm')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {word.parsing && (
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Phân tích</label>
              <div className="flex items-center gap-2">
                <code className="font-mono text-lg px-2 py-1 bg-muted rounded flex-1">{word.parsing}</code>
                <Button variant="outline" size="sm" onClick={() => onCopy(word.parsing!, 'Parsing')}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {word.morphology && (
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground block mb-2">Chi tiết hình thái</label>
              <div className="grid gap-2 sm:grid-cols-4">
                {word.morphology.tense && <Badge variant="outline">Thì: {word.morphology.tense}</Badge>}
                {word.morphology.voice && <Badge variant="outline">Thể: {word.morphology.voice}</Badge>}
                {word.morphology.mood && <Badge variant="outline">Cách: {word.morphology.mood}</Badge>}
                {word.morphology.case && <Badge variant="outline">Cách thức: {word.morphology.case}</Badge>}
                {word.morphology.number && <Badge variant="outline">Số: {word.morphology.number}</Badge>}
                {word.morphology.person && <Badge variant="outline">Ngôi: {word.morphology.person}</Badge>}
                {word.morphology.gender && <Badge variant="outline">Giống: {word.morphology.gender}</Badge>}
              </div>
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="text-xs text-muted-foreground block mb-2">Định nghĩa</label>
            <p className="prose prose-sm max-w-none whitespace-pre-wrap">{entry.definition}</p>
          </div>

          {word.strongEntry?.vietnameseDef && (
            <div className="sm:col-span-2">
              <label className="text-xs text-muted-foreground block mb-2">Nghĩa tiếng Việt</label>
              <p className="prose prose-sm max-w-none whitespace-pre-wrap">{word.strongEntry.vietnameseDef}</p>
            </div>
          )}

           <div className="sm:col-span-2 flex flex-wrap gap-2">
             <Link href={`/strongs/${entry.strongNumber}`} onClick={onClose} className="flex-1 min-w-[160px]">
               <Button className="w-full">Xem chi tiết Strongs</Button>
             </Link>
             <Link href={`/word-study/${entry.strongNumber}`} onClick={onClose} className="flex-1 min-w-[160px]">
               <Button variant="outline" className="w-full">Khảo cứu từ vựng</Button>
             </Link>
             <Link href={`/genealogy/${entry.strongNumber}`} onClick={onClose} className="flex-1 min-w-[160px]">
               <Button variant="outline" className="w-full">Xem phả hệ từ vựng</Button>
             </Link>
           </div>
        </div>
      </div>
    </div>
  )
}