import Link from "next/link"
import type { Metadata } from "next"
import { PrismaClient } from "@prisma/client"

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: "Nguồn dữ liệu & Giấy phép · Scriptlex",
  description:
    "Chi tiết nguồn gốc và giấy phép của các bản dịch Kinh Thánh, văn bản nguyên ngữ và lexicon được sử dụng trong Scriptlex.",
}

const prisma = new PrismaClient()

type LicenseInfo = {
  license: string
  publicDomain: boolean
  sourceName: string
  sourceUrl: string
  note?: string
}

const LICENSE: Record<string, LicenseInfo> = {
  VI1934: {
    license: "Public Domain",
    publicDomain: true,
    sourceName: "Hội Truyền Thánh (kinhthanh.httlvn.org)",
    sourceUrl: "https://kinhthanh.httlvn.org",
    note: "Bản Truyền Thống 1925/1934 đã thuộc phạm vi công cộng tại Việt Nam.",
  },
  RVV11: {
    license: "Bản quyền (UBCVN)",
    publicDomain: false,
    sourceName: "United Bible Societies VN / httlvn.org",
    sourceUrl: "https://kinhthanh.httlvn.org",
    note: "Bản Hiệu Đính 2010 được bảo hộ bản quyền. Sử dụng với mục đích nghiên cứu, phi thương mại.",
  },
  BD2011: {
    license: "Bản quyền (UBCVN)",
    publicDomain: false,
    sourceName: "United Bible Societies VN / httlvn.org",
    sourceUrl: "https://kinhthanh.httlvn.org",
    note: "Bản Dịch 2011 được bảo hộ bản quyền.",
  },
  BPT: {
    license: "Bản quyền",
    publicDomain: false,
    sourceName: "httlvn.org",
    sourceUrl: "https://kinhthanh.httlvn.org",
    note: "Bản Phổ Thông (Easy-to-Read) được bảo hộ bản quyền.",
  },
  NVB: {
    license: "Bản quyền",
    publicDomain: false,
    sourceName: "httlvn.org",
    sourceUrl: "https://kinhthanh.httlvn.org",
    note: "Bản Dịch Mới 2002 được bảo hộ bản quyền.",
  },
  BDY: {
    license: "Bản quyền",
    publicDomain: false,
    sourceName: "httlvn.org",
    sourceUrl: "https://kinhthanh.httlvn.org",
    note: "Bản Hiện Đại 2015 (BHĐ2015) được bảo hộ bản quyền.",
  },
  KJV: {
    license: "Public Domain",
    publicDomain: true,
    sourceName: "midvash/bible-data",
    sourceUrl: "https://github.com/midvash/bible-data",
    note: "King James Version (1611) thuộc phạm vi công cộng.",
  },
  ASV: {
    license: "Public Domain",
    publicDomain: true,
    sourceName: "midvash/bible-data",
    sourceUrl: "https://github.com/midvash/bible-data",
    note: "American Standard Version (1901) thuộc phạm vi công cộng.",
  },
  WEB: {
    license: "Public Domain",
    publicDomain: true,
    sourceName: "midvash/bible-data",
    sourceUrl: "https://github.com/midvash/bible-data",
    note: "World English Bible — công cộng (dựa trên ASV).",
  },
  YLT: {
    license: "Public Domain",
    publicDomain: true,
    sourceName: "getbible.net",
    sourceUrl: "https://api.getbible.net/v2/ylt.json",
    note: "Young's Literal Translation (1898) thuộc phạm vi công cộng.",
  },
}

const LEXICON_SOURCES = [
  {
    name: "OpenScriptures Strong's Dictionaries",
    content: "Số thứ tự Strong (Hebrew & Greek) và định nghĩa tóm lược làm cơ sở đối chiếu nguyên ngữ.",
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
    name: "Brown–Driver–Briggs (BDB) & Thayer",
    content: "Lexicon Hebrew (BDB) và Hy Lạp (Thayer) — văn bản thuộc phạm vi công cộng.",
    license: "Public Domain",
    url: "https://en.wikipedia.org/wiki/Strong%27s_Concordance",
  },
]

