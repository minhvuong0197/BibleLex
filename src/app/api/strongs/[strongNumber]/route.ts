import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseStrongNumber, formatStrongNumber } from '@/lib/utils'
import { generateAiText } from '@/lib/ai'

export const maxDuration = 60

const STRONG_VI_SYSTEM = `Bạn là chuyên gia từ vựng Kinh Thánh, thông thạo tiếng Hê-bơ-rơ cổ và Hy-lạp Koine. Nhiệm vụ: dịch định nghĩa từ vựng Kinh Thánh (tiếng Anh) sang tiếng Việt ngắn gọn, CHỈ nghĩa cốt lõi (1-3 dòng), văn phong Kinh Thánh Tiếng Việt 1934, khách quan, học thuật. Trả về DUY NHẤT nội dung tiếng Việt. Không tiêu đề, không Markdown, không dấu ngoặc, không giải thích thêm.`

async function ensureVietnameseDef(entry: {
  strongNumber: string
  definition: string
  kjvDef: string | null
  vietnameseDef: string | null
}): Promise<string | null> {
  if (entry.vietnameseDef && entry.vietnameseDef.trim()) return entry.vietnameseDef
  const source = (entry.kjvDef && entry.kjvDef.trim()) || entry.definition.trim()
  if (!source) return null
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const { text } = await generateAiText(STRONG_VI_SYSTEM, source, { temperature: 0.3, timeoutMs: 18000 })
      const vi = text.trim().replace(/<think>[\s\S]*?<\/think>/gi, '').trim()
      if (vi) {
        await prisma.strongEntry
          .update({ where: { strongNumber: entry.strongNumber }, data: { vietnameseDef: vi } })
          .catch(() => {})
        return vi
      }
      return null
    } catch (e) {
      const msg = (e as Error)?.message || ''
      console.error(`translate strong ${entry.strongNumber} attempt ${attempt} failed:`, msg.slice(0, 100))
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1500))
    }
  }
  return null
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ strongNumber: string }> }
) {
  try {
    const { strongNumber } = await params
    const parsed = parseStrongNumber(strongNumber)
    
    if (!parsed) {
      return NextResponse.json(
        { error: 'Invalid Strong\'s number format. Use G1234 or H1234' },
        { status: 400 }
      )
    }

    const formattedNumber = formatStrongNumber(strongNumber)
    
    const entry = await prisma.strongEntry.findUnique({
      where: { strongNumber: formattedNumber },
      include: {
        morphology: {
          orderBy: { count: 'desc' }
        },
        crossRefs: {
          include: { targetEntry: true },
          orderBy: { type: 'asc' }
        },
        crossRefTargets: {
          include: { sourceEntry: true },
          orderBy: { type: 'asc' }
        },
        verses: {
          take: 10,
          orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }],
          include: {
            // We'll fetch verse text separately if needed
          }
        }
      }
    })

    if (!entry) {
      return NextResponse.json(
        { error: `Strong's number ${formattedNumber} not found` },
        { status: 404 }
      )
    }

    // Dịch sang tiếng Việt theo yêu cầu (nếu chưa có), rồi lưu vào DB để dùng lại.
    const viDef = await ensureVietnameseDef(entry)
    if (viDef) entry.vietnameseDef = viDef

    // Get verse texts for the sample verses
    const verseWords = await prisma.verseWord.findMany({
      where: { strongNumber: formattedNumber },
      take: 5,
      orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }]
    })

    // Get verse texts (single batched query to avoid pool exhaustion)
    const lookups = verseWords.map((vw) => ({ bookId: vw.book, chapter: vw.chapter, verse: vw.verse }))
    const verses = lookups.length
      ? await prisma.verse.findMany({ where: { OR: lookups } })
      : []
    const verseMap = new Map(
      verses.map((v) => [`${v.bookId}-${v.chapter}-${v.verse}`, { text: v.text, vietnameseText: v.vietnameseText }])
    )
    const verseTexts = verseWords.map((vw) => {
      const m = verseMap.get(`${vw.book}-${vw.chapter}-${vw.verse}`)
      return m ? { ...vw, verseText: m.text, vietnameseText: m.vietnameseText } : vw
    })

    // Get stats
    const [totalVerses, books, firstOccurrence, lastOccurrence] = await Promise.all([
      prisma.verseWord.count({ where: { strongNumber: formattedNumber } }),
      prisma.verseWord.findMany({
        where: { strongNumber: formattedNumber },
        select: { book: true },
        distinct: ['book']
      }),
      prisma.verseWord.findFirst({
        where: { strongNumber: formattedNumber },
        orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }, { wordOrder: 'asc' }]
      }),
      prisma.verseWord.findFirst({
        where: { strongNumber: formattedNumber },
        orderBy: [{ book: 'desc' }, { chapter: 'desc' }, { verse: 'desc' }, { wordOrder: 'desc' }]
      })
    ])

    return NextResponse.json({
      entry,
      sampleVerses: verseTexts,
      stats: {
        totalVerses,
        books: books.map(b => b.book),
        firstOccurrence: firstOccurrence ? { book: firstOccurrence.book, chapter: firstOccurrence.chapter, verse: firstOccurrence.verse } : null,
        lastOccurrence: lastOccurrence ? { book: lastOccurrence.book, chapter: lastOccurrence.chapter, verse: lastOccurrence.verse } : null
      }
    })
  } catch (error) {
    console.error('Error fetching Strong\'s entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}