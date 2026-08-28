"use client"

import { useEffect, useRef, useState, Fragment, type CSSProperties } from "react"
import { useRouter } from "next/navigation"
import { Play, Pause, Square, SkipBack, SkipForward, Volume2, ChevronLeft, ChevronRight, BookA } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useStudy, VerseStudyButtons } from "@/components/reader/verse-study"
import { StrongsHoverCard } from "@/components/strongs/strongs-hover-card"

interface ReaderVerse {
  verse: number
  texts: Record<string, string>
}
interface ReaderVersion {
  code: string
  name: string
  abbreviation: string
  language: string
}
interface Navigation {
  prevChapter: number | null
  nextChapter: number | null
}

function ttsLang(language?: string): string {
  return language === "en" ? "en-US" : "vi-VN"
}

export function BibleReader({
  book,
  bookAbbrev,
  chapter,
  verses,
  versions,
  navigation,
  userId,
  verseWords,
}: {
  book: string
  bookAbbrev: string
  chapter: number
  verses: ReaderVerse[]
  versions: ReaderVersion[]
  navigation: Navigation
  userId?: string
  verseWords?: Record<number, any[]>
}) {
  const router = useRouter()
  const study = useStudy(userId)
  const [showStrong, setShowStrong] = useState(false)
  const primary = versions[0]
  const primaryCode = primary?.code
  const lang = ttsLang(primary?.language)

  const [currentVerse, setCurrentVerse] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [rate, setRate] = useState(1)
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [voiceURI, setVoiceURI] = useState<string | null>(null)
  const [supported, setSupported] = useState(true)

  const queueRef = useRef<{ verse: number; text: string }[]>([])
  const idxRef = useRef(0)
  const isPlayingRef = useRef(false)
  const pausedRef = useRef(false)
  const rateRef = useRef(1)
  const langRef = useRef(lang)
  const primaryRef = useRef(primaryCode)
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null)

  useEffect(() => { rateRef.current = rate }, [rate])
  useEffect(() => { langRef.current = lang }, [lang])
  useEffect(() => { primaryRef.current = primaryCode }, [primaryCode])

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false)
      return
    }
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.onvoiceschanged = load
    return () => {
      window.speechSynthesis.onvoiceschanged = null
      window.speechSynthesis.cancel()
    }
  }, [])

  function pickVoice(l: string): SpeechSynthesisVoice | undefined {
    const want = l.split("-")[0].toLowerCase()
    const langVoices = voices.filter((v) => v.lang?.toLowerCase().startsWith(want))
    if (want === "vi") {
      const male = langVoices.find((v) => /nam/i.test(v.name) && !/huynh/i.test(v.name))
      if (male) return male
    }
    return langVoices[0] || voices.find((v) => v.lang?.toLowerCase().startsWith(want)) || voices[0]
  }

  function stopPlayback() {
    if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
    isPlayingRef.current = false
    pausedRef.current = false
    setIsPlaying(false)
  }

  function speakCurrent() {
    const synth = window.speechSynthesis
    const items = queueRef.current
    if (idxRef.current >= items.length) {
      stopPlayback()
      setCurrentVerse(null)
      return
    }
    const it = items[idxRef.current]
    const u = new SpeechSynthesisUtterance(it.text)
    u.lang = langRef.current
    const v = voices.find((x) => x.voiceURI === voiceURI) || pickVoice(langRef.current)
    if (v) u.voice = v
    u.rate = rateRef.current
    u.onstart = () => setCurrentVerse(it.verse)
    u.onend = () => {
      if (!isPlayingRef.current) return
      idxRef.current += 1
      if (idxRef.current < items.length) speakCurrent()
      else stopPlayback()
    }
    u.onerror = () => {
      if (!isPlayingRef.current) return
      idxRef.current += 1
      if (idxRef.current < items.length) speakCurrent()
      else stopPlayback()
    }
    utterRef.current = u
    synth.speak(u)
  }

  function buildQueue(startVerse?: number) {
    const code = primaryRef.current
    const items = verses
      .filter((v) => v.texts[code ?? ""])
      .map((v) => ({ verse: v.verse, text: v.texts[code ?? ""] }))
    let idx = startVerse != null ? items.findIndex((i) => i.verse === startVerse) : 0
    if (idx < 0) idx = 0
    queueRef.current = items
    idxRef.current = idx
  }

  function playChapter() {
    if (typeof window === "undefined") return
    if (pausedRef.current && isPlayingRef.current) {
      pausedRef.current = false
      if ("speechSynthesis" in window) window.speechSynthesis.resume()
      setIsPlaying(true)
      return
    }
    stopPlayback()
    buildQueue(currentVerse ?? verses[0]?.verse)
    isPlayingRef.current = true
    pausedRef.current = false
    setIsPlaying(true)
    speakCurrent()
  }

  function playVerse(v: number) {
    if (typeof window === "undefined") return
    stopPlayback()
    buildQueue(v)
    isPlayingRef.current = true
    pausedRef.current = false
    setIsPlaying(true)
    speakCurrent()
  }

  function pause() {
    if (typeof window === "undefined") return
    pausedRef.current = true
    if ("speechSynthesis" in window) window.speechSynthesis.pause()
    setIsPlaying(false)
  }

  function stop() {
    stopPlayback()
    setCurrentVerse(null)
  }

  function step(dir: -1 | 1) {
    const list = verses.filter((v) => v.texts[primaryCode ?? ""]).map((v) => v.verse)
    if (!list.length) return
    const cur = currentVerse ?? list[0]
    const i = list.indexOf(cur)
    const ni = i + dir
    if (ni < 0 || ni >= list.length) return
    playVerse(list[ni])
  }

  function goto(ch: number) {
    router.push(`/read/${bookAbbrev}/${ch}`)
  }

  if (!verses.length) {
    return <p className="text-muted-foreground">Chưa có dữ liệu cho chương này.</p>
  }

  return (
    <div className="space-y-4">
      {/* Thanh điều khiển audio */}
      <div className="sticky top-2 z-30 flex flex-wrap items-center gap-2 rounded-xl border bg-background/95 p-2 backdrop-blur">
        <div className="flex items-center gap-1">
          {isPlaying ? (
            <button onClick={pause} className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90" aria-label="Tạm dừng"><Pause className="h-4 w-4" /></button>
          ) : (
            <button onClick={playChapter} className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground hover:opacity-90" aria-label="Phát chương"><Play className="h-4 w-4" /></button>
          )}
          <button onClick={stop} className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent" aria-label="Dừng"><Square className="h-4 w-4" /></button>
          <button onClick={() => step(-1)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent" aria-label="Câu trước"><SkipBack className="h-4 w-4" /></button>
          <button onClick={() => step(1)} className="inline-flex h-9 w-9 items-center justify-center rounded-md border hover:bg-accent" aria-label="Câu sau"><SkipForward className="h-4 w-4" /></button>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{primary ? primary.abbreviation : ""}</span>
          <span>·</span>
          <span>{currentVerse != null ? `Câu ${currentVerse}` : "Sẵn sàng"}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <label className="font-medium text-foreground">Giọng</label>
          <select value={voiceURI ?? ""} onChange={(e) => setVoiceURI(e.target.value || null)} className="h-8 rounded-md border bg-background px-2 text-xs">
            {voices
              .filter((v) => v.lang?.toLowerCase().startsWith(lang.split("-")[0].toLowerCase()))
              .map((v) => (
                <option key={v.voiceURI} value={v.voiceURI}>{v.name}</option>
              ))}
          </select>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Tốc độ</label>
          <select value={rate} onChange={(e) => setRate(Number(e.target.value))} className="h-8 rounded-md border bg-background px-2 text-xs">
            <option value={0.8}>0.8x</option>
            <option value={1}>1x</option>
            <option value={1.2}>1.2x</option>
            <option value={1.5}>1.5x</option>
          </select>
        </div>
        {!supported && <span className="text-xs text-muted-foreground">Thiết bị không hỗ trợ đọc tự động.</span>}
      </div>

      {/* Điều hướng chương */}
      <div className="flex items-center justify-between">
        <button onClick={() => navigation.prevChapter && goto(navigation.prevChapter)} disabled={!navigation.prevChapter} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-40">
          <ChevronLeft className="h-4 w-4" /> Chương trước
        </button>
        <span className="text-sm text-muted-foreground">{verses.length} câu</span>
        <button onClick={() => navigation.nextChapter && goto(navigation.nextChapter)} disabled={!navigation.nextChapter} className="inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-40">
          Chương sau <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Công tắc hiện số Strong's */}
      <div className="flex items-center gap-2">
        <Button
          variant={showStrong ? "default" : "outline"}
          size="sm"
          onClick={() => setShowStrong((s) => !s)}
          aria-pressed={showStrong}
        >
          <BookA className="h-4 w-4" /> Số Strong's
        </Button>
        {showStrong && <span className="text-xs text-muted-foreground">Rê chuột vào số Strong's để xem định nghĩa (Hê-bơ-rơ xanh / Hy-lạp xanh dương).</span>}
      </div>

      {/* Các cột bản dịch song song */}
      <div className="reader-cols" style={{ "--cols": versions.length } as CSSProperties}>
        {versions.map((v) => (
          <section key={v.code} className="rounded-xl border bg-card">
            <header className="flex items-center justify-between border-b px-4 py-2">
              <span className="text-sm font-semibold">{v.name}</span>
              <span className={"rounded px-1.5 py-0.5 text-[10px] font-bold " + (v.language === "en" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" : "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300")}>
                {v.language === "en" ? "ANH" : "VIỆT"}
              </span>
            </header>
            <div className="space-y-3 p-4 reader-verses">
              {verses.map((verse) => {
                const text = verse.texts[v.code]
                const active = currentVerse === verse.verse && v.code === primaryCode
                const vref = `${bookAbbrev} ${chapter}:${verse.verse}`
                const hl = study.state.highlights[vref]
                const words = verseWords?.[verse.verse]
                return (
                  <Fragment key={verse.verse}>
                    <p
                      data-verse={verse.verse}
                      className={
                        "flex gap-2 rounded-md px-1 py-0.5 transition-colors " +
                        (active ? "bg-primary/10 ring-1 ring-primary/30 " : "") +
                        (hl ? hl + " " : "")
                      }
                    >
                      <sup className="select-none pt-1 text-xs font-semibold text-muted-foreground">{verse.verse}</sup>
                      <span className="flex-1 leading-relaxed">
                        {text ? text : <span className="text-muted-foreground/50">—</span>}
                      </span>
                      {v.code === primaryCode && (
                        <span className="relative flex items-start gap-0.5 self-start pt-1">
                          <button
                            onClick={() => playVerse(verse.verse)}
                            className="text-muted-foreground hover:text-primary"
                            aria-label={`Đọc câu ${verse.verse}`}
                          >
                            <Volume2 className="h-4 w-4" />
                          </button>
                          <VerseStudyButtons ref={vref} study={study} />
                        </span>
                      )}
                    </p>
                    {v.code === primaryCode && showStrong && words && (
                      <span className="block flex flex-wrap gap-1 px-1 pb-2 pl-7">
                        {words.map((w, i) => {
                          const entry = w.strongEntry
                          const token = (
                            <span
                              className={cn(
                                "inline-flex items-baseline gap-1 rounded px-1 py-0.5 text-xs",
                                entry
                                  ? entry.language === "HEBREW"
                                    ? "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300"
                                    : "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300"
                                  : "bg-muted text-muted-foreground"
                              )}
                            >
                              <span className={entry?.language === "HEBREW" ? "hebrew-font" : "greek-font"}>
                                {w.hebrewGreek}
                              </span>
                              {w.strongNumber && <span className="font-mono">{w.strongNumber}</span>}
                            </span>
                          )
                          return entry ? (
                            <StrongsHoverCard key={i} data={entry}>
                              {token}
                            </StrongsHoverCard>
                          ) : (
                            <span key={i}>{token}</span>
                          )
                        })}
                      </span>
                    )}
                  </Fragment>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}
