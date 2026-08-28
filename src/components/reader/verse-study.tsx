"use client"

import { useState } from "react"
import { Bookmark, Highlighter, NotebookPen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useStudy } from "@/lib/use-study"

export { useStudy }

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
