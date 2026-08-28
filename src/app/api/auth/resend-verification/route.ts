import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateToken, tokenExpiry } from "@/lib/auth"
import { sendEmail, verificationEmailLink } from "@/lib/email"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : ""
  if (!email) return NextResponse.json({ error: "Thiếu email" }, { status: 400 })
  const user = await prisma.user.findUnique({ where: { email } })
  // Không lộ email có tồn tại hay đã xác nhận.
  if (!user || user.emailVerified) return NextResponse.json({ ok: true })
  const verifyToken = generateToken()
  await prisma.user.update({
    where: { id: user.id },
    data: { verifyToken, verifyTokenExpiry: tokenExpiry(48) },
  })
  const link = verificationEmailLink(verifyToken)
  await sendEmail({
    to: email,
    subject: "Xác nhận email SCRIPTLEX",
    html: `<p>Cảm ơn bạn đăng ký SCRIPTLEX.</p><p>Nhấn để xác nhận email: <a href="${link}">${link}</a></p>`,
    text: `Xác nhận email SCRIPTLEX: ${link}`,
  })
  return NextResponse.json({ ok: true })
}
