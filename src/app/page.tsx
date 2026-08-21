import Link from "next/link"
import { BookOpen, Search, Brain, Link as LinkIcon, GitBranch, Star, ArrowRight, CheckCircle, Globe, Database } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StrongsSearch } from "@/components/strongs/strongs-search"

const features = [
  {
    name: "Tra cứu Strongs",
    description: "Tra cứu số Strongs (G1234/H1234) để xem định nghĩa, nguồn gốc từ vựng, cách dịch Kinh Thánh, cùng Thayer, BDB, LSJ",
    icon: Search,
    href: "/strongs",
    color: "blue"
  },
  {
    name: "Kinh Thánh đối chiếu",
    description: "Kinh Thánh đối chiếu Hê-bơ-rơ/Hy-lạp và Việt/Anh, với sự phân tích từ vựng từng chữ; bấm vào để xem rõ hơn",
    icon: BookOpen,
    href: "/interlinear",
    color: "green"
  },
  {
    name: "Khảo cứu từ vựng",
    description: "Phân tích hình thái chi tiết: thì, thể, cách, cách thức, số, ngôi, giống, cùng thống kê sự xuất hiện",
    icon: Brain,
    href: "/word-study",
    color: "purple"
  },
  {
    name: "Tham chiếu chéo & Chủ đề",
    description: "Tham chiếu chéo đồng nghĩa/trái nghĩa/gốc từ, chỉ mục chủ đề, và sự song song các đoạn Kinh Thánh",
    icon: LinkIcon,
    href: "/topics",
    color: "orange"
  }
]

