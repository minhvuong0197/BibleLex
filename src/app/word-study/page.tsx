import { Metadata } from 'next'
import { cacheLife } from "next/cache"
import { prisma } from '@/lib/db'
import { StrongsSearch } from '@/components/strongs/strongs-search'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { ChevronRight, Brain, Search, BookOpen, TrendingUp, Hash } from 'lucide-react'

export const metadata: Metadata = {
  title: "Khảo cứu từ vựng",
  description: "Khảo cứu chuyên sâu từ vựng Hê-bơ-rơ/Hy-lạp: phân tích hình thái học, thống kê sự xuất hiện, từ đồng nghĩa/trái nghĩa, gốc từ và từ phái sinh.",
}

const studyFeatures = [
  {
    name: "Phân tích hình thái học",
    desc: "Thì, thể, cách, cách thức, số, ngôi, giống — cùng thống kê tần suất từng dạng",
    icon: Brain,
    color: "purple"
  },
  {
    name: "Thống kê xuất hiện",
    desc: "Số lần xuất hiện, phân bố theo sách, chương, câu đầu/cuối xuất hiện",
    icon: TrendingUp,
    color: "blue"
  },
  {
    name: "Mạng lưới từ vựng",
    desc: "Từ đồng nghĩa, trái nghĩa, gốc từ (root), từ phái sinh, từ ghép, trích dẫn",
    icon: Search,
    color: "green"
  },
  {
    name: "Lĩnh vực ngữ nghĩa",
    desc: "Phân loại từ theo semantic domain (Louw-Nida), nhóm từ liên quan theo chủ đề",
    icon: BookOpen,
    color: "orange"
  }
]

export default async function WordStudyPage() {
  'use cache'
  cacheLife({ stale: 86400, revalidate: 604800, expire: 31536000 })
  const [totalWords, totalVerses, topWords] = await Promise.all([
    prisma.strongEntry.count(),
    prisma.verseWord.count(),
    prisma.strongEntry.findMany({
      take: 10,
      orderBy: { verses: { _count: 'desc' } },
      include: { _count: { select: { verses: true } } }
    })
  ])

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><a href="/" className="hover:text-foreground transition-colors">Trang chủ</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Khảo cứu từ vựng</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <Brain className="h-8 w-8 text-primary" />
          Khảo cứu từ vựng chuyên sâu
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Phân tích hình thái học, thống kê cách dùng, và khám phá mối liên hệ giữa các từ vựng nguyên ngữ.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3 mb-12">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Hash className="h-5 w-5" />
                Nhập số Strongs để bắt đầu khảo cứu
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <StrongsSearch />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <p className="text-3xl font-bold text-primary">{totalWords.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Từ vựng nguyên ngữ</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-primary/5">
                  <p className="text-3xl font-bold text-primary">{totalVerses.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">Tổng số chữ trong Kinh Thánh</p>
                </div>
                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Các từ xuất hiện nhiều nhất</h4>
                  <ul className="space-y-2 text-sm">
                    {topWords.map((w, i) => (
                      <li key={i} className="flex items-center justify-between">
                        <Link href={`/strongs/${w.strongNumber}`} className="flex items-center gap-2 hover:text-primary transition-colors">
                          <span className={cn("px-2 py-0.5 rounded font-mono text-xs",
                            w.language === 'HEBREW' ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          )}>{w.strongNumber}</span>
                          <span className="font-medium">{w.transliteration}</span>
                        </Link>
                        <span className="text-muted-foreground">{w._count.verses} lần</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Các công cụ khảo cứu</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {studyFeatures.map((feature) => (
            <Card key={feature.name} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4", `bg-${feature.color}-100 text-${feature.color}-600 dark:bg-${feature.color}-900/30 dark:text-${feature.color}-400`)}>
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold mb-2">{feature.name}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Hướng dẫn khảo cứu từ vựng</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>1. Tra cứu Strongs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Nhập số Strongs (G1234/H1234) để xem:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Định nghĩa Strongs, Thayer, BDB, LSJ</li>
                <li>Nguồn gốc từ vựng (etymology) và từ phái sinh</li>
                <li>Cách dịch trong KJV</li>
                <li>Phân tích hình thái đầy đủ</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>2. Xem Kinh Thánh đối chiếu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Đọc Kinh Thánh đối chiếu để:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Thấy từ nguyên ngữ tại đúng vị trí trong câu</li>
                <li>Hiểu cấu trúc câu tiếng Hê-bơ-rơ/Hy-lạp</li>
                <li>So sánh các bản dịch khác nhau</li>
                <li>Bấm vào chữ bất kỳ để khảo cứu chi tiết</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>3. Khám phá sự liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Dùng tham chiếu chéo để:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Tìm từ đồng nghĩa/trái nghĩa</li>
                <li>Theo dõi gốc từ (root words)</li>
                <li>Xem từ phái sinh và từ ghép</li>
                <li>Tìm trích dẫn Cựu Ước trong Tân Ước</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>4. Khảo cứu chủ đề</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>Dùng chỉ mục chủ đề để:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Tìm tất cả câu về một chủ đề</li>
                <li>So sánh cách dùng từ trong bối cảnh khác nhau</li>
                <li>Xây dựng chuỗi tham chiếu (chain references)</li>
                <li>Soạn bài giảng hoặc học hỏi nhóm</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}