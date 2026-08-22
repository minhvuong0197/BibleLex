import Link from "next/link"
import { BookOpen, Search } from "lucide-react"

export default function StrongsNotFound() {
  return (
    <div className="container py-16 md:py-24">
      <div className="mx-auto max-w-md text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
          <BookOpen className="h-7 w-7 text-muted-foreground" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Không tìm thấy số Strongs</h1>
        <p className="mt-3 text-muted-foreground">
          Mã Strongs bạn yêu cầu không tồn tại trong dữ liệu hiện tại. Có thể số này chưa được nhập vào từ điển, hoặc định dạng không đúng (ví dụ: H430, G2980).
        </p>
        <div className="mt-8 flex items-center justify-center gap-3">
          <Link
            href="/strongs"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <Search className="h-4 w-4" />
            Tra cứu Strongs
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  )
}
