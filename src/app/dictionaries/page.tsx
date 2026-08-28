"use client"

import { useState, useMemo } from "react"
import { Search, Loader2, BookA } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { DICTIONARIES } from "@/lib/dictionary-data"

interface Entry {
  term: string
  dict: string
  definition: string
}

const ALL: Entry[] = Object.entries(DICTIONARIES).flatMap(([term, list]) =>
  list.map((e) => ({ term, ...e }))
)

export default function DictionariesPage() {
  const [term, setTerm] = useState("")
  const q = term.trim().toLowerCase()

  const entries = useMemo(() => {
    if (!q) return ALL
    return ALL.filter(
      (e) => e.term.includes(q) || e.definition.toLowerCase().includes(q)
    )
  }, [q])

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
          Tra cứu thuật ngữ (public domain — Easton/Smith). Hiện có {ALL.length} mục, gõ để lọc.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Lọc thuật ngữ, ví dụ: love, faith, grace, covenant, baptism…"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="pl-10 text-lg"
            />
          </div>
        </CardContent>
      </Card>

      {entries.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookA className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Chưa có mục từ này</h3>
            <p className="text-muted-foreground">Thử thuật ngữ khác hoặc mở rộng dữ liệu từ điển.</p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {entries.map((e, i) => (
          <Card key={`${e.term}-${i}`}>
            <CardContent className="pt-4 pb-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="text-xs">{e.dict}</Badge>
                <span className="text-sm font-semibold text-primary">{e.term}</span>
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{e.definition}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
