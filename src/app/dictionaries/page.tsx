"use client"

import { useState, FormEvent } from "react"
import { Search, Loader2, BookA } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface Entry {
  dict: string
  definition: string
}

export default function DictionariesPage() {
  const [term, setTerm] = useState("")
  const [entries, setEntries] = useState<Entry[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const run = async (q: string) => {
    if (!q.trim()) return
    setIsLoading(true)
    setSearched(true)
    try {
      const res = await fetch(`/api/dictionary?term=${encodeURIComponent(q.trim())}`)
      const data = await res.json()
      setEntries(data.entries ?? [])
    } catch {
      setEntries([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    run(term)
  }

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
          Tra cứu thuật ngữ (public domain — Easton/Smith). Dữ liệu có thể mở rộng.
        </p>
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Nhập thuật ngữ tiếng Anh, ví dụ: love, faith, grace, covenant…"
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="pl-10 text-lg"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Tìm
            </Button>
          </form>
        </CardContent>
      </Card>

      {searched && !isLoading && entries.length === 0 && (
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
          <Card key={i}>
            <CardContent className="pt-4 pb-4">
              <Badge variant="outline" className="mb-2 text-xs">{e.dict}</Badge>
              <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">{e.definition}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
