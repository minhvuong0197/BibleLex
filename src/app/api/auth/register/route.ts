import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import {
  hashPassword,
  createToken,
  SESSION_COOKIE,
  sessionCookieOptions,
} from "@/lib/auth"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : ""
  const password = typeof body.password === "string" ? body.password : ""
  const name = typeof body.name === "string" ? body.name.trim() : null
  if (!email || !password) return NextResponse.json({ error: "Thiếu email hoặc mật khẩu" }, { status: 400 })
  if (password.length < 6) return NextResponse.json({ error: "Mật khẩu tối thiểu 6 ký tự" }, { status: 400 })
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return NextResponse.json({ error: "Email đã được sử dụng" }, { status: 409 })

  const user = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash: hashPassword(password),
      emailVerified: true,
    },
  })

  const token = createToken({ sub: user.id, email: user.email, name: user.name })
  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, emailVerified: true } })
  res.cookies.set(SESSION_COOKIE, token, sessionCookieOptions())
  return res
}
