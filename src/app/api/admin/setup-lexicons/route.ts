import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { seedLexicons } from "@/lib/lexicon-seed"

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") || ""
  if (!process.env.SEED_KEY || key !== process.env.SEED_KEY) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 })
  }
  try {
    const inserted = await seedLexicons()
    const total = await prisma.dictionaryEntry.count()
    return NextResponse.json({ ok: true, inserted, total })
  } catch (e) {
    console.error("lexicon seed error", e)
    return NextResponse.json({ error: String((e as Error)?.message || e) }, { status: 500 })
  }
}
