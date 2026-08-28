"use client"

import { useMemo } from "react"
import Link from "next/link"
import { Bookmark, Highlighter, NotebookPen, BookMarked } from "lucide-react"
import { useStudy } from "@/components/reader/verse-study"
import { BOOK_ABBREVIATIONS, getBookViName } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"

function parseRef(ref: string) {
  const [head, verseStr] = ref.split(":")
  const [abbr, chapterStr] = head.split(" ")
  const abbr2 = head.trim()
  const m = abbr2.match(/^(\S+)\s+(\d+)$/)
  const bookAbbr = m ? m[1] : abbr2
  const chapter = m ? parseInt(m[2], 10) : 1
  const verse = parseInt(verseStr || "", 10)
  const vi = getBookViName(BOOK_ABBREVIATIONS[bookAbbr] || bookAbbr) || bookAbbr
  return { bookAbbr, chapter, verse, label: `${vi} ${chapter}:${verse}`, href: `/read/${bookAbbr}/${chapter}` }
}

export default function StudyPage() {
  const { state } = useStudy()

  const bookmarks = useMemo(() => Object.keys(state.bookmarks).map(parseRef).sort((a, b) => a.href.localeCompare(b.href)), [state.bookmarks])
  const highlights = useMemo(() => Object.keys(state.highlights).map(parseRef).sort((a, b) => a.href.localeCompare(b.href)), [state.highlights])
  const notes = useMemo(() => Object.entries(state.notes).map(([ref, text]) => ({ ...parseRef(ref), text })), [state.notes])

  const total = bookmarks.length + highlights.length + notes.length

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Học của tôi</li>
        </ol>
      </nav>

      <div className="mb-8 flex items-center gap-3">
        <BookMarked className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Học của tôi</h1>
          <p className="mt-1 text-muted-foreground">
            {total} mục đã lưu trên thiết bị này (đánh dấu, tô sáng, ghi chú).
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Bookmark className="h-4 w-4 text-primary" /> Đánh dấu ({bookmarks.length})</h2>
            {bookmarks.length === 0 && <p className="text-sm text-muted-foreground">Chưa có câu nào được đánh dấu.</p>}
            <ul className="space-y-1 text-sm">
              {bookmarks.map((b) => (
                <li key={b.href + b.verse}>
                  <Link href={b.href} className="text-primary hover:underline">{b.label}</Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><Highlighter className="h-4 w-4 text-primary" /> Tô sáng ({highlights.length})</h2>
            {highlights.length === 0 && <p className="text-sm text-muted-foreground">Chưa có câu nào được tô sáng.</p>}
            <ul className="space-y-1 text-sm">
              {highlights.map((h) => (
                <li key={h.href + h.verse}>
                  <Link href={h.href} className="text-primary hover:underline">{h.label}</Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="mb-3 flex items-center gap-2 font-semibold"><NotebookPen className="h-4 w-4 text-primary" /> Ghi chú ({notes.length})</h2>
            {notes.length === 0 && <p className="text-sm text-muted-foreground">Chưa có ghi chú nào.</p>}
            <ul className="space-y-3 text-sm">
              {notes.map((n) => (
                <li key={n.href + n.verse}>
                  <Link href={n.href} className="font-medium text-primary hover:underline">{n.label}</Link>
                  <p className="mt-0.5 line-clamp-3 text-muted-foreground">{n.text}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
