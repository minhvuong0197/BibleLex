import { Metadata } from 'next'
import { cacheLife } from "next/cache"
import { prisma } from '@/lib/db'
import { StrongsSearch } from '@/components/strongs/strongs-search'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronRight, BookOpen, Hash, Globe } from 'lucide-react'
import { BOOKS_OT, BOOKS_NT, getTestament, getBookAbbreviation, getBookViName } from '@/lib/utils'

export const metadata: Metadata = {
  title: "Tra cứu Strongs",
  description: "Tra cứu định nghĩa từ vựng nguyên ngữ Hê-bơ-rơ và Hy-lạp trong Kinh Thánh theo số Strongs (G1234/H1234), gồm Thayer, BDB, LSJ, phân tích hình thái và tham chiếu chéo.",
}

const popularStrongNumbers = [
  { number: 'G26', name: 'agapē', desc: 'Yêu thương, tình yêu thương' },
  { number: 'G5547', name: 'chrēstotēs', desc: 'Nhân từ, sự thiện lành' },
  { number: 'G4151', name: 'pneuma', desc: 'Thần, linh, gió' },
  { number: 'G4982', name: 'sōzō', desc: 'Cứu, chữa lành, giải cứu' },
  { number: 'G3056', name: 'logos', desc: 'Lời, lời nói, Ngôi Lời' },
  { number: 'H1254', name: 'bārā', desc: 'Sáng tạo, tạo nên (Chúa)' },
  { number: 'H2617', name: 'ḥesed', desc: 'Lòng nhân từ, đức thành tín' },
  { number: 'H3068', name: 'YHWH', desc: 'Danh thánh CHÚA (Đức Giê-hô-va)' },
  { number: 'H430', name: 'elōhîm', desc: 'Đức Chúa Trời, Chúa Trời, thần' },
  { number: 'H7999', name: 'šālōm', desc: 'Bình an, hòa bình, sự trọn lành' },
]

export default async function StrongsIndexPage() {
  'use cache'
  cacheLife({ stale: 86400, revalidate: 604800, expire: 31536000 })
  const [hebrewCount, greekCount] = await Promise.all([
    prisma.strongEntry.count({ where: { language: 'HEBREW' } }),
    prisma.strongEntry.count({ where: { language: 'GREEK' } }),
  ])

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><a href="/" className="hover:text-foreground transition-colors">Trang chủ</a></li>
          <li aria-hidden="true">/</li>
           <li className="text-foreground font-medium" aria-current="page">Tra cứu Strongs</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Tra cứu Strongs</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Tra cứu định nghĩa, nguồn gốc từ vựng, cách dùng và hình thái của từ vựng nguyên ngữ Hê-bơ-rơ và Hy-lạp trong Kinh Thánh.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-12">
        <div className="lg:col-span-2">
          <StrongsSearch />
        </div>
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Hash className="h-6 w-6 text-primary" />
                  <span className="text-xl font-semibold">Tổng cộng</span>
                </div>
                 <p className="text-4xl font-bold text-primary">{hebrewCount + greekCount.toLocaleString()}</p>
                 <p className="text-sm text-muted-foreground">từ vựng nguyên ngữ</p>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-500" />
                     <span className="font-medium">Hê-bơ-rơ (Cựu Ước)</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-green-700 dark:text-green-400">{hebrewCount.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-500" />
                     <span className="font-medium">Hy-lạp (Tân Ước)</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-blue-700 dark:text-blue-400">{greekCount.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="mb-12">
         <h2 className="text-2xl font-bold mb-6">Các số Strongss phổ biến</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {popularStrongNumbers.map((item) => (
            <Link key={item.number} href={`/strongs/${item.number}`} className="group">
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardContent className="pt-4 pb-4 pr-4 pl-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "px-3 py-1.5 rounded font-mono font-semibold text-sm",
                      item.number.startsWith('H') 
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    )}>
                      {item.number}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-8">
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6" /> Cựu Ước (Hê-bơ-rơ)
          </h2>
          <BookList books={BOOKS_OT} testament="OLD" />
        </section>
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <BookOpen className="h-6 w-6" /> Tân Ước (Hy-lạp)
          </h2>
          <BookList books={BOOKS_NT} testament="NEW" />
        </section>
      </div>
    </div>
  )
}

function BookList({ books, testament }: { books: string[]; testament: 'OLD' | 'NEW' }) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {books.map((book) => (
        <Link key={book} href={`/interlinear/${getBookAbbreviation(book)}/1`} className="group">
          <Card className="transition-shadow h-full border-l-4 hover:shadow-md border-primary">
            <CardContent className="pt-3 pb-3 pr-3 pl-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm group-hover:text-primary transition-colors">
                  {getBookViName(book)}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}