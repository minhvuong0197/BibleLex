import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const AI_PROVIDER = (process.env.AI_PROVIDER || '').toLowerCase()
const AI_BASE_URL =
  process.env.AI_BASE_URL ||
  (AI_PROVIDER === 'gemini'
    ? 'https://generativelanguage.googleapis.com/v1beta/openai'
    : AI_PROVIDER === 'groq'
      ? 'https://api.groq.com/openai/v1'
      : 'https://api.openai.com/v1')
const AI_MODEL = process.env.AI_MODEL || 'gpt-4o-mini'
const AI_API_KEY = process.env.AI_API_KEY || ''

const CONCURRENCY = parseInt(process.env.CONCURRENCY || '4', 10)
const LIMIT = process.env.LIMIT ? parseInt(process.env.LIMIT, 10) : undefined
const OCCURRING_ONLY = process.env.OCCURRING_ONLY === '1'

const SYSTEM = `Bạn là chuyên gia từ vựng Kinh Thánh, thông thạo tiếng Hê-bơ-rơ cổ và Hy-lạp Koine, dùng bản Tiếng Việt Truyền Thống Hiệu Đính 2010 (TTHĐ 2010).
Nhiệm vụ: dịch định nghĩa từ vựng Kinh Thánh (tiếng Anh) sang tiếng Việt ngắn gọn, CHỈ nghĩa cốt lõi (1-3 dòng), văn phong TTHĐ 2010, khách quan, học thuật.
Trả về DUY NHẤT nội dung tiếng Việt. Không tiêu đề, không Markdown, không dấu ngoặc, không giải thích thêm.`

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

async function translate(text: string): Promise<string> {
  const body: any = {
    model: AI_MODEL,
    messages: [
      { role: 'system', content: SYSTEM },
      { role: 'user', content: text },
    ],
    temperature: 0.3,
  }
  // Tắt chế độ "thinking" cho các model sinh chuỗi suy luận (vd. qwen3, gpt-oss)
  if (AI_MODEL.includes('qwen') || AI_MODEL.includes('gpt-oss')) {
    body.reasoning_effort = 'none'
  }
  const res = await fetch(`${AI_BASE_URL.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${AI_API_KEY}` },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.text().catch(() => '')
    if (res.status === 429) throw new Error('429:' + err.slice(0, 120))
    throw new Error(`AI ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  let out = (data?.choices?.[0]?.message?.content || '').trim()
  // Lọc bỏ chuỗi suy luận rò rỉ (phòng hờ)
  out = out.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/<think>[\s\S]*/gi, '').trim()
  return out
}

let done = 0

async function processOne(
  entry: { strongNumber: string; definition: string | null; kjvDef: string | null },
  total: number,
) {
  const source = (entry.kjvDef && entry.kjvDef.trim()) || (entry.definition && entry.definition.trim())
  if (!source) return
  let vi = ''
  let attempts = 0
  while (attempts < 6) {
    attempts++
    try {
      vi = await translate(source)
      break
    } catch (e) {
      const msg = (e as Error).message
      const isRate = msg.startsWith('429')
      console.error(`  [${entry.strongNumber}] lỗi (lần ${attempts}): ${isRate ? 'rate-limit, chờ 60s' : msg.slice(0, 80)}`)
      await sleep(isRate ? 60000 : 2000)
    }
  }
  if (!vi) return
  await prisma.strongEntry.update({
    where: { strongNumber: entry.strongNumber },
    data: { vietnameseDef: vi },
  })
  done++
  if (done % 25 === 0) console.log(`  ✓ ${done}/${total} (${entry.strongNumber})`)
  await sleep(2100)
}

async function main() {
  if (!AI_API_KEY) {
    console.error('Thiếu AI_API_KEY trong .env')
    process.exit(1)
  }

  let pending: { strongNumber: string; definition: string | null; kjvDef: string | null }[]

  if (OCCURRING_ONLY) {
    console.log('Chế độ: chỉ các mã xuất hiện trong liên dòng (interlinear).')
    const occurring = await prisma.verseWord.findMany({
      where: { strongNumber: { not: null } },
      select: { strongNumber: true },
      distinct: ['strongNumber'],
    })
    const set = new Set(occurring.map((o) => o.strongNumber))
    const all = await prisma.strongEntry.findMany({
      where: { vietnameseDef: null },
      select: { strongNumber: true, definition: true, kjvDef: true },
    })
    pending = all.filter((e) => set.has(e.strongNumber))
  } else {
    console.log('Chế độ: toàn bộ mã Strong (đầy đủ khung khóa).')
    pending = await prisma.strongEntry.findMany({
      where: { vietnameseDef: null },
      select: { strongNumber: true, definition: true, kjvDef: true },
    })
  }

  if (LIMIT) pending = pending.slice(0, LIMIT)
  const total = pending.length
  console.log(`Cần dịch: ${total} mã. Concurrency=${CONCURRENCY}, model=${AI_MODEL}`)

  let cursor = 0
  const workers = Array.from({ length: Math.min(CONCURRENCY, total) }, async () => {
    while (cursor < total) {
      const idx = cursor++
      await processOne(pending[idx], total)
    }
  })
  await Promise.all(workers)

  console.log(`Hoàn tất. Đã dịch ${done}/${total} mã.`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
