import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateAiText } from "@/lib/ai"

export const maxDuration = 60

const DICT_VI_SYSTEM = `Bạn là nhà biên soạn từ điển Kinh Thánh tiếng Việt. Hãy dịch định nghĩa từ điển tiếng Anh sau sang tiếng Việt tự nhiên, trung thành với ý nghĩa, khách quan và ngắn gọn. Giữ nguyên tên riêng (địa danh, nhân danh, sách Kinh Thánh) không dịch, nhưng có thể thêm phiên âm trong ngoặc nếu hữu ích. CHỈ trả lời bản tiếng Việt, không thêm lời dẫn, không dùng dấu ngoặc kép bọc cả đoạn.`

export async function GET(req: NextRequest) {
  const term = (req.nextUrl.searchParams.get("term") || "").trim()
  const source = (req.nextUrl.searchParams.get("source") || "").trim()
  if (!term || !source) {
    return NextResponse.json({ error: "missing params" }, { status: 400 })
  }

  const entry = await prisma.dictionaryEntry.findUnique({
    where: { term_source: { term, source } },
  })
  if (!entry) return NextResponse.json({ error: "not found" }, { status: 404 })

  if (entry.vietnameseDef && entry.vietnameseDef.trim()) {
    return NextResponse.json({ vietnameseDef: entry.vietnameseDef })
  }

  const { text } = await generateAiText(DICT_VI_SYSTEM, entry.definition, {
    temperature: 0.3,
    timeoutMs: 45000,
  })
  const vi = text.trim().replace(/<think>[\s\S]*?<\/think>/gi, "").trim()

  if (vi) {
    await prisma.dictionaryEntry
      .update({
        where: { term_source: { term, source } },
        data: { vietnameseDef: vi },
      })
      .catch(() => {})
    return NextResponse.json({ vietnameseDef: vi })
  }
  return NextResponse.json({ vietnameseDef: null })
}
