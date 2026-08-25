import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Nguồn dữ liệu & Giấy phép · Scriptlex",
  description: "Danh mục các nguồn dữ liệu Kinh Thánh nguyên ngữ và giấy phép tương ứng được sử dụng trong Scriptlex.",
}

const SOURCES = [
  {
    name: "OpenScriptures Strong's Dictionaries",
    content: "Số thứ tự Strong (Hebrew & Greek) và định nghĩa tóm lược (cơ sở của BDB & Thayer).",
    license: "Public Domain",
    url: "https://github.com/openscriptures/strongs",
  },
  {
    name: "Westminster Leningrad Codex (WLC)",
    content: "Bản Hebrew/Aramaic Cựu Ước gốc, kèm phân tích hình thái học.",
    license: "Public Domain",
    url: "https://github.com/openscriptures/wlc",
  },
  {
    name: "SBLGNT (Greek New Testament)",
    content: "Bản Hy Lạp Tân Ước tiêu chuẩn, kèm phân tích hình thái học.",
    license: "Public Domain",
    url: "https://sblgnt.com/",
  },
  {
    name: "STEPBible — TFLSJ (Liddell–Scott–Jones)",
    content: "Định nghĩa lexicon Hy Lạp cổ điển (LSJ) được định dạng lại bởi Tyndale House.",
    license: "CC BY 4.0",
    url: "https://github.com/stepbible/STEPBible-Data",
  },
  {
    name: "Kinh Thánh 1934 (Việt ngữ)",
    content: "Bản dịch tiếng Việt thuộc phạm vi công cộng, qua kho dữ liệu midvash/bible-data.",
    license: "Public Domain",
    url: "https://github.com/midvash/bible-data",
  },
  {
    name: "Brown–Driver–Briggs (BDB) & Thayer",
    content: "Lexicon Hebrew (BDB) và Hy Lạp (Thayer) — văn bản thuộc phạm vi công cộng.",
    license: "Public Domain",
    url: "https://en.wikipedia.org/wiki/Strong%27s_Concordance",
  },
]

export default function AttributionPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
        ← Trang chủ
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nguồn dữ liệu &amp; Giấy phép</h1>
      <p className="mt-3 text-muted-foreground">
        Scriptlex tổng hợp các nguồn Kinh Thánh nguyên ngữ thuộc phạm vi công cộng (public domain) và
        một số nguồn giấy phép mở. Chúng tôi ghi nhận công lao của các tổ chức và dự án bên dưới.
      </p>

      <div className="mt-8 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Nguồn</th>
              <th className="px-4 py-3 font-semibold">Nội dung</th>
              <th className="px-4 py-3 font-semibold">Giấy phép</th>
            </tr>
          </thead>
          <tbody>
            {SOURCES.map((s, i) => (
              <tr key={s.name} className={i % 2 ? "bg-muted/20" : ""}>
                <td className="px-4 py-3 align-top">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-primary hover:underline"
                  >
                    {s.name}
                  </a>
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">{s.content}</td>
                <td className="px-4 py-3 align-top">
                  <span className="inline-block rounded border border-border px-2 py-0.5 text-xs">
                    {s.license}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 rounded-lg border bg-card p-5 text-sm text-muted-foreground">
        <p>
          Phần mềm Scriptlex phát hành dưới giấy phép <strong>MIT</strong>. Các nội dung lexicon và
          bản văn Kinh Thánh thuộc sở hữu của các chủ sở hữu tương ứng theo giấy phép nêu trên. Nếu bạn
          có yêu cầu điều chỉnh ghi nhận nguồn, vui lòng liên hệ qua dự án.
        </p>
      </div>
    </div>
  )
}
