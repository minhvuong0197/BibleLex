export const dynamic = "force-dynamic"
import { Metadata } from 'next'
import { prisma } from '@/lib/db'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { Search, BookOpen, Link as LinkIcon, ChevronRight, Filter, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: "Chủ đề & Tham chiếu chéo",
  description: "Khảo cứu Kinh Thánh theo chủ đề: chỉ mục chủ đề, tham chiếu chéo, sự song song các đoạn Kinh Thánh, và chuỗi tham chiếu. Tìm mọi câu liên quan đến một chủ đề.",
}

const quickTopics = [
  "Tình yêu", "Đức tin", "Ơn cứu rỗi", "Đức Thánh Linh", "Sự tha thứ",
  "Hy vọng", "Vâng phục", "Cầu nguyện", "Sự sáng tạo", "Sự thánh khiết",
]

export default async function TopicsPage() {
  const [totalTopics, totalRefs, topics] = await Promise.all([
    prisma.topicalEntry.count(),
    prisma.topicalReference.count(),
    prisma.topicalEntry.findMany({
      orderBy: { topic: 'asc' },
      include: { _count: { select: { references: true } } },
    }),
  ])

  return (
    <div className="container py-8 md:py-12">
      <nav className="mb-6 text-sm" aria-label="Breadcrumb">
        <ol className="flex items-center gap-2 text-muted-foreground">
          <li><a href="/" className="hover:text-foreground transition-colors">Trang chủ</a></li>
          <li aria-hidden="true">/</li>
          <li className="text-foreground font-medium" aria-current="page">Chủ đề & Tham chiếu chéo</li>
        </ol>
      </nav>

      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
          <LinkIcon className="h-8 w-8 text-primary" />
          Chủ đề & Tham chiếu chéo
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Khảo cứu Kinh Thánh theo chủ đề với chỉ mục chủ đề đầy đủ, tham chiếu chéo, và sự song song các đoạn Kinh Thánh.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-4 mb-12">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Tìm kiếm chủ đề
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              <form action="/search" method="get" className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  type="search"
                  placeholder="Tìm chủ đề: yêu thương, đức tin, cầu nguyện, cứu rỗi..."
                  className="pl-10"
                />
                <input type="hidden" name="type" value="topic" />
              </form>
              <div className="flex flex-wrap gap-2">
                {quickTopics.map((tag) => (
                  <Button key={tag} variant="outline" size="sm" asChild>
                    <Link href={`/search?q=${encodeURIComponent(tag)}&type=topic`}>{tag}</Link>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <LinkIcon className="h-6 w-6 text-primary" />
                  <span className="text-xl font-semibold">Thống kê</span>
                </div>
              </div>
              <div className="grid gap-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-primary" />
                    <span className="font-medium">Chủ đề</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-primary">{totalTopics.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2">
                    <LinkIcon className="h-5 w-5 text-primary" />
                    <span className="font-medium">Tham chiếu</span>
                  </div>
                  <span className="font-mono text-lg font-bold text-primary">{totalRefs.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Các chủ đề ({topics.length})</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-2 line-clamp-1">{topic.topic}</h3>
                <p className="text-sm text-muted-foreground mb-3">{topic._count.references} câu tham chiếu</p>
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link href={`/topics/${topic.id}`}>
                    Xem chi tiết <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Loại tham chiếu chéo</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Đồng nghĩa (Synonym)", desc: "Từ có nghĩa tương tự", icon: LinkIcon, color: "blue" },
            { name: "Trái nghĩa (Antonym)", desc: "Từ có nghĩa đối lập", icon: LinkIcon, color: "red" },
            { name: "Gốc từ (Root)", desc: "Từ gốc của từ hiện tại", icon: Search, color: "green" },
            { name: "Từ phái sinh (Derivative)", desc: "Từ được hình thành từ từ này", icon: Search, color: "purple" },
            { name: "Từ ghép (Compound)", desc: "Từ ghép chứa từ này", icon: LinkIcon, color: "orange" },
            { name: "Trích dẫn (Citation)", desc: "Cựu Ước được trích trong Tân Ước", icon: BookOpen, color: "indigo" },
            { name: "Ngụ ý (Allusion)", desc: "Tham chiếu gián tiếp", icon: BookOpen, color: "pink" },
            { name: "Liên quan (Related)", desc: "Mối liên hệ ngữ nghĩa chung", icon: LinkIcon, color: "gray" },
          ].map((type) => {
            const Icon = type.icon
            return (
              <Card key={type.name} className="border-l-4 border-primary">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0", `bg-${type.color}-100 text-${type.color}-600 dark:bg-${type.color}-900/30 dark:text-${type.color}-400`)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold">{type.name}</h4>
                      <p className="text-sm text-muted-foreground">{type.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-6">Cách dùng tham chiếu chéo</h2>
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>1. Từ mục nhập Strongs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Mỗi trang Strongs đều hiển thị tab "Tham chiếu chéo" với:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Từ có liên quan</li>
                <li>Được tham chiếu từ</li>
                <li>Loại mối liên hệ</li>
                <li>Ghi chú giải nghĩa</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>2. Kinh Thánh đối chiếu</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Khi đọc Kinh Thánh đối chiếu, bấm vào chữ bất kỳ:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Xem bảng chi tiết từ</li>
                <li>Nhấn "Khảo cứu từ vựng" để xem tham chiếu chéo</li>
                <li>So sánh cách dùng trong các câu khác</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>3. Khảo cứu chủ đề</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>Trang Chủ đề cho phép:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Tìm tất cả câu về một chủ đề</li>
                <li>Xem từ khóa liên quan (Strongs)</li>
                <li>Lọc theo Cựu/Tân Ước</li>
                <li>Xuất danh sách các câu tham chiếu</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}