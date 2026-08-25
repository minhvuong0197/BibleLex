import Link from "next/link"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/layout/logo"

const SIZES = {
  lg: { box: "h-12 w-12", icon: "h-11 w-11", text: "text-4xl", radius: "rounded-2xl" },
  sm: { box: "h-9 w-9", icon: "h-8 w-8", text: "text-2xl", radius: "rounded-xl" },
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
      className={cn("flex items-center gap-1 text-[#00A6FF]", className)}
      aria-label="SCRIPTLEX — Trang chủ"
    >
      <span className={cn("flex shrink-0 items-center justify-center bg-[#00A6FF]", s.box, s.radius)}>
        <Logo className={cn(s.icon, "text-white")} aria-hidden="true" />
      </span>
      <span className={cn("font-bold tracking-tight", s.text)}>SCRIPTLEX</span>
    </Link>
  )
}
