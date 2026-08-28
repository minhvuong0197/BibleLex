import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { verifyPassword, createToken, SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : ""
  const password = typeof body.password === "string" ? body.password : ""
  if (!email || !password) return NextResponse.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return NextResponse.json({ error: "Email hoặc mật khẩu không đúng" }, { status: 401 })
  }
  const token = createToken({ sub: user.id, email: user.email, name: user.name })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name } })
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return res
}
