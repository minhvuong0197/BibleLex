import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { parseStrongNumber, formatStrongNumber, getLanguageLabel, getBookViName } from '@/lib/utils'
import { generateAiText, AiNotConfiguredError, AiRequestError, resolveAiConfig } from '@/lib/ai'

type AiType = 'translate' | 'research' | 'analysis'

const AI_TYPES: AiType[] = ['translate', 'research', 'analysis']

const TYPE_META: Record<AiType, { label: string; icon?: string }> = {
  translate: { label: 'Dịch chuyên sâu' },
  research: { label: 'Nghiên cứu chuyên sâu' },
  analysis: { label: 'Phân tích chuyên sâu' },
}

function buildContext(data: {
  entry: any
  stats: any
  morphology: any[]
  crossRefs: any[]
  sampleVerses: any[]
}): string {
  const { entry, stats, morphology, crossRefs, sampleVerses } = data
  const langLabel = getLanguageLabel(entry.language)
  const lines: string[] = []
  lines.push(`Ngôn ngữ: ${langLabel}`)
  lines.push(`Mã Strongs: ${entry.strongNumber}`)
  lines.push(`Chuyển tự: ${entry.transliteration || '—'}`)
  if (entry.pronunciation) lines.push(`Phát âm: ${entry.pronunciation}`)
  if (entry.etymology) lines.push(`Nguyên ngữ/ngữ nguyên: ${entry.etymology}`)
  if (entry.derivation) lines.push(`Từ nguyên (derivation): ${entry.derivation}`)
  lines.push(`Định nghĩa Strongs: ${entry.definition || '—'}`)
  if (entry.kjvDef) lines.push(`Cách dịch KJV: ${entry.kjvDef}`)
  if (entry.outlineBiblicalUsage) lines.push(`Cách dùng trong Kinh Thánh (Outline): ${entry.outlineBiblicalUsage}`)
  if (entry.thayersDef) lines.push(`Thayer's Greek Lexicon: ${entry.thayersDef}`)
  if (entry.bdbDef) lines.push(`BDB Hebrew Lexicon: ${entry.bdbDef}`)
  if (entry.lsjDef) lines.push(`LSJ Greek Lexicon: ${entry.lsjDef}`)
  if (entry.tdk) lines.push(`TDK (Từ điển Thần học Tân Ước): ${entry.tdk}`)

  lines.push(
    `Thống kê: xuất hiện ${stats.totalVerses} lần trong ${stats.books.length} sách.` +
      (stats.firstOccurrence
        ? ` Lần đầu: ${getBookViName(stats.firstOccurrence.book)} ${stats.firstOccurrence.chapter}:${stats.firstOccurrence.verse}.`
        : '') +
      (stats.lastOccurrence
        ? ` Lần cuối: ${getBookViName(stats.lastOccurrence.book)} ${stats.lastOccurrence.chapter}:${stats.lastOccurrence.verse}.`
        : '')
  )

  if (morphology.length > 0) {
    lines.push(
      'Phân bố hình thái (top): ' +
        morphology
          .slice(0, 12)
          .map(
            (m) =>
              `${m.parsings} (${m.count})${m.tense ? ', ' + m.tense : ''}${m.voice ? ', ' + m.voice : ''}${
                m.mood ? ', ' + m.mood : ''
              }${m.case_ ? ', ' + m.case_ : ''}${m.number ? ', ' + m.number : ''}${m.person ? ', ' + m.person : ''}${
                m.gender ? ', ' + m.gender : ''
              }`
          )
          .join('; ')
    )
  }

  if (crossRefs.length > 0) {
    lines.push(
      'Tham chiếu chéo: ' +
        crossRefs
          .slice(0, 15)
          .map((c) => `${c.type} → ${c.targetEntry?.strongNumber || '?'} (${c.targetEntry?.transliteration || ''})`)
          .join('; ')
    )
  }

  if (sampleVerses.length > 0) {
    lines.push(
      'Câu mẫu: ' +
        sampleVerses
          .map(
            (v) =>
              `${getBookViName(v.book)} ${v.chapter}:${v.verse} — [${v.hebrewGreek || ''}] "${
                v.verseText || ''
              }" (chuyển tự: ${v.transliteration || ''}; parsing: ${v.parsing || ''}; nghĩa: ${v.english || ''})`
          )
          .join(' | ')
    )
  }

  return lines.join('\n')
}

