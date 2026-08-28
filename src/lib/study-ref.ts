export interface ParsedRef {
  book: string
  chapter: number
  verse: number
}

export function parseVerseRef(ref: string): ParsedRef | null {
  const m = ref.match(/^(\S+)\s+(\d+):(\d+)$/)
  if (!m) return null
  return { book: m[1], chapter: parseInt(m[2], 10), verse: parseInt(m[3], 10) }
}
