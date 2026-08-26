import { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import { ChevronRight, BookOpen, Globe, Type } from 'lucide-react'
import { BOOKS_OT, BOOKS_NT, getBookAbbreviation, getBookViName } from '@/lib/utils'

export const metadata: Metadata = {
  title: "Kinh Thánh đối chiếu",
  description: "Kinh Thánh đối chiếu Hê-bơ-rơ/Hy-lạp và Việt/Anh với phân tích từ vựng từng chữ. Xem sự phân tích hình thái, số Strongs, và bấm để tra cứu chi tiết.",
}

const testamentInfo = {
  OLD: {
    name: "Cựu Ước",
    language: "Hê-bơ-rơ",
    icon: Globe,
    color: "green",
    books: BOOKS_OT,
  },
  NEW: {
    name: "Tân Ước", 
    language: "Hy-lạp",
    icon: Type,
    color: "blue",
    books: BOOKS_NT,
  }
}

export default async function InterlinearIndexPage() {
  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><Link href="/" className="hover:text-foreground transition-colors">Trang chủ</Link></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Kinh Thánh đối chiếu</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-primary" />
          Kinh Thánh đối chiếu
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Kinh Thánh đối chiếu với phân tích từ vựng Hê-bơ-rơ/Hy-lạp nguyên ngữ. Mỗi chữ đều hiển thị số Strongs, sự phân tích hình thái, và định nghĩa.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 mb-12">
        {(['OLD', 'NEW'] as const).map((testament) => {
          const info = testamentInfo[testament]
          const Icon = info.icon

          return (
              <Link key={testament} href={`/interlinear/${getBookAbbreviation(info.books[0])}/1`}>
              <Card className="h-full hover:shadow-lg transition-shadow border-l-4 border-primary group">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className={cn("w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform", `bg-${info.color}-100 text-${info.color}-600 dark:bg-${info.color}-900/30 dark:text-${info.color}-400`)}>
                      <Icon className="h-7 w-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold">{info.name}</h3>
                      <p className="text-sm text-muted-foreground mb-2">{info.language} · {info.books.length} sách</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" /> {info.books.length} sách
                        </span>
                        <span className="flex items-center gap-1">
                          <Type className="h-4 w-4" /> {info.language}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="h-6 w-6 text-muted-foreground group-hover:text-foreground transition-colors mt-1" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>

      <div className="space-y-12">
        {(['OLD', 'NEW'] as const).map((testament) => {
          const info = testamentInfo[testament]
          const Icon = info.icon
          return (
            <section key={testament}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Icon className={cn("h-6 w-6", `text-${info.color}-600`)} />
                  {info.name} ({info.language})
                </h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {info.books.map((book) => {
                  const abbreviation = getBookAbbreviation(book)
                  return (
                    <Link key={book} href={`/interlinear/${abbreviation}/1`} className="group">
                      <Card className="h-full transition-shadow border-l-2 hover:shadow-md border-primary/50 group-hover:border-primary">
                        <CardContent className="pt-4 pb-4 pr-4 pl-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold text-white flex-shrink-0 bg-blue-600">
                                 {abbreviation}
                               </span>
                              <span className="font-medium text-sm truncate group-hover:text-primary transition-colors">
                                {getBookViName(book)}
                              </span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>

      <section className="mt-16 p-8 rounded-xl bg-primary/5 border border-primary/20">
        <h2 className="text-2xl font-bold text-center mb-4">Tính năng Kinh Thánh đối chiếu</h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto text-center">
          <div className="p-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Type className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">Văn bản nguyên ngữ</h3>
            <p className="text-sm text-muted-foreground">Hê-bơ-rơ (Cựu Ước) & Hy-lạp (Tân Ước) với bộ font chuyên dụng</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">Phiên âm & Bản dịch</h3>
            <p className="text-sm text-muted-foreground">Phiên âm (transliteration) cùng tiếng Anh/Việt cho mỗi chữ</p>
          </div>
          <div className="p-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-3">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="font-semibold mb-1">Phân tích hình thái</h3>
            <p className="text-sm text-muted-foreground">Số Strongs, sự phân tích hình thái, thì/thể/cách/cách thức, bấm để xem chi tiết</p>
          </div>
        </div>
      </section>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}