function buildSystemPrompt(type: AiType, langLabel: string): string {
  const base =
    'Bạn là một nhà từ vựng học Kinh Thánh chuyên sâu, thông thạo tiếng Hê-bơ-rơ cổ điển và tiếng Hy-lạp Koine, ' +
    'cùng bản Kinh Thánh Tiếng Việt Truyền Thống Hiệu Đính 2010 (TTHĐ 2010). ' +
    'Trả lời bằng tiếng Việt, văn phong TTHĐ 2010, chính xác, khách quan, mang tính học thuật. ' +
    'Dùng định dạng Markdown (tiêu đề ##, danh sách -, chữ **in đậm**, bảng | | nếu cần). ' +
    'Chỉ dựa trên dữ liệu được cung cấp, không bịa đặt.'

  if (type === 'translate') {
    return (
      base +
      `\n\nNhiệm vụ: DỊCH CHUYÊN SÂU thuật ngữ ${langLabel} này sang tiếng Việt. Cấu trúc:
## Nghĩa cốt lõi
## Vùng ngữ nghĩa (semantic range)
## So sánh với bản dịch đơn giản
## Lưu ý dịch thuật (giới, số, thì, sắc thái)
Khoảng 350–550 từ.`
    )
  }
  if (type === 'research') {
    return (
      base +
      `\n\nNhiệm vụ: NGHIÊN CỨU CHUYÊN SÂU cách từ này được dùng trong Kinh Thánh. Cấu trúc:
## Tổng quan sử dụng
## Các đoạn văn trọng yếu
## Ý nghĩa thần học
## Liên kết với các từ liên quan
Khoảng 400–600 từ.`
    )
  }
  return (
    base +
    `\n\nNhiệm vụ: PHÂN TÍCH CHUYÊN SÂU khía cạnh ngữ pháp và ngôn ngữ học của từ này. Cấu trúc:
## Phân tích hình thái (parsing)
## Cú pháp
## Cách hình thức ảnh hưởng nghĩa
## Ví dụ minh họa từ các câu mẫu
Khoảng 350–550 từ.`
  )
}

