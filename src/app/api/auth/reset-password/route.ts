import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { hashPassword } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const token = typeof body.token === "string" ? body.token : ""
  const password = typeof body.password === "string" ? body.password : ""
  if (!token || password.length < 6) {
    return NextResponse.json({ error: "Thiếu mã hoặc mật khẩu chưa đủ 6 ký tự" }, { status: 400 })
  }
  const user = await prisma.user.findFirst({
    where: { resetToken: token, resetTokenExpiry: { gt: new Date() } },
  })
  if (!user) return NextResponse.json({ error: "Mã đặt lại không hợp lệ hoặc đã hết hạn" }, { status: 400 })
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(password), resetToken: null, resetTokenExpiry: null },
  })
  return NextResponse.json({ ok: true })
}
