import { NextRequest, NextResponse } from "next/server"
import { findDictionary, DICTIONARIES } from "@/lib/dictionary-data"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const term = (searchParams.get("term") || "").trim()
  if (!term) return NextResponse.json({ entries: [] })
  let entries = findDictionary(term)
  if (entries.length === 0) {
    const lower = term.toLowerCase()
    entries = Object.entries(DICTIONARIES)
      .filter(([k]) => k.includes(lower))
      .flatMap(([, v]) => v)
  }
  return NextResponse.json({ entries })
}