async function loadData(formatted: string) {
  const entry = await prisma.strongEntry.findUnique({
    where: { strongNumber: formatted },
    include: {
      morphology: { orderBy: { count: 'desc' } },
      crossRefs: { include: { targetEntry: true }, orderBy: { type: 'asc' } },
      crossRefTargets: { include: { sourceEntry: true }, orderBy: { type: 'asc' } },
    },
  })
  if (!entry) return null

  const [totalVerses, books, firstOccurrence, lastOccurrence, verseWords] = await Promise.all([
    prisma.verseWord.count({ where: { strongNumber: formatted } }),
    prisma.verseWord.findMany({ where: { strongNumber: formatted }, select: { book: true }, distinct: ['book'] }),
    prisma.verseWord.findFirst({
      where: { strongNumber: formatted },
      orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }, { wordOrder: 'asc' }],
    }),
    prisma.verseWord.findFirst({
      where: { strongNumber: formatted },
      orderBy: [{ book: 'desc' }, { chapter: 'desc' }, { verse: 'desc' }, { wordOrder: 'desc' }],
    }),
    prisma.verseWord.findMany({
      where: { strongNumber: formatted },
      take: 8,
      orderBy: [{ book: 'asc' }, { chapter: 'asc' }, { verse: 'asc' }],
    }),
  ])

  const lookups = verseWords.map((vw) => ({ bookId: vw.book, chapter: vw.chapter, verse: vw.verse }))
  const verses = lookups.length
    ? await prisma.verse.findMany({ where: { OR: lookups } })
    : []
  const verseMap = new Map(verses.map((v) => [`${v.bookId}-${v.chapter}-${v.verse}`, v.text]))
  const sampleVerses = verseWords.map((vw) => {
    const text = verseMap.get(`${vw.book}-${vw.chapter}-${vw.verse}`)
    return { ...vw, verseText: text ?? null }
  })

  const stats = {
    totalVerses,
    books: books.map((b: { book: string }) => b.book),
    firstOccurrence: firstOccurrence
      ? { book: firstOccurrence.book, chapter: firstOccurrence.chapter, verse: firstOccurrence.verse }
      : null,
    lastOccurrence: lastOccurrence
      ? { book: lastOccurrence.book, chapter: lastOccurrence.chapter, verse: lastOccurrence.verse }
      : null,
  }

  const crossRefs = [
    ...(entry.crossRefs || []).map((c: any) => ({
      type: c.type,
      note: c.note,
      targetEntry: c.targetEntry,
    })),
    ...(entry.crossRefTargets || []).map((c: any) => ({
      type: c.type,
      note: c.note,
      targetEntry: c.sourceEntry,
    })),
  ]

  return { entry, stats, morphology: entry.morphology || [], crossRefs, sampleVerses }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  try {
    const q = searchParams.get('strongNumber')?.trim()

    if (!q) {
      const config = resolveAiConfig()
      return NextResponse.json({
        provider: config.providerKey,
        providerLabel: config.providerLabel,
        model: config.model,
        models: config.models,
        apiConfigured: Boolean(config.apiKey),
      })
    }

    const parsed = parseStrongNumber(q)
    if (!parsed) {
      return NextResponse.json({ error: 'Mã Strongs không hợp lệ' }, { status: 400 })
    }
    const formatted = formatStrongNumber(q!)

    const records = await prisma.aiAnalysis.findMany({ where: { strongNumber: formatted } })
    const analyses: Record<string, { content: string; model: string; createdAt: string } | null> = {
      translate: null,
      research: null,
      analysis: null,
    }
    for (const r of records) {
      analyses[r.type] = { content: r.content, model: r.model || '', createdAt: r.createdAt.toISOString() }
    }

    return NextResponse.json({ strongNumber: formatted, analyses })
  } catch (error) {
    console.error('AI GET error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { strongNumber, type, force, model } = body || {}
    if (!AI_TYPES.includes(type)) {
      return NextResponse.json({ error: 'Loại phân tích không hợp lệ' }, { status: 400 })
    }
    const parsed = parseStrongNumber(strongNumber)
    if (!parsed) {
      return NextResponse.json({ error: 'Mã Strongs không hợp lệ' }, { status: 400 })
    }
    const formatted = formatStrongNumber(strongNumber)

    const cached = await prisma.aiAnalysis.findUnique({
      where: { strongNumber_type: { strongNumber: formatted, type } },
    })
    if (cached && !force) {
      return NextResponse.json({
        type,
        content: cached.content,
        model: cached.model,
        createdAt: cached.createdAt.toISOString(),
        cached: true,
      })
    }

    const data = await loadData(formatted)
    if (!data) {
      return NextResponse.json({ error: 'Không tìm thấy entry Strongs' }, { status: 404 })
    }

    const context = buildContext(data)
    const system = buildSystemPrompt(type as AiType, getLanguageLabel(data.entry.language))
    const user = `Dữ liệu từ vựng:\n${context}\n\nHãy thực hiện nhiệm vụ được yêu cầu ở trên.`

    const result = await generateAiText(system, user, {
      model: typeof model === 'string' && model.trim() ? model.trim() : undefined,
    })

    const saved = await prisma.aiAnalysis.upsert({
      where: { strongNumber_type: { strongNumber: formatted, type } },
      create: { strongNumber: formatted, type, content: result.text, model: result.model },
      update: { content: result.text, model: result.model, updatedAt: new Date() },
    })

    return NextResponse.json({
      type,
      content: saved.content,
      model: saved.model,
      createdAt: saved.createdAt.toISOString(),
      cached: false,
    })
  } catch (error) {
    if (error instanceof AiNotConfiguredError) {
      return NextResponse.json(
        { error: 'Chưa cấu hình AI. Vui lòng thiết lập biến AI_API_KEY trong tệp .env để sử dụng tính năng này.' },
        { status: 503 }
      )
    }
    if (error instanceof AiRequestError) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }
    console.error('AI POST error:', error)
    return NextResponse.json({ error: 'Lỗi máy chủ nội bộ khi tạo nội dung AI' }, { status: 500 })
  }
}