function Badge({ info }: { info: LicenseInfo }) {
  return (
    <span
      className={
        "inline-block rounded border px-2 py-0.5 text-xs " +
        (info.publicDomain
          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400")
      }
    >
      {info.license}
    </span>
  )
}

export default async function AttributionPage() {
  const versions = await prisma.bibleVersion.findMany({
    orderBy: [{ language: "asc" }, { ordinal: "asc" }],
  })
  const vi = versions.filter((v) => v.language === "vi")
  const en = versions.filter((v) => v.language === "en")

  const renderVersionRows = (list: typeof versions) =>
    list.map((v) => {
      const info: LicenseInfo =
        LICENSE[v.id] ?? {
          license: "Xem chi tiết tại nguồn",
          publicDomain: false,
          sourceName: v.source || "—",
          sourceUrl: "",
        }
      return (
        <tr key={v.id}>
          <td className="px-4 py-3 align-top">
            <div className="font-medium">{v.name}</div>
            <div className="text-xs text-muted-foreground">{v.abbreviation}{v.year ? ` · ${v.year}` : ""}</div>
          </td>
          <td className="px-4 py-3 align-top text-muted-foreground">
            {info.sourceUrl ? (
              <a href={info.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                {info.sourceName}
              </a>
            ) : (
              info.sourceName
            )}
            {info.note ? <div className="mt-1 text-xs">{info.note}</div> : null}
          </td>
          <td className="px-4 py-3 align-top">
            <Badge info={info} />
            {!v.public && (
              <div className="mt-1 text-xs text-muted-foreground">Đang tạm ẩn khỏi giao diện công khai</div>
            )}
          </td>
        </tr>
      )
    })

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
        ← Trang chủ
      </Link>
      <h1 className="mt-4 text-3xl font-bold">Nguồn dữ liệu &amp; Giấy phép</h1>
      <p className="mt-3 text-muted-foreground">
        Scriptlex tổng hợp các bản dịch Kinh Thánh, văn bản nguyên ngữ và lexicon từ nhiều dự án.
        Chúng tôi ghi nhận công lao của các tổ chức bên dưới và tôn trọng giấy phép của từng nguồn.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Bản dịch Kinh Thánh — Tiếng Việt</h2>
      <div className="mt-4 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Bản dịch</th>
              <th className="px-4 py-3 font-semibold">Nguồn</th>
              <th className="px-4 py-3 font-semibold">Giấy phép</th>
            </tr>
          </thead>
          <tbody>{renderVersionRows(vi)}</tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Bản dịch Kinh Thánh — Tiếng Anh</h2>
      <div className="mt-4 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Bản dịch</th>
              <th className="px-4 py-3 font-semibold">Nguồn</th>
              <th className="px-4 py-3 font-semibold">Giấy phép</th>
            </tr>
          </thead>
          <tbody>{renderVersionRows(en)}</tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold">Văn bản nguyên ngữ &amp; Lexicon</h2>
      <div className="mt-4 overflow-hidden rounded-lg border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="px-4 py-3 font-semibold">Nguồn</th>
              <th className="px-4 py-3 font-semibold">Nội dung</th>
              <th className="px-4 py-3 font-semibold">Giấy phép</th>
            </tr>
          </thead>
          <tbody>
            {LEXICON_SOURCES.map((s, i) => (
              <tr key={s.name} className={i % 2 ? "bg-muted/20" : ""}>
                <td className="px-4 py-3 align-top">
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
                    {s.name}
                  </a>
                </td>
                <td className="px-4 py-3 align-top text-muted-foreground">{s.content}</td>
                <td className="px-4 py-3 align-top">
                  <span className="inline-block rounded border border-border px-2 py-0.5 text-xs">{s.license}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-8 space-y-3 rounded-lg border bg-card p-5 text-sm text-muted-foreground">
        <p>
          Phần mềm Scriptlex phát hành dưới giấy phép <strong>MIT</strong>. Các bản văn Kinh Thánh và nội
          dung lexicon thuộc sở hữu của chủ sở hữu tương ứng theo giấy phép nêu trên.
        </p>
        <p>
          <strong>Lưu ý bản quyền:</strong> một số bản dịch tiếng Việt (HĐ2010, BD2011, BPT, NVB, BHĐ2015)
          được bảo hộ bản quyền. Scriptlex hiển thị chúng với mục đích nghiên cứu, học thuật và phi
          thương mại. Mọi sử dụng thương mại hoặc tái phân phối cần được sự cho phép của chủ sở hữu bản
          quyền tương ứng. Nếu bạn có yêu cầu điều chỉnh ghi nhận nguồn, vui lòng liên hệ qua dự án.
        </p>
      </div>
    </div>
  )
}
