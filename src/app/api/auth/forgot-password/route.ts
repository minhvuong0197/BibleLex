import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { generateToken, tokenExpiry } from "@/lib/auth"
import { sendEmail, resetPasswordLink } from "@/lib/email"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  const email = typeof body.email === "string" ? body.email.toLowerCase().trim() : ""
  // Luôn trả ok để không lộ email có tồn tại hay không.
  if (email) {
    const user = await prisma.user.findUnique({ where: { email } })
    if (user) {
      const resetToken = generateToken()
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetTokenExpiry: tokenExpiry(1) },
      })
      const link = resetPasswordLink(resetToken)
      await sendEmail({
        to: email,
        subject: "Đặt lại mật khẩu SCRIPTLEX",
        html: `<p>Yêu cầu đặt lại mật khẩu cho tài khoản SCRIPTLEX.</p><p>Nhấn để đặt lại: <a href="${link}">${link}</a></p><p>Nếu không phải bạn, bỏ qua email này.</p>`,
        text: `Đặt lại mật khẩu SCRIPTLEX: ${link}`,
      })
    }
  }
  return NextResponse.json({ ok: true })
}
