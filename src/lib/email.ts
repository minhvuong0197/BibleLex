interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

// Gửi email qua Resend (fetch, không thêm dependency). Nếu chưa có
// RESEND_API_KEY, in link ra console để vẫn test được luồng trong dev.
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<{ ok: boolean }> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || "SCRIPTLEX <noreply@scriptlex.app>"
  if (!apiKey) {
    console.log(`\n[email:dev] To=${to}\nSubject=${subject}\n${(text || html).replace(/<[^>]+>/g, "")}\n`)
    return { ok: true }
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({ from, to, subject, html, text }),
    })
    if (!res.ok) {
      console.error("sendEmail failed", res.status, await res.text().catch(() => ""))
      return { ok: false }
    }
    return { ok: true }
  } catch (e) {
    console.error("sendEmail error", e)
    return { ok: false }
  }
}

export function verificationEmailLink(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://scriptlex.app"
  return `${base}/verify-email?token=${encodeURIComponent(token)}`
}

export function resetPasswordLink(token: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://scriptlex.app"
  return `${base}/reset-password?token=${encodeURIComponent(token)}`
}
