"use client"

import { useState, FormEvent } from "react"
import { Search, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { cn, formatStrongNumber, parseStrongNumber } from "@/lib/utils"

interface StrongsSearchProps {
  defaultValue?: string
}

export function StrongsSearch({ defaultValue }: StrongsSearchProps) {
  const [query, setQuery] = useState(defaultValue || "")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = query.trim().toUpperCase()
    
    if (!trimmed) {
      setError("Xin nhập số Strongs (ví dụ: G1234 hoặc H1234)")
      return
    }

    const parsed = parseStrongNumber(trimmed)
    if (!parsed) {
      setError("Nhập sai quy cách. Hãy dùng G1234 (Hy-lạp) hoặc H1234 (Hê-bơ-rơ)")
      return
    }

    setError(undefined)
    setIsLoading(true)
    
    try {
      window.location.href = `/strongs/${formatStrongNumber(trimmed)}`
    } catch {
      setError("Có lỗi xảy ra")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto rounded-md border-2 border-[#00A6FF]/40">
      <CardContent className="pt-6">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold">Tra cứu Strongs</h2>
          <p className="text-muted-foreground mt-1">
            Nhập số Strongs để xem nghĩa gốc, nguồn gốc từ vựng, cách dùng và tham chiếu chéo
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <Input
              type="search"
              placeholder="G1234 hoặc H1234"
              value={query}
              onChange={(e) => setQuery(e.target.value.toUpperCase())}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSubmit(e) }}
              className="pl-12 pr-12 text-center text-lg font-mono tracking-wider"
              disabled={isLoading}
              error={error}
              aria-label="Số Strongs"
              autoComplete="off"
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-primary animate-spin" aria-hidden="true" />
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading} size="lg">
            {isLoading ? "Đang tìm..." : "Tra cứu"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>

          {error && (
            <p className="text-sm text-destructive text-center" role="alert">{error}</p>
          )}

          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground border-t pt-4">
            <span className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 rounded font-mono">G</span>
              Hy-lạp (Tân Ước)
            </span>
            <span className="flex items-center gap-1">
              <span className="px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded font-mono">H</span>
              Hê-bơ-rơ (Cựu Ước)
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}