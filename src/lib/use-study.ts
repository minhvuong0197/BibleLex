"use client"

import { useEffect, useState } from "react"
import { parseVerseRef } from "@/lib/study-ref"

export interface StudyState {
  notes: Record<string, string>
  bookmarks: Record<string, boolean>
  highlights: Record<string, string>
}

const KEY = "scriptlex_study_v1"
const EMPTY: StudyState = { notes: {}, bookmarks: {}, highlights: {} }
const HIGHLIGHT_CLASS = "bg-yellow-200/60 dark:bg-yellow-500/20"

function loadLocal(): StudyState {
  try {
    const r = localStorage.getItem(KEY)
    return r ? { ...EMPTY, ...JSON.parse(r) } : EMPTY
  } catch {
    return EMPTY
  }
}

function saveLocal(s: StudyState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

export function useStudy(userId?: string) {
  const remote = !!userId
  const [state, setState] = useState<StudyState>(EMPTY)

  useEffect(() => {
    if (remote) {
      Promise.all([
        fetch("/api/notes").then((r) => (r.ok ? r.json() : { items: [] })),
        fetch("/api/bookmarks").then((r) => (r.ok ? r.json() : { items: [] })),
        fetch("/api/highlights").then((r) => (r.ok ? r.json() : { items: [] })),
      ])
        .then(([n, b, h]) => {
          const notes: Record<string, string> = {}
          const bookmarks: Record<string, boolean> = {}
          const highlights: Record<string, string> = {}
          for (const it of n.items as any[]) notes[`${it.book} ${it.chapter}:${it.verse}`] = it.text
          for (const it of b.items as any[]) bookmarks[`${it.book} ${it.chapter}:${it.verse}`] = true
          for (const it of h.items as any[])
            highlights[`${it.book} ${it.chapter}:${it.verse}`] = it.color ? HIGHLIGHT_CLASS : HIGHLIGHT_CLASS
          setState({ notes, bookmarks, highlights })
        })
        .catch(() => {})
    } else {
      setState(loadLocal())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [remote, userId])

  async function toggleBookmark(ref: string) {
    const p = parseVerseRef(ref)
    if (!p) return
    if (remote) {
      const active = !!state.bookmarks[ref]
      const res = await fetch("/api/bookmarks", {
        method: active ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(p),
      })
      if (res.ok) setState((s) => ({ ...s, bookmarks: { ...s.bookmarks, [ref]: !active } }))
    } else {
      const s = loadLocal()
      const bookmarks = { ...s.bookmarks }
      if (bookmarks[ref]) delete bookmarks[ref]
      else bookmarks[ref] = true
      const next = { ...s, bookmarks }
      setState(next)
      saveLocal(next)
    }
  }

  async function toggleHighlight(ref: string) {
    const p = parseVerseRef(ref)
    if (!p) return
    if (remote) {
      const active = !!state.highlights[ref]
      const res = await fetch("/api/highlights", {
        method: active ? "DELETE" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...p, color: "yellow" }),
      })
      if (res.ok) setState((s) => ({ ...s, highlights: { ...s.highlights, [ref]: active ? "" : HIGHLIGHT_CLASS } }))
    } else {
      const s = loadLocal()
      const highlights = { ...s.highlights }
      if (highlights[ref]) delete highlights[ref]
      else highlights[ref] = HIGHLIGHT_CLASS
      const next = { ...s, highlights }
      setState(next)
      saveLocal(next)
    }
  }

  async function setNote(ref: string, text: string) {
    const p = parseVerseRef(ref)
    if (!p) return
    if (remote) {
      if (text.trim()) {
        const res = await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...p, text }),
        })
        if (res.ok) setState((s) => ({ ...s, notes: { ...s.notes, [ref]: text } }))
      } else {
        const res = await fetch(
          `/api/notes?book=${p.book}&chapter=${p.chapter}&verse=${p.verse}`,
          { method: "DELETE" }
        )
        if (res.ok)
          setState((s) => {
            const notes = { ...s.notes }
            delete notes[ref]
            return { ...s, notes }
          })
      }
    } else {
      const s = loadLocal()
      const notes = { ...s.notes }
      if (text.trim()) notes[ref] = text
      else delete notes[ref]
      const next = { ...s, notes }
      setState(next)
      saveLocal(next)
    }
  }

  return { state, toggleBookmark, toggleHighlight, setNote }
}
