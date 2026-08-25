import Link from "next/link"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/layout/logo"

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-1 text-[#00A6FF]", className)}
      aria-label="SCRIPTLEX — Trang chủ"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#00A6FF]">
        <Logo className="h-11 w-11 text-white" aria-hidden="true" />
      </span>
      <span className="text-4xl font-bold tracking-tight">SCRIPTLEX</span>
    </Link>
  )
}
