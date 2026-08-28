"use client"

import { useEffect, useState } from "react"
import { BookText, Loader2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Entry {
  verse?: number
  section: string
  content: string
}

export function CommentaryPanel({ book, chapter }: { book: string; chapter: number }) {
  const [entries, setEntries] = useState<Entry[] | null>(null)
  const [open, setOpen] = useState(true)

  useEffect(() => {
    let cancelled = false
    setEntries(null)
    fetch(`/api/commentary?book=${encodeURIComponent(book)}&chapter=${chapter}`)
      .then((r) => r.json())
      .then((d) => {
        if (!cancelled) setEntries(d.entries ?? [])
      })
      .catch(() => {
        if (!cancelled) setEntries([])
      })
    return () => {
      cancelled = true
    }
  }, [book, chapter])

  return (
    <section className="mt-8">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-lg font-semibold tracking-tight"
        aria-expanded={open}
      >
        <BookText className="h-5 w-5 text-primary" />
        Giải kinh
        <span className="text-xs font-normal text-muted-foreground">(công cộng, có thể mở rộng)</span>
      </button>
      {open && (
        <div className="mt-3 space-y-3">
          {entries === null && (
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Đang tải giải kinh…
            </p>
          )}
          {entries && entries.length === 0 && (
            <p className="text-sm text-muted-foreground">Chưa có mục giải kinh cho chương này.</p>
          )}
          {entries?.map((e, i) => (
            <Card key={i}>
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-2 mb-1">
                  {e.verse != null && <Badge variant="outline" className="text-xs">Câu {e.verse}</Badge>}
                  <span className="text-xs text-muted-foreground">{e.section}</span>
                </div>
                <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{e.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  )
}
