"use client"

import { useEffect, useState, useCallback } from "react"
import { Bookmark, Highlighter, NotebookPen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export interface StudyState {
  notes: Record<string, string>
  bookmarks: Record<string, boolean>
  highlights: Record<string, string>
}

const KEY = "scriptlex_study_v1"
const EMPTY: StudyState = { notes: {}, bookmarks: {}, highlights: {} }

function load(): StudyState {
  try {
    const r = localStorage.getItem(KEY)
    return r ? { ...EMPTY, ...JSON.parse(r) } : EMPTY
  } catch {
    return EMPTY
  }
}

export function useStudy() {
  const [state, setState] = useState<StudyState>(EMPTY)

  useEffect(() => {
    setState(load())
    const onStorage = () => setState(load())
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, [])

  const persist = useCallback((next: StudyState) => {
    setState(next)
    try {
      localStorage.setItem(KEY, JSON.stringify(next))
    } catch {
      /* ignore */
    }
  }, [])

  const toggleBookmark = useCallback(
    (ref: string) => {
      const s = load()
      const bookmarks = { ...s.bookmarks }
      if (bookmarks[ref]) delete bookmarks[ref]
      else bookmarks[ref] = true
      persist({ ...s, bookmarks })
    },
    [persist]
  )

  const toggleHighlight = useCallback(
    (ref: string) => {
      const s = load()
      const highlights = { ...s.highlights }
      if (highlights[ref]) delete highlights[ref]
      else highlights[ref] = "bg-yellow-200/60 dark:bg-yellow-500/20"
      persist({ ...s, highlights })
    },
    [persist]
  )

  const setNote = useCallback(
    (ref: string, text: string) => {
      const s = load()
      const notes = { ...s.notes }
      if (text.trim()) notes[ref] = text
      else delete notes[ref]
      persist({ ...s, notes })
    },
    [persist]
  )

  return { state, toggleBookmark, toggleHighlight, setNote }
}

export function VerseStudyButtons({ ref, study }: { ref: string; study: ReturnType<typeof useStudy> }) {
  const [noteOpen, setNoteOpen] = useState(false)
  const [noteText, setNoteText] = useState(study.state.notes[ref] || "")
  const bookmarked = !!study.state.bookmarks[ref]
  const highlighted = !!study.state.highlights[ref]

  const saveNote = () => {
    study.setNote(ref, noteText)
    setNoteOpen(false)
  }

  return (
    <span className="inline-flex items-center gap-0.5 self-start pt-1">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label={bookmarked ? "Bỏ đánh dấu" : "Đánh dấu"}
        onClick={() => study.toggleBookmark(ref)}
      >
        <Bookmark className={bookmarked ? "h-4 w-4 text-primary fill-primary" : "h-4 w-4"} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label={highlighted ? "Bỏ tô sáng" : "Tô sáng"}
        onClick={() => study.toggleHighlight(ref)}
      >
        <Highlighter className={highlighted ? "h-4 w-4 text-primary" : "h-4 w-4"} />
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        aria-label="Ghi chú"
        onClick={() => {
          setNoteText(study.state.notes[ref] || "")
          setNoteOpen((o) => !o)
        }}
      >
        <NotebookPen className={study.state.notes[ref] ? "h-4 w-4 text-primary" : "h-4 w-4"} />
      </Button>
      {noteOpen && (
        <span className="absolute z-20 mt-2 w-64 rounded-lg border bg-card p-2 shadow-xl" onClick={(e) => e.stopPropagation()}>
          <textarea
            className="h-24 w-full resize-none rounded-md border bg-background p-2 text-xs"
            placeholder="Ghi chú cá nhân…"
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
          />
          <div className="mt-1 flex justify-end gap-1">
            <Button size="sm" variant="ghost" onClick={() => setNoteOpen(false)}>
              Hủy
            </Button>
            <Button size="sm" onClick={saveNote}>
              <Check className="h-3 w-3" /> Lưu
            </Button>
          </div>
        </span>
      )}
    </span>
  )
}
