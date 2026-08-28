import { NextRequest, NextResponse } from "next/server"

const VBEE_APP_ID = process.env.VBEE_APP_ID
const VBEE_ACCESS_TOKEN = process.env.VBEE_ACCESS_TOKEN
const DEFAULT_VOICE =
  process.env.VBEE_VOICE_CODE || "s_sg_male_thientam_ytstable_vc"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

async function generateSpeech(
  text: string,
  voiceCode: string,
  speedRate: number
): Promise<string> {
  const res = await fetch("https://vbee.vn/api/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${VBEE_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      app_id: VBEE_APP_ID,
      input_text: text,
      voice_code: voiceCode,
      audio_type: "mp3",
      speed_rate: speedRate,
      callback_url: "https://example.com/callback",
    }),
  })
  if (!res.ok) throw new Error(`Vbee HTTP ${res.status}`)
  const data = await res.json()
  if (data.status !== 1) throw new Error(data.error_message || data.error_code)
  const requestId = data.result?.request_id
  if (!requestId) throw new Error("Thiếu request_id từ Vbee")
  if (data.result?.audio_link) return data.result.audio_link
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000))
    const s = await fetch(`https://vbee.vn/api/v1/tts/${requestId}`, {
      headers: { Authorization: `Bearer ${VBEE_ACCESS_TOKEN}` },
    })
    if (!s.ok) continue
    const sd = await s.json()
    if (sd.status === 1) {
      if (sd.result?.status === "SUCCESS" && sd.result?.audio_link)
        return sd.result.audio_link
      if (sd.result?.status === "FAILURE") throw new Error("Vbee xử lý thất bại")
    }
  }
  throw new Error("Vbee quá thời gian chờ")
}

export async function GET(req: NextRequest) {
  if (!VBEE_ACCESS_TOKEN || !VBEE_APP_ID) {
    return NextResponse.json(
      { error: "Chưa cấu hình Vbee (thiếu VBEE_APP_ID/VBEE_ACCESS_TOKEN)" },
      { status: 503 }
    )
  }
  const text = req.nextUrl.searchParams.get("text")
  const voice = req.nextUrl.searchParams.get("voice") || DEFAULT_VOICE
  const rate = Math.min(1.9, Math.max(0.1, parseFloat(req.nextUrl.searchParams.get("rate") || "1") || 1))
  if (!text || text.length > 2000) {
    return NextResponse.json({ error: "Thiếu hoặc quá dài văn bản" }, { status: 400 })
  }
  try {
    const link = await generateSpeech(text, voice, rate)
    const audio = await fetch(link)
    if (!audio.ok) return NextResponse.json({ error: "Lỗi tải audio" }, { status: 502 })
    const buf = await audio.arrayBuffer()
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Lỗi Vbee" }, { status: 500 })
  }
}
