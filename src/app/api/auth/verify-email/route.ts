import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token")
  if (!token) return NextResponse.json({ ok: false, error: "Thiếu mã xác nhận" }, { status: 400 })
  const user = await prisma.user.findFirst({
    where: { verifyToken: token, verifyTokenExpiry: { gt: new Date() } },
  })
  if (!user) return NextResponse.json({ ok: false, error: "Mã xác nhận không hợp lệ hoặc đã hết hạn" }, { status: 400 })
  await prisma.user.update({
    where: { id: user.id },
    data: { emailVerified: true, verifyToken: null, verifyTokenExpiry: null },
  })
  return NextResponse.json({ ok: true })
}
