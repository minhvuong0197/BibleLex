import { NextRequest, NextResponse } from "next/server"

const AZURE_SPEECH_KEY = process.env.AZURE_SPEECH_KEY
const AZURE_SPEECH_REGION = process.env.AZURE_SPEECH_REGION || "southeastasia"
const DEFAULT_VOICE = process.env.TTS_VOICE || "vi-VN-NamMinhNeural"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 30

function xmlEscape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

export async function GET(req: NextRequest) {
  if (!AZURE_SPEECH_KEY) {
    return NextResponse.json(
      { error: "Chưa cấu hình Azure TTS (thiếu AZURE_SPEECH_KEY)" },
      { status: 503 }
    )
  }
  const text = req.nextUrl.searchParams.get("text")
  const voice = req.nextUrl.searchParams.get("voice") || DEFAULT_VOICE
  const rate = Math.min(1.9, Math.max(0.1, parseFloat(req.nextUrl.searchParams.get("rate") || "1") || 1))
  if (!text || text.length > 2000) {
    return NextResponse.json({ error: "Thiếu hoặc quá dài văn bản" }, { status: 400 })
  }
  const pct = Math.round((rate - 1) * 100)
  const rateAttr = `${pct > 0 ? "+" : ""}${pct}%`
  const ssml = `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='vi-VN'><voice name='${voice}'><prosody rate='${rateAttr}'>${xmlEscape(text)}</prosody></voice></speak>`
  try {
    const res = await fetch(
      `https://${AZURE_SPEECH_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": AZURE_SPEECH_KEY,
          "Content-Type": "application/ssml+xml",
          "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
        },
        body: ssml,
      }
    )
    if (!res.ok) {
      const err = await res.text().catch(() => "")
      return NextResponse.json({ error: `Azure TTS ${res.status}: ${err.slice(0, 200)}` }, { status: 502 })
    }
    const buf = await res.arrayBuffer()
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Lỗi Azure TTS" }, { status: 500 })
  }
}
