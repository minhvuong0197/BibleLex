import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const u = await getCurrentUser()
  if (!u) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
  const items = await prisma.note.findMany({ where: { userId: u.sub }, orderBy: { createdAt: "asc" } })
  return NextResponse.json({ items })
}

export async function POST(req: NextRequest) {
  const u = await getCurrentUser()
  if (!u) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
  const b = await req.json().catch(() => ({}))
  const book = String(b.book || "").trim()
  const chapter = Number(b.chapter)
  const verse = Number(b.verse)
  const text = String(b.text || "")
  if (!book || !Number.isInteger(chapter) || !Number.isInteger(verse) || !text.trim()) {
    return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 })
  }
  const item = await prisma.note.upsert({
    where: { userId_book_chapter_verse: { userId: u.sub, book, chapter, verse } },
    update: { text: text.trim() },
    create: { userId: u.sub, book, chapter, verse, text: text.trim() },
  })
  return NextResponse.json({ item })
}

export async function DELETE(req: NextRequest) {
  const u = await getCurrentUser()
  if (!u) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const book = searchParams.get("book") || ""
  const chapter = Number(searchParams.get("chapter"))
  const verse = Number(searchParams.get("verse"))
  if (!book || !Number.isInteger(chapter) || !Number.isInteger(verse)) {
    return NextResponse.json({ error: "Thiếu dữ liệu" }, { status: 400 })
  }
  await prisma.note.deleteMany({ where: { userId: u.sub, book, chapter, verse } })
  return NextResponse.json({ ok: true })
}
