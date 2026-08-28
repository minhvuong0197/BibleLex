import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export const maxDuration = 30

export async function GET(req: NextRequest) {
  const term = (req.nextUrl.searchParams.get("term") || "").trim()
  if (!term) return NextResponse.json({ entries: [] })

  const rows = await prisma.dictionaryEntry.findMany({
    where: { term: { contains: term, mode: "insensitive" } },
    take: 80,
  })

  const exact = term.toLowerCase()
  const entries = rows
    .map((r) => ({
      term: r.term,
      source: r.source,
      definition: r.definition,
      vietnameseDef: r.vietnameseDef,
    }))
    .sort((a, b) => {
      const al = a.term.toLowerCase()
      const bl = b.term.toLowerCase()
      const rank = (s: string) => (s === exact ? 0 : s.startsWith(exact) ? 1 : 2)
      return rank(al) - rank(bl) || a.term.localeCompare(b.term)
    })

  return NextResponse.json({ entries })
}
