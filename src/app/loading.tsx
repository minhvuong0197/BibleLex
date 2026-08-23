import { Skeleton } from "@/components/ui/skeleton"

export default function RootLoading() {
  return (
    <div className="container py-8 md:py-12">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="mb-2 h-9 w-72" />
      <Skeleton className="mb-8 h-5 w-full max-w-xl" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full rounded-lg" />
        ))}
      </div>
    </div>
  )
}
