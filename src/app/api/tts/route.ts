import { NextRequest, NextResponse } from "next/server"

const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY
const DEFAULT_VOICE = process.env.TTS_VOICE || "pNInz6obpgDQGcFmaJgB" // Adam (nam)

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(req: NextRequest) {
  if (!ELEVEN_API_KEY) {
    return NextResponse.json(
      { error: "Chưa cấu hình ElevenLabs (thiếu ELEVENLABS_API_KEY)" },
      { status: 503 }
    )
  }
  const text = req.nextUrl.searchParams.get("text")
  const voice = req.nextUrl.searchParams.get("voice") || DEFAULT_VOICE
  if (!text || text.length > 2500) {
    return NextResponse.json({ error: "Thiếu hoặc quá dài văn bản" }, { status: 400 })
  }
  try {
    const res = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_128`,
      {
        method: "POST",
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        body: JSON.stringify({
          text,
          model_id: "eleven_multilingual_v2",
          voice_settings: { stability: 0.4, similarity_boost: 0.6, style: 0, use_speaker_boost: true },
        }),
      }
    )
    if (!res.ok) {
      const err = await res.text().catch(() => "")
      return NextResponse.json({ error: `ElevenLabs ${res.status}: ${err.slice(0, 200)}` }, { status: 502 })
    }
    const buf = await res.arrayBuffer()
    return new NextResponse(buf, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
      },
    })
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Lỗi ElevenLabs" }, { status: 500 })
  }
}
