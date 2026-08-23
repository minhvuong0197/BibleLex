import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function InterlinearChapterLoading() {
  return (
    <div className="container py-6 md:py-8">
      <div className="mb-6 flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-32" />
        <span className="text-muted-foreground">/</span>
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <Skeleton className="h-9 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-24" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>

      <div className="space-y-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="border-l-2">
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2">
                <Skeleton className="h-6 w-6 rounded" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {Array.from({ length: 6 }).map((_, j) => (
                  <div key={j} className="space-y-1">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
