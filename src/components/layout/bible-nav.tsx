"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  BOOKS_OT,
  BOOKS_NT,
  BOOK_CHAPTERS,
  getBookAbbreviation,
  getBookViName,
} from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { BookOpen, X, ChevronLeft } from "lucide-react"

type Mode = "read" | "interlinear"

export function BibleNav({ variant = "button" }: { variant?: "button" | "icon" }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [testament, setTestament] = useState<"OT" | "NT">("OT")
  const [book, setBook] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>("read")

  const books = testament === "OT" ? BOOKS_OT : BOOKS_NT

  const go = (b: string, ch: number) => {
    const abbr = getBookAbbreviation(b)
    router.push(mode === "read" ? `/read/${abbr}/${ch}` : `/interlinear/${abbr}/${ch}`)
    setOpen(false)
    setBook(null)
  }

  return (
    <>
      <Button
        variant={variant === "icon" ? "ghost" : "outline"}
        size={variant === "icon" ? "icon" : "sm"}
        onClick={() => setOpen(true)}
        className={variant === "button" ? "gap-1.5" : ""}
        aria-label="Chọn sách và chương"
      >
        <BookOpen className="h-4 w-4" />
        {variant === "button" && "Chọn sách"}
      </Button>

      {open && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50" onClick={() => { setOpen(false); setBook(null) }} role="dialog" aria-modal="true">
          <div
            className="bg-background w-full max-w-3xl max-h-[88vh] overflow-hidden rounded-xl border shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-3">
              <h2 className="font-semibold">Điều hướng Kinh Thánh</h2>
              <div className="flex items-center gap-2">
                <div className="flex rounded-md border p-0.5 text-xs">
                  <button
                    onClick={() => setMode("read")}
                    className={mode === "read" ? "rounded bg-primary px-2 py-1 text-primary-foreground" : "px-2 py-1 text-muted-foreground"}
                  >
                    Đọc
                  </button>
                  <button
                    onClick={() => setMode("interlinear")}
                    className={mode === "interlinear" ? "rounded bg-primary px-2 py-1 text-primary-foreground" : "px-2 py-1 text-muted-foreground"}
                  >
                    Đối chiếu
                  </button>
                </div>
                <Button variant="ghost" size="icon" onClick={() => { setOpen(false); setBook(null) }} aria-label="Đóng">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 border-b p-3">
              <button
                onClick={() => setTestament("OT")}
                className={testament === "OT" ? "rounded-md bg-accent px-3 py-1 text-sm font-medium" : "rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-accent/50"}
              >
                Cựu Ước
              </button>
              <button
                onClick={() => setTestament("NT")}
                className={testament === "NT" ? "rounded-md bg-accent px-3 py-1 text-sm font-medium" : "rounded-md px-3 py-1 text-sm text-muted-foreground hover:bg-accent/50"}
              >
                Tân Ước
              </button>
            </div>

            <div className="overflow-y-auto p-3">
              {!book ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                  {books.map((b) => (
                    <button
                      key={b}
                      onClick={() => setBook(b)}
                      className="flex flex-col items-start rounded-lg border p-2 text-left hover:bg-accent transition-colors"
                    >
                      <span className="text-sm font-medium">{getBookViName(b)}</span>
                      <span className="text-xs text-muted-foreground">{BOOK_CHAPTERS[b] ?? "?"} chương</span>
                    </button>
                  ))}
                </div>
              ) : (
                <div>
                  <button
                    onClick={() => setBook(null)}
                    className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="h-4 w-4" /> Quay lại
                  </button>
                  <h3 className="mb-3 font-semibold">{getBookViName(book)} — chọn chương</h3>
                  <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
                    {Array.from({ length: BOOK_CHAPTERS[book] ?? 0 }, (_, i) => i + 1).map((ch) => (
                      <button
                        key={ch}
                        onClick={() => go(book, ch)}
                        className="rounded-md border py-2 text-sm font-mono hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
