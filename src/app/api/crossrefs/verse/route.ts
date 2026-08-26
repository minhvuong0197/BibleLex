import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const book = req.nextUrl.searchParams.get("book")
  const chapter = parseInt(req.nextUrl.searchParams.get("chapter") || "", 10)
  const verse = parseInt(req.nextUrl.searchParams.get("verse") || "", 10)

  if (!book || !chapter || !verse) {
    return NextResponse.json({ error: "Thiếu tham số book, chapter hoặc verse" }, { status: 400 })
  }

  const refs = await prisma.verseCrossReference.findMany({
    where: { fromBook: book, fromChapter: chapter, fromVerse: verse },
    orderBy: [{ toBook: "asc" }, { toChapter: "asc" }, { toVerse: "asc" }]
  })

  return NextResponse.json({
    references: refs.map((r) => ({
      toBook: r.toBook,
      toChapter: r.toChapter,
      toVerse: r.toVerse,
      toLabel: r.toLabel,
      anchor: r.anchor
    }))
  })
}
