'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import ReactMarkdown from 'react-markdown'
import RemarkGfm from 'remark-gfm'
import { Sparkles, Languages, BookOpenText, Microscope, Loader2, RefreshCw } from 'lucide-react'

type AiType = 'translate' | 'research' | 'analysis'

const TYPES: AiType[] = ['translate', 'research', 'analysis']

const META: Record<AiType, { label: string; desc: string; icon: typeof Sparkles }> = {
  translate: {
    label: 'Dịch chuyên sâu',
    desc: 'Dịch thuật từ vựng chính xác từ nguyên ngữ (Hê-bơ-rơ / Hy-lạp) sang tiếng Việt, văn phong TTHĐ 2010.',
    icon: Languages,
  },
  research: {
    label: 'Nghiên cứu chuyên sâu',
    desc: 'Khảo cứu cách từ được dùng trong Kinh Thánh, các đoạn trọng yếu và ý nghĩa thần học.',
    icon: BookOpenText,
  },
  analysis: {
    label: 'Phân tích chuyên sâu',
    desc: 'Phân tích hình thái, cú pháp và cách hình thức ảnh hưởng đến nghĩa của từ.',
    icon: Microscope,
  },
}

export interface AiAnalysisSectionProps {
  strongNumber: string
  language: 'HEBREW' | 'GREEK'
  transliteration?: string
}

export function AiAnalysisSection({ strongNumber, transliteration }: AiAnalysisSectionProps) {
  const [results, setResults] = useState<Record<AiType, string | null>>({
    translate: null,
    research: null,
    analysis: null,
  })
  const [cached, setCached] = useState<Record<AiType, boolean>>({
    translate: false,
    research: false,
    analysis: false,
  })
  const [loading, setLoading] = useState<Record<AiType, boolean>>({
    translate: false,
    research: false,
    analysis: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [model, setModel] = useState<string>('')
  const [providerLabel, setProviderLabel] = useState<string>('')
  const [modelOptions, setModelOptions] = useState<string[]>([])

  /* eslint-disable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */
  useEffect(() => {
    let cancelled = false
    setError(null)
    fetch(`/api/ai?strongNumber=${encodeURIComponent(strongNumber)}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data?.analyses) {
          const next = { ...results }
          const nextCached = { ...cached }
          for (const t of TYPES) {
            const a = data.analyses[t]
            if (a?.content) {
              next[t as AiType] = a.content
              nextCached[t as AiType] = true
            }
          }
          setResults(next)
          setCached(nextCached)
        }
      })
      .catch(() => {})
    fetch('/api/ai')
      .then((r) => r.json())
      .then((meta) => {
        if (cancelled) return
        if (meta && !meta.error) {
          setProviderLabel(meta.providerLabel || '')
          setModelOptions(Array.from(new Set(meta.models || [])))
          setModel(meta.model || '')
        }
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [strongNumber])
  /* eslint-enable react-hooks/set-state-in-effect, react-hooks/exhaustive-deps */

  async function generate(type: AiType, force: boolean) {
    setLoading((s) => ({ ...s, [type]: true }))
    setError(null)
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strongNumber, type, force, model: model || undefined }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data?.error || 'Không thể tạo nội dung AI')
        return
      }
      setResults((s) => ({ ...s, [type]: data.content }))
      setCached((s) => ({ ...s, [type]: Boolean(data.cached) }))
    } catch {
      setError('Lỗi kết nối đến máy chủ AI')
    } finally {
      setLoading((s) => ({ ...s, [type]: false }))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3 rounded-lg border border-primary/30 bg-primary/5 p-4">
        <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
        <div className="text-sm text-muted-foreground">
          <p className="font-medium text-foreground">Trợ lý AI nghiên cứu Kinh Thánh</p>
          <p>
            Sử dụng mô hình ngôn ngữ lớn để dịch, nghiên cứu và phân tích chuyên sâu thuật ngữ{' '}
            <span className="font-mono">{strongNumber}</span>{' '}
            {transliteration ? <span className="italic">({transliteration})</span> : null} theo văn phong TTHĐ 2010.
            Kết quả được lưu lại để tái sử dụng.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 rounded-lg border bg-muted/40 p-3">
        <span className="text-sm font-medium text-foreground">Mô hình</span>
        <Input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          placeholder="tên mô hình"
          className="h-8 w-48 text-sm"
          aria-label="Tên mô hình AI"
        />
        {modelOptions.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {modelOptions.filter((m) => m !== model).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setModel(m)}
                className="rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary"
              >
                {m}
              </button>
            ))}
          </div>
        )}
        {providerLabel && <Badge variant="outline" className="ml-auto">{providerLabel}</Badge>}
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-1">
        {TYPES.map((type) => {
          const Icon = META[type].icon
          const isLoading = loading[type]
          const content = results[type]
          return (
            <Card key={type}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <CardTitle className="text-base">{META[type].label}</CardTitle>
                      <CardDescription className="text-xs">{META[type].desc}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {content && cached[type] && <Badge variant="secondary">Đã lưu</Badge>}
                    <Button
                      size="sm"
                      variant={content ? 'outline' : 'default'}
                      onClick={() => generate(type, false)}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-1 h-4 w-4 animate-spin" /> Đang tạo…
                        </>
                      ) : content ? (
                        <>
                          <RefreshCw className="mr-1 h-4 w-4" /> Tạo lại
                        </>
                      ) : (
                        'Tạo nội dung'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              {content && (
                <CardContent>
                  <div className="prose prose-sm max-w-none text-sm leading-relaxed">
                    <ReactMarkdown remarkPlugins={[RemarkGfm]}>{content}</ReactMarkdown>
                  </div>
                </CardContent>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