const dataSources = [
  { name: "Strong's Exhaustive Concordance", url: "https://archive.org/details/strongsexhaustiv0000stro", desc: "Mã số Strongs cho mọi từ trong Kinh Thánh" },
  { name: "Thayer's Greek Lexicon", url: "https://archive.org/details/thayersgreekengl0000jose", desc: "Từ điển Hy-lạp Tân Ước chuẩn" },
  { name: "Brown-Driver-Briggs (BDB)", url: "https://archive.org/details/browndriverbrigg0000brow", desc: "Từ điển Hê-bơ-rơ Cựu Ước uy tín" },
  { name: "Liddell-Scott-Jones (LSJ)", url: "https://anastrophe.uchicago.edu/perseus/LSJ.html", desc: "Từ điển Hy-lạp cổ điển toàn diện" },
  { name: "Morphological Databases", url: "https://github.com/openscriptures", desc: "Cơ sở dữ liệu hình thái học: OpenText, ETCBC, Robinson" },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="container px-4">
          <div className="mx-auto max-w-4xl text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <BookOpen className="h-10 w-10 text-primary" aria-hidden="true" />
              <span className="text-3xl font-bold text-primary">BibleLex</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Khảo cứu Kinh Thánh <br />
              <span className="text-primary">nguyên ngữ Hê-bơ-rơ & Hy-lạp</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Công cụ tra cứu Strongs, bản đối chiếu Kinh Thánh, từ điển Thayer/BDB/LSJ,
              phân tích hình thái học và tham chiếu chéo — hoàn toàn tự do, mã nguồn mở.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-12">
              <Link href="/strongs" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 whitespace-nowrap">
                  <Search className="h-5 w-5" />
                  Tra cứu Strongs
                </Button>
              </Link>
              <Link href="/interlinear" className="w-full sm:w-auto">
                <Button size="lg" variant="outline" className="w-full sm:w-auto gap-2 whitespace-nowrap">
                  <BookOpen className="h-5 w-5" />
                  Xem Kinh Thánh đối chiếu
                </Button>
              </Link>
            </div>
              <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
              <Badge variant="outline" className="gap-1">
                <GitBranch className="h-3 w-3" />
                Phần mềm tự do
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                Tiếng Việt
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Database className="h-3 w-3" />
                Dữ liệu công cộng
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Star className="h-3 w-3" />
                Miễn phí hoàn toàn
              </Badge>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 border-y">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Tính năng chính</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Mọi điều bạn cần để khảo cứu từ vựng nguyên ngữ của Kinh Thánh
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Link key={feature.name} href={feature.href}>
                <Card className="h-full hover:shadow-lg transition-shadow group">
                  <CardContent className="p-6">
                    <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform", `bg-${feature.color}-100 text-${feature.color}-600 dark:bg-${feature.color}-900/30 dark:text-${feature.color}-400`)}>
                      <feature.icon className="h-6 w-6" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.name}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="mt-4 flex items-center gap-1 text-primary text-sm font-medium group-hover:gap-2 transition-all">
                      <ArrowRight className="h-4 w-4" />
                      Khám phá
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4">
          <div className="grid gap-12 lg:grid-cols-2 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
                Tra cứu Strongs nhanh chóng
              </h2>
              <p className="text-lg text-muted-foreground mb-8">
                Nhập số Strongs (ví dụ: <code className="bg-muted px-1.5 py-0.5 rounded font-mono">G26</code> cho <em>agapē</em> hoặc <code className="bg-muted px-1.5 py-0.5 rounded font-mono">H1254</code> cho <em>bārā</em>) để xem liền định nghĩa, nguồn gốc từ vựng, cách dịch Kinh Thánh, cùng Thayer, BDB, LSJ và các tham chiếu chéo.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Định nghĩa nguyên gốc Strongs cùng cách dùng Kinh Thánh",
                  "Thayer's Greek Lexicon (Hy-lạp)",
                  "Brown-Driver-Briggs Hebrew Lexicon (Hê-bơ-rơ)",
                  "Liddell-Scott-Jones (Hy-lạp cổ điển)",
                  "Phân tích hình thái học (phân tích, thì, thể, cách, cách thức)",
                  "Tham chiếu chéo: đồng nghĩa, trái nghĩa, gốc từ, từ phái sinh",
                  "Thống kê xuất hiện: số lần, sách, câu đầu/cuối",
                  "Thí dụ câu Kinh Thánh thực tế"
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/strongs" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto gap-2 whitespace-nowrap">
                  <Search className="h-5 w-5" />
                  Thử tra cứu
                </Button>
              </Link>
            </div>
            <div>
              <StrongsSearch />
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 border-y">
        <div className="container px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">Nguồn dữ liệu uy tín</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              BibleLex tổng hợp từ các từ điển và cơ sở dữ liệu học thuật công cộng
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dataSources.map((source) => (
              <Card key={source.name} className="border-l-4 border-primary">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-1">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary hover:underline transition-colors"
                    >
                      {source.name}
                    </a>
                  </h3>
                  <p className="text-sm text-muted-foreground">{source.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-6">
            Dành cho cộng đồng nghiên cứu Kinh Thánh
          </h2>
          <div className="mb-8 max-w-2xl mx-auto space-y-4">
            <p className="text-lg text-muted-foreground">
              BibleLex là dự án phần mềm miễn phí dành cho việc tra cứu và nghiên cứu Kinh Thánh. Mục tiêu của chúng tôi là cung cấp một công cụ tra cứu mã Strongs tiện lợi, trực quan và chính xác cho người dùng Việt Nam.
            </p>
            <p className="text-lg text-muted-foreground">
              Dự án phát triển dựa trên sự chung tay của cộng đồng. Nếu bạn là người yêu mến Lời Chúa và muốn đồng hành cùng chúng tôi, xin hãy đóng góp mã nguồn, dữ liệu hoặc tài chính để dự án ngày một phát triển vững bền. Mọi đóng góp của bạn đều góp phần làm cho công cụ này trở nên hữu ích hơn cho tất cả mọi người.
            </p>
          </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <Button size="lg" variant="outline" asChild className="w-full sm:w-auto whitespace-nowrap">
                <a href="https://github.com" target="_blank" rel="noopener noreferrer">
                  <GitBranch className="h-5 w-5 mr-2" />
                  Xem trên GitHub
                </a>
              </Button>
              <Button size="lg" asChild className="w-full sm:w-auto whitespace-nowrap">
                <a href="/strongs" target="_blank" rel="noopener noreferrer">
                  <ArrowRight className="h-5 w-5 mr-2" />
                  Bắt đầu khảo cứu
                </a>
              </Button>
            </div>
        </div>
      </section>
    </div>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ")
}