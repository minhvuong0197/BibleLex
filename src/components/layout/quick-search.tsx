"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search } from "lucide-react"
import { parseQuickReference, quickBookSuggestions, type QuickBook, type ParsedReference } from "@/lib/utils"

export function QuickSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<QuickBook[]>([])
  const wrapRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDoc)
    return () => document.removeEventListener("mousedown", onDoc)
  }, [])

  // Input uncontrolled để tương thích IME tiếng Việt (gõ dấu không bị ngắt).
  function refresh(val: string) {
    if (!val.trim()) {
      setSuggestions([])
      setOpen(false)
      return
    }
    setSuggestions(quickBookSuggestions(val, 8))
    setOpen(true)
  }

  function clearInput() {
    if (inputRef.current) inputRef.current.value = ""
    setOpen(false)
    setSuggestions([])
  }

  function go(target: QuickBook | ParsedReference) {
    let abbr: string
    let chapter = 1
    let verse: number | undefined
    if ("abbr" in target && "vi" in target) {
      abbr = (target as QuickBook).abbr
    } else {
      const p = target as ParsedReference
      abbr = p.abbr
      chapter = p.chapter ?? 1
      verse = p.verse
    }
    const href = verse
      ? `/interlinear/${abbr}/${chapter}#${abbr}-${chapter}-${verse}`
      : `/interlinear/${abbr}/${chapter}`
    router.push(href)
    clearInput()
  }

  function submit() {
    const val = inputRef.current?.value ?? ""
    const parsed = parseQuickReference(val)
    if (parsed) {
      go(parsed)
      return
    }
    if (suggestions.length) go(suggestions[0])
  }

  function onKey(e: React.KeyboardEvent<HTMLInputElement>) {
    // Đang soạn dấu IME (vd gõ 'Sáng') -> không can thiệp phím
    if (e.nativeEvent.isComposing) return
    if (e.key === " ") {
      const el = e.currentTarget
      const val = el.value
      const pos = el.selectionStart ?? val.length
      const before = val.slice(0, pos)
      // Sau khi gõ số chương, Space tự chuyển thành ':' để gõ số câu
      if (/ \d+$/.test(before)) {
        e.preventDefault()
        const newVal = val.slice(0, pos) + ":" + val.slice(pos)
        if (inputRef.current) inputRef.current.value = newVal
        refresh(newVal)
        requestAnimationFrame(() => {
          const node = inputRef.current
          if (node) node.selectionStart = node.selectionEnd = pos + 1
        })
        return
      }
    } else if (e.key === "Enter") {
      e.preventDefault()
      submit()
    } else if (e.key === "Escape") {
      setOpen(false)
    }
  }

  return (
    <div ref={wrapRef} className="relative w-full">
      <div className="flex items-center gap-2 rounded-lg border bg-background px-2.5 h-9 focus-within:ring-2 focus-within:ring-ring">
        <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
        <input
          ref={inputRef}
          defaultValue=""
          onChange={(e) => refresh(e.target.value)}
          onKeyDown={onKey}
          onFocus={() => inputRef.current?.value.trim() && setOpen(true)}
          placeholder="Tìm sách (vd: Sa 1:1, Mat 2)…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          aria-label="Tìm kiếm nhanh Kinh Thánh"
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-lg border bg-popover text-popover-foreground shadow-lg max-h-72 overflow-auto"
        >
          {suggestions.map((b) => (
            <li key={b.abbr} role="option" aria-selected={false}>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault()
                  go(b)
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <span className="font-medium truncate">{b.vi}</span>
                <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{b.abbr}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
