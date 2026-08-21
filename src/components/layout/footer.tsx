import Link from "next/link"
import { BookOpen, GitBranch, MessageCircle } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t bg-muted/30" role="contentinfo">
      <div className="container px-4 py-12 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-primary" aria-label="Trang chủ BibleLex">
              <BookOpen className="h-6 w-6" aria-hidden="true" />
              <span>BibleLex</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Công cụ tra cứu Kinh Thánh nguyên ngữ Hê-bơ-rơ và Hy-lạp, cùng sự khảo cứu chuyên sâu.
              Phần mềm tự do, mã nguồn mở, dành cho cộng đồng.
            </p>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="GitHub">
                <GitBranch className="h-5 w-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Twitter">
                <MessageCircle className="h-5 w-5" />
              </a>
            </div>
          </div>

          <nav aria-label="Tính năng">
            <h3 className="font-semibold mb-4">Tính năng</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/strongs" className="hover:text-foreground transition-colors">Tra cứu Strongs</Link></li>
              <li><Link href="/interlinear" className="hover:text-foreground transition-colors">Kinh Thánh đối chiếu</Link></li>
              <li><Link href="/word-study" className="hover:text-foreground transition-colors">Khảo cứu từ vựng</Link></li>
              <li><Link href="/topics" className="hover:text-foreground transition-colors">Chủ đề & Tham chiếu chéo</Link></li>
            </ul>
          </nav>

          <nav aria-label="Nguồn dữ liệu">
            <h3 className="font-semibold mb-4">Nguồn dữ liệu</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Strong's Exhaustive Concordance</li>
              <li>Thayer's Greek Lexicon</li>
              <li>Brown-Driver-Briggs Hebrew Lexicon</li>
              <li>Liddell-Scott-Jones Greek Lexicon</li>
              <li>Cơ sở dữ liệu hình thái học (OpenText, ETCBC)</li>
            </ul>
          </nav>

            <div className="space-y-4">
              <h3 className="font-semibold">Ủng hộ dự án</h3>
              <p className="text-sm text-muted-foreground">
                BibleLex là một sáng kiến phần mềm nguồn mở. Mọi đóng góp về mã nguồn, dữ liệu hay tài chính đều giúp dự án ngày một vững mạnh.
              </p>
              <p className="text-sm text-muted-foreground">
                ❤️ Dành trọn cho công cuộc khảo cứu Kinh Thánh.
              </p>
            </div>
        </div>

        <div className="mt-12 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} BibleLex. Phát hành dưới giấy phép MIT.</p>
        </div>
      </div>
    </footer>
  )
}