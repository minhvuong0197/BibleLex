import Link from "next/link"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/layout/logo"

const SIZES = {
  lg: { box: "h-11 w-11", icon: "h-14 w-14", text: "text-4xl", radius: "rounded-2xl" },
  sm: { box: "h-9 w-9", icon: "h-12 w-12", text: "text-2xl", radius: "rounded-xl" },
} as const

export function Brand({
  size = "lg",
  className,
}: {
  size?: keyof typeof SIZES
  className?: string
}) {
  const s = SIZES[size]
  return (
    <Link
      href="/"
      className={cn("flex items-center gap-1 text-blue-600", className)}
      aria-label="SCRIPTLEX — Trang chủ"
    >
        <span className={cn("relative flex shrink-0 items-center justify-center overflow-visible bg-blue-600", s.box, s.radius)}>
        <Logo className={s.icon} aria-hidden="true" />
      </span>
      <span className={cn("font-bold tracking-tight", s.text)}>SCRIPTLEX</span>
    </Link>
  )
}
