"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Search, Menu, X, BookOpen, Brain, Link as LinkIcon, GitBranch } from "lucide-react"
import { Logo } from "@/components/layout/logo"
import { ThemeSwitcher } from "@/components/theme/theme-switcher"
import { useClientPathname } from "@/components/layout/use-client-pathname"
import { useState } from "react"

const navigation = [
  { name: "Tra cứu Strongs", href: "/strongs", icon: Search },
  { name: "Kinh Thánh đối chiếu", href: "/interlinear", icon: BookOpen },
  { name: "Khảo cứu từ vựng", href: "/word-study", icon: Brain },
  { name: "Chủ đề", href: "/topics", icon: LinkIcon },
  { name: "GitHub", href: "/github", icon: GitBranch },
]

export function Header() {
  const pathname = useClientPathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-0.5 text-2xl font-bold text-[#00A6FF]" aria-label="LOGOS LEX Home">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#00A6FF]/15">
              <Logo className="h-7 w-7 text-[#00A6FF]" />
            </span>
            <span>LOGOS LEX</span>
          </Link>

          <nav className="hidden md:flex md:gap-1" role="navigation" aria-label="Main navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground"
                )}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <item.icon className="h-4 w-4" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label={mobileMenuOpen ? "Đóng menu" : "Mở menu"} aria-expanded={mobileMenuOpen}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <ThemeSwitcher />
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t px-4 py-4 space-y-2">
          <nav className="space-y-1" role="navigation" aria-label="Mobile navigation">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={pathname === item.href ? "page" : undefined}
              >
                <item.icon className="h-5 w-5" aria-hidden="true" />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}