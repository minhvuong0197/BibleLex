"use client"

import { useTheme } from "next-themes"
import { useEffect, useRef, useState } from "react"
import { Sun, Moon, BookOpen, Check } from "lucide-react"
import { Button } from "@/components/ui/button"

const options = [
  { value: "light", label: "Sáng", icon: Sun },
  { value: "dark", label: "Tối", icon: Moon },
  { value: "academic", label: "Học thuật", icon: BookOpen },
] as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("mousedown", onClick)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("mousedown", onClick)
      document.removeEventListener("keydown", onKey)
    }
  }, [])

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="icon"
        aria-label="Chuyển đổi giao diện"
        className="opacity-0"
        tabIndex={-1}
      />
    )
  }

  const current = options.find((o) => o.value === theme) ?? options[0]
  const CurrentIcon = current.icon

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Chuyển đổi giao diện"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <CurrentIcon className="h-5 w-5" />
      </Button>

      {open && (
        <div
          role="menu"
          aria-label="Chọn giao diện"
          className="absolute right-0 mt-2 w-48 rounded-lg border bg-popover text-popover-foreground shadow-lg p-1 z-50"
        >
          {options.map((o) => {
            const Icon = o.icon
            const active = theme === o.value
            return (
              <button
                key={o.value}
                role="menuitemradio"
                aria-checked={active}
                onClick={() => {
                  setTheme(o.value)
                  setOpen(false)
                }}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent hover:text-accent-foreground"
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-left">{o.label}</span>
                {active && <Check className="h-4 w-4 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
