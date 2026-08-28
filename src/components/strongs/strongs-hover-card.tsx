"use client"

import { createPortal } from "react-dom"
import { useEffect, useRef, useState, type ReactNode } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"

export interface HoverStrongData {
  strongNumber: string
  transliteration: string
  definition: string
  vietnameseDef?: string | null
  language: "HEBREW" | "GREEK"
}

export function StrongsHoverCard({ data, children }: { data: HoverStrongData; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null)
  const anchorRef = useRef<HTMLSpanElement>(null)
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isHebrew = data.language === "HEBREW"

  const scheduleShow = () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
    const el = anchorRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const top = Math.min(r.bottom + 8, (typeof window !== "undefined" ? window.innerHeight : 800) - 230)
    const left = Math.min(Math.max(8, r.left), (typeof window !== "undefined" ? window.innerWidth : 1200) - 312)
    setCoords({ top, left })
    setOpen(true)
  }
  const scheduleHide = () => {
    hideTimer.current = setTimeout(() => setOpen(false), 200)
  }

  useEffect(() => () => {
    if (hideTimer.current) clearTimeout(hideTimer.current)
  }, [])

  return (
    <span
      ref={anchorRef}
      className="relative inline-flex"
      onMouseEnter={scheduleShow}
      onMouseLeave={scheduleHide}
    >
      {children}
      {open &&
        coords &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            onMouseEnter={() => {
              if (hideTimer.current) clearTimeout(hideTimer.current)
            }}
            onMouseLeave={scheduleHide}
            style={{ position: "fixed", top: coords.top, left: coords.left, width: 300, zIndex: 60 }}
            className="rounded-lg border bg-card text-card-foreground shadow-xl p-3 text-sm"
            role="tooltip"
          >
            <div className="flex items-center gap-2 mb-1.5">
              <code
                className={cn(
                  "px-1.5 py-0.5 text-xs font-mono rounded",
                  isHebrew
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                )}
              >
                {data.strongNumber}
              </code>
              <span className="font-mono text-xs text-muted-foreground">{data.transliteration}</span>
              <span className="text-xs text-muted-foreground ml-auto">{isHebrew ? "Hê-bơ-rơ" : "Hy-lạp"}</span>
            </div>
            {data.vietnameseDef && (
              <p className="text-xs text-primary/90 mb-1 line-clamp-3">{data.vietnameseDef}</p>
            )}
            <p className="text-xs text-muted-foreground line-clamp-4 whitespace-pre-wrap">{data.definition}</p>
            <div className="mt-2 flex gap-2">
              <Link
                href={`/strongs/${data.strongNumber}`}
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                Chi tiết Strongs →
              </Link>
              <Link
                href={`/word-study/${data.strongNumber}`}
                className="text-xs font-medium text-primary hover:underline"
                onClick={() => setOpen(false)}
              >
                Khảo cứu →
              </Link>
            </div>
          </div>,
          document.body
        )}
    </span>
  )
}
