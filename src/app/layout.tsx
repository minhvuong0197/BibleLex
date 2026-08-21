import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Providers } from "@/components/providers"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "vietnamese"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://biblelex.app"),
  title: {
    default: "BibleLex — Tra cứu chỉ mục Strongs và khảo cứu Kinh Thánh nguyên ngữ Hê-bơ-rơ, Hy-lạp",
    template: "%s | BibleLex",
  },
  description: "Công cụ tra cứu chỉ mục Strongs, bản đối chiếu Kinh Thánh nguyên ngữ Hê-bơ-rơ (Cựu Ước) và Hy-lạp (Tân Ước), cùng sự khảo cứu từ vựng và chủ đề. Phần mềm tự do, mã nguồn mở.",
  keywords: ["Strongs", "Hê-bơ-rơ", "Hy-lạp", "Kinh Thánh", "Cựu Ước", "Tân Ước", "bản đối chiếu", "chỉ mục Strongs", "Thayer", "BDB"],
  authors: [{ name: "BibleLex Contributors" }],
  creator: "BibleLex",
  publisher: "BibleLex",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "vi_VN",
    siteName: "BibleLex",
    title: "BibleLex — Tra cứu Kinh Thánh nguyên ngữ Hê-bơ-rơ, Hy-lạp",
    description: "Khảo cứu Kinh Thánh với từ điển Strongs, Thayer, BDB, LSJ",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "BibleLex",
    description: "Tra cứu Kinh Thánh nguyên ngữ Hê-bơ-rơ, Hy-lạp và khảo cứu từ vựng",
  },
  verification: {
    google: "google-site-verification-code",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wght@400;500;700&family=Noto+Sans+Greek:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <Providers>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}