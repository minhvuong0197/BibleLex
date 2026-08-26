import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { PrismaClient } from "@prisma/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatStrongNumber(num: string): string {
  const match = num.match(/^([GH])(\d+)$/i)
  if (!match) return num.toUpperCase()
  return `${match[1].toUpperCase()}${match[2]}`
}

export function normalizeBookName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '')
}

export async function resolveBibleBook(
  prisma: PrismaClient,
  book: string
): Promise<{
  id: string
  name: string
  abbreviation: string
  testament: 'OLD' | 'NEW'
  chapters: number
} | null> {
  const books = await prisma.bibleBook.findMany({
    select: {
      id: true,
      name: true,
      abbreviation: true,
      testament: true,
      chapters: true,
    },
  })
  let raw = book
  try { raw = decodeURIComponent(book) } catch { /* keep raw */ }
  raw = raw.trim()
  const target = normalizeBookName(raw)
  return (
    books.find(
      (b) =>
        normalizeBookName(b.abbreviation) === target ||
        normalizeBookName(b.name) === target
    ) || null
  )
}

export function parseStrongNumber(input: string): { lang: 'H' | 'G'; number: number } | null {
  const match = input.match(/^([HG])(\d+)$/i)
  if (!match) return null
  return { lang: match[1].toUpperCase() as 'H' | 'G', number: parseInt(match[2], 10) }
}

export function getLanguageLabel(lang: 'HEBREW' | 'GREEK'): string {
  return lang === 'HEBREW' ? 'Hê-bơ-rơ' : 'Hy-lạp'
}

export function getLanguageCode(lang: 'HEBREW' | 'GREEK'): 'H' | 'G' {
  return lang === 'HEBREW' ? 'H' : 'G'
}

export const BOOK_ABBREVIATIONS: Record<string, string> = {
  'Genesis': 'Gen', 'Exodus': 'Exod', 'Leviticus': 'Lev', 'Numbers': 'Num', 'Deuteronomy': 'Deut',
  'Joshua': 'Josh', 'Judges': 'Judg', 'Ruth': 'Ruth', '1 Samuel': '1 Sam', '2 Samuel': '2 Sam',
  '1 Kings': '1 Kgs', '2 Kings': '2 Kgs', '1 Chronicles': '1 Chr', '2 Chronicles': '2 Chr',
  'Ezra': 'Ezra', 'Nehemiah': 'Neh', 'Esther': 'Esth', 'Job': 'Job', 'Psalms': 'Ps',
  'Proverbs': 'Prov', 'Ecclesiastes': 'Eccl', 'Song of Solomon': 'Song', 'Isaiah': 'Isa',
  'Jeremiah': 'Jer', 'Lamentations': 'Lam', 'Ezekiel': 'Ezek', 'Daniel': 'Dan', 'Hosea': 'Hos',
  'Joel': 'Joel', 'Amos': 'Amos', 'Obadiah': 'Obad', 'Jonah': 'Jonah', 'Micah': 'Mic',
  'Nahum': 'Nah', 'Habakkuk': 'Hab', 'Zephaniah': 'Zeph', 'Haggai': 'Hag', 'Zechariah': 'Zech',
  'Malachi': 'Mal', 'Matthew': 'Matt', 'Mark': 'Mark', 'Luke': 'Luke', 'John': 'John',
  'Acts': 'Acts', 'Romans': 'Rom', '1 Corinthians': '1 Cor', '2 Corinthians': '2 Cor',
  'Galatians': 'Gal', 'Ephesians': 'Eph', 'Philippians': 'Phil', 'Colossians': 'Col',
  '1 Thessalonians': '1 Thess', '2 Thessalonians': '2 Thess', '1 Timothy': '1 Tim',
  '2 Timothy': '2 Tim', 'Titus': 'Titus', 'Philemon': 'Phlm', 'Hebrews': 'Heb',
  'James': 'Jas', '1 Peter': '1 Pet', '2 Peter': '2 Pet', '1 John': '1 John',
  '2 John': '2 John', '3 John': '3 John', 'Jude': 'Jude', 'Revelation': 'Rev'
}

export const BOOKS_OT = [
  'Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy',
  'Joshua', 'Judges', 'Ruth', '1 Samuel', '2 Samuel',
  '1 Kings', '2 Kings', '1 Chronicles', '2 Chronicles',
  'Ezra', 'Nehemiah', 'Esther', 'Job', 'Psalms',
  'Proverbs', 'Ecclesiastes', 'Song of Solomon', 'Isaiah', 'Jeremiah',
  'Lamentations', 'Ezekiel', 'Daniel', 'Hosea', 'Joel',
  'Amos', 'Obadiah', 'Jonah', 'Micah', 'Nahum',
  'Habakkuk', 'Zephaniah', 'Haggai', 'Zechariah', 'Malachi'
]

export const BOOKS_NT = [
  'Matthew', 'Mark', 'Luke', 'John', 'Acts',
  'Romans', '1 Corinthians', '2 Corinthians', 'Galatians', 'Ephesians',
  'Philippians', 'Colossians', '1 Thessalonians', '2 Thessalonians',
  '1 Timothy', '2 Timothy', 'Titus', 'Philemon', 'Hebrews',
  'James', '1 Peter', '2 Peter', '1 John', '2 John',
  '3 John', 'Jude', 'Revelation'
]

export function getBookAbbreviation(book: string): string {
  return (BOOK_ABBREVIATIONS[book] || book.substring(0, 3)).replace(/\s+/g, '')
}

// Tên sách theo bản Kinh Thánh Truyền Thống Hiệu Đính 2010 (TTHĐ 2010 / RVV11)
export const BOOK_VI: Record<string, string> = {
  'Genesis': 'Sáng-thế Ký', 'Exodus': 'Xuất Ê-díp-tô Ký', 'Leviticus': 'Lê-vi Ký',
  'Numbers': 'Dân-số Ký', 'Deuteronomy': 'Phục-truyền Luật-lệ Ký', 'Joshua': 'Giô-suê',
  'Judges': 'Các Quan Xét', 'Ruth': 'Ru-tơ', '1 Samuel': 'I Sa-mu-ên',
  '2 Samuel': 'II Sa-mu-ên', '1 Kings': 'I Các Vua', '2 Kings': 'II Các Vua',
  '1 Chronicles': 'I Sử-ký', '2 Chronicles': 'II Sử-ký',
  'Ezra': 'E-xơ-ra', 'Nehemiah': 'Nê-hê-mi', 'Esther': 'Ê-xơ-tê', 'Job': 'Gióp',
  'Psalms': 'Thi-thiên', 'Proverbs': 'Châm-ngôn', 'Ecclesiastes': 'Truyền-đạo',
  'Song of Solomon': 'Nhã-ca', 'Isaiah': 'Ê-sai', 'Jeremiah': 'Giê-rê-mi',
  'Lamentations': 'Ca-thương', 'Ezekiel': 'Ê-xê-chi-ên', 'Daniel': 'Đa-ni-ên',
  'Hosea': 'Ô-sê', 'Joel': 'Giô-ên', 'Amos': 'A-mốt', 'Obadiah': 'Áp-đia',
  'Jonah': 'Giô-na', 'Micah': 'Mi-chê', 'Nahum': 'Na-hum', 'Habakkuk': 'Ha-ba-cúc',
  'Zephaniah': 'Sô-phô-ni', 'Haggai': 'A-ghê', 'Zechariah': 'Xa-cha-ri', 'Malachi': 'Ma-la-chi',
  'Matthew': 'Ma-thi-ơ', 'Mark': 'Mác', 'Luke': 'Lu-ca', 'John': 'Giăng',
  'Acts': 'Công-vụ các Sứ-đồ', 'Romans': 'Rô-ma', '1 Corinthians': 'I Cô-rinh-tô',
  '2 Corinthians': 'II Cô-rinh-tô', 'Galatians': 'Ga-la-ti', 'Ephesians': 'Ê-phê-sô',
  'Philippians': 'Phi-líp', 'Colossians': 'Cô-lô-se', '1 Thessalonians': 'I Tê-sa-lô-ni-ca',
  '2 Thessalonians': 'II Tê-sa-lô-ni-ca', '1 Timothy': 'I Ti-mô-thê', '2 Timothy': 'II Ti-mô-thê',
  'Titus': 'Tít', 'Philemon': 'Phi-lê-môn', 'Hebrews': 'Hê-bơ-rơ', 'James': 'Gia-cơ',
  '1 Peter': 'I Phi-e-rơ', '2 Peter': 'II Phi-e-rơ', '1 John': 'I Giăng', '2 John': 'II Giăng',
  '3 John': 'III Giăng', 'Jude': 'Giu-đe', 'Revelation': 'Khải-huyền',
}

export function getBookViName(book: string): string {
  if (BOOK_VI[book]) return BOOK_VI[book]
  const english = Object.keys(BOOK_ABBREVIATIONS).find((k) => BOOK_ABBREVIATIONS[k] === book)
  if (english && BOOK_VI[english]) return BOOK_VI[english]
  return book
}

export function getTestament(book: string): 'OLD' | 'NEW' {
  return BOOKS_OT.includes(book) ? 'OLD' : 'NEW'
}

// ---------------------------------------------------------------------------
// Tìm kiếm nhanh & gõ tắt sách (Quick Search / shortcuts)
// ---------------------------------------------------------------------------

// Bí danh gõ tắt tiếng Việt (và vài biến thể tiếng Anh) cho từng sách,
// key theo tên tiếng Anh (trùng với BOOKS_OT / BOOKS_NT).
const VI_ALIASES: Record<string, string[]> = {
  'Genesis': ['Sa', 'Stk', 'Sáng', 'Sáng thế ký', 'Sáng-thế Ký'],
  'Exodus': ['Xuat', 'XH', 'Xuất', 'Xuất ê-díp-tô ký', 'Xuất Ê-díp-tô Ký'],
  'Leviticus': ['Levi', 'Lê-vi', 'Lêvi'],
  'Numbers': ['Dan', 'Dân', 'Dân số ký', 'Dân-số Ký'],
  'Deuteronomy': ['Phuc', 'Phục', 'Phục truyền', 'Phục-truyền Luật-lệ Ký', 'Phục truyền luật lệ ký'],
  'Joshua': ['Giosue', 'Giô-suê'],
  'Judges': ['Quan', 'Quan xet', 'Quan Xét', 'Các quan xét', 'Các Quan Xét'],
  'Ruth': ['Rut', 'Ru-tơ'],
  '1 Samuel': ['1Sa', 'ISam', '1Sam', 'I sam', 'Sa-mu-ên'],
  '2 Samuel': ['2Sa', 'IISam', '2Sam', 'II sam', 'Sa-mu-ên 2'],
  '1 Kings': ['1Vua', 'IVua', '1Kgs', 'I cac vua', 'Các vua'],
  '2 Kings': ['2Vua', 'IIVua', '2Kgs', 'II cac vua'],
  '1 Chronicles': ['1Su', 'ISu', '1Chr', '1Ch', 'I su-ky', 'Sử-ký'],
  '2 Chronicles': ['2Su', 'IISu', '2Chr', '2Ch', 'II su-ky'],
  'Ezra': ['Exra', 'E-xơ-ra'],
  'Nehemiah': ['Neh', 'Nehemi', 'Nê-hê-mi'],
  'Esther': ['Esthe', 'E-xơ-te'],
  'Job': ['Giop', 'Gióp'],
  'Psalms': ['Thi', 'Thi thin', 'Thi-thiên'],
  'Proverbs': ['Cham', 'Châm-ngôn', 'Chamngon'],
  'Ecclesiastes': ['Truyen', 'Truyền-đạo', 'Truyen dao'],
  'Song of Solomon': ['Nha', 'Nhã-ca', 'Nhaca'],
  'Isaiah': ['Esai', 'E-sai'],
  'Jeremiah': ['Gieremi', 'Giê-rê-mi'],
  'Lamentations': ['Ca thuong', 'Ca-thương'],
  'Ezekiel': ['Exechien', 'E-xê-chi-ên'],
  'Daniel': ['Danien', 'Da-ni-ên'],
  'Hosea': ['Ose', 'Ô-sê'],
  'Joel': ['Gio-en', 'Giô-ên'],
  'Amos': ['Amot', 'A-mốt'],
  'Obadiah': ['Abd', 'Ab-dia', 'Áp-đia'],
  'Jonah': ['Gio-na', 'Giô-na'],
  'Micah': ['Mic', 'Mi-chê', 'Mi-che'],
  'Nahum': ['Nah', 'Na-hum'],
  'Habakkuk': ['Hab', 'Ha-ba-cúc', 'Haba cuc'],
  'Zephaniah': ['Sopho', 'Sô-phô-ni', 'Sophoni'],
  'Haggai': ['Aghe', 'A-ghê'],
  'Zechariah': ['Xacha', 'Xa-cha-ri', 'Xachari'],
  'Malachi': ['Mal', 'Ma-la-chi'],
  'Matthew': ['Mat', 'Mt', 'Ma-thi-ơ', 'Ma thi o'],
  'Mark': ['Mac', 'Mác'],
  'Luke': ['Luc', 'Lu-ca'],
  'John': ['Gi', 'Giăng', 'Giang'],
  'Acts': ['CV', 'Cv', 'Công-vụ', 'Công vu'],
  'Romans': ['Rom', 'Rô-ma', 'Roma'],
  '1 Corinthians': ['1Co', 'ICor', '1Cor', 'I cô-rinh-tô', 'Corinthians'],
  '2 Corinthians': ['2Co', 'IICor', '2Cor', 'II cô-rinh-tô'],
  'Galatians': ['Gal', 'Ga-la-ti'],
  'Ephesians': ['Eph', 'Ê-phê-sô', 'Ephe so'],
  'Philippians': ['Phil', 'Phi-líp'],
  'Colossians': ['Col', 'Cô-lô-se'],
  '1 Thessalonians': ['1Th', 'ITe', '1Thess', 'I tê-sa-lô-ni-ca', 'Tesan'],
  '2 Thessalonians': ['2Th', 'IITe', '2Thess', 'II tê-sa-lô-ni-ca'],
  '1 Timothy': ['1Ti', 'ITim', '1Tim', 'I ti-mô-thê'],
  '2 Timothy': ['2Ti', 'IITim', '2Tim', 'II ti-mô-thê'],
  'Titus': ['Tit', 'Tít'],
  'Philemon': ['Phlm', 'Phi-lê-môn', 'Philemon'],
  'Hebrews': ['Heb', 'Hê-bơ-rơ', 'He bo ro'],
  'James': ['Jas', 'Gia-cơ', 'Gia co'],
  '1 Peter': ['1Pe', 'IPe', '1Pet', 'I phi-e-rơ', 'Phier'],
  '2 Peter': ['2Pe', 'IIPe', '2Pet', 'II phi-e-rơ'],
  '1 John': ['1Jn', 'IGiang', '1John', 'I giăng'],
  '2 John': ['2Jn', 'IIGiang', '2John', 'II giăng'],
  '3 John': ['3Jn', 'IIIGiang', '3John', 'III giăng'],
  'Jude': ['Giu-de', 'Giu-đe'],
  'Revelation': ['Rev', 'Khải-huyền', 'Khai huyen'],
}

export interface QuickBook {
  abbr: string
  en: string
  vi: string
  aliases: string[]
}

export const QUICK_BOOKS: QuickBook[] = [...BOOKS_OT, ...BOOKS_NT].map((name) => ({
  abbr: BOOK_ABBREVIATIONS[name] ?? name.slice(0, 3),
  en: name,
  vi: BOOK_VI[name] ?? name,
  aliases: VI_ALIASES[name] ?? [],
}))

function stripDiacritics(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

export function normalizeQuery(s: string): string {
  return stripDiacritics(s)
    .replace(/[-_./]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function bookCandidates(b: QuickBook): string[] {
  return [b.abbr, b.en, b.vi, ...b.aliases]
}

function matchBookAliasRaw(q: string): { book: QuickBook; aliasLen: number } | null {
  let best: QuickBook | null = null
  let bestLen = 0
  for (const b of QUICK_BOOKS) {
    for (const c of bookCandidates(b)) {
      const nc = normalizeQuery(c)
      if (!nc) continue
      if (q === nc) {
        if (nc.length >= bestLen) {
          best = b
          bestLen = nc.length
        }
      } else if (q.startsWith(nc)) {
        const next = q[nc.length]
        if (next === undefined || /[\s\d:]/.test(next)) {
          if (nc.length > bestLen) {
            best = b
            bestLen = nc.length
          }
        }
      }
    }
  }
  return best ? { book: best, aliasLen: bestLen } : null
}

export function matchBookAlias(raw: string): QuickBook | null {
  const m = matchBookAliasRaw(normalizeQuery(raw))
  return m ? m.book : null
}

export interface ParsedReference {
  abbr: string
  chapter: number
  verse?: number
}

export function parseQuickReference(raw: string): ParsedReference | null {
  const q = normalizeQuery(raw)
  const m = matchBookAliasRaw(q)
  if (!m) return null
  const rest = q.slice(m.aliasLen).trim()
  const mm = rest.match(/^(\d+)(?::(\d+))?/)
  if (!mm) return { abbr: m.book.abbr, chapter: 1 }
  const chapter = parseInt(mm[1], 10)
  const verse = mm[2] ? parseInt(mm[2], 10) : undefined
  return { abbr: m.book.abbr, chapter, verse }
}

export function quickBookSuggestions(raw: string, limit = 8): QuickBook[] {
  const q = normalizeQuery(raw)
  if (!q) return QUICK_BOOKS.slice(0, limit)
  const scored: { b: QuickBook; score: number }[] = []
  for (const b of QUICK_BOOKS) {
    let bestScore = Infinity
    for (const c of bookCandidates(b)) {
      const nc = normalizeQuery(c)
      if (!nc) continue
      if (nc === q) bestScore = Math.min(bestScore, 0)
      else if (nc.startsWith(q)) bestScore = Math.min(bestScore, nc.length - q.length + 1)
      else if (nc.includes(q)) bestScore = Math.min(bestScore, 100 + nc.indexOf(q))
    }
    if (bestScore !== Infinity) scored.push({ b, score: bestScore })
  }
  scored.sort((a, b) => a.score - b.score)
  return scored.slice(0, limit).map((s) => s.b)
}

// Re-export morphological label maps (defined in types.ts) so components can
// import every UI helper from a single module.
export {
  MORPHOLOGY_LABELS,
  TENSE_LABELS,
  VOICE_LABELS,
  MOOD_LABELS,
  CASE_LABELS,
  NUMBER_LABELS,
  PERSON_LABELS,
  GENDER_LABELS,
} from './types'