interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

function parseFrom(): { name: string; email: string } {
  const raw = process.env.EMAIL_FROM || "SCRIPTLEX <noreply@scriptlex.app>"
  const m = raw.match(/^(.*?)\s*<(.+?)>$/)
  if (m) return { name: m[1].trim() || "SCRIPTLEX", email: m[2].trim() }
  return { name: "SCRIPTLEX", email: raw.trim() }
}

// Gửi email không thêm dependency. Ưu tiên:
//  - BREVO_API_KEY  (Brevo/Sendinblue, free, cho phép gửi từ email cá nhân đã xác minh, KHÔNG cần domain riêng)
//  - RESEND_API_KEY (Resend, cần domain đã verify)
//  - Nếu không có key nào: in link ra console để test luồng trong dev.
export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<{ ok: boolean }> {
  const brevoKey = process.env.BREVO_API_KEY
  const resendKey = process.env.RESEND_API_KEY
  const from = parseFrom()

  if (!brevoKey && !resendKey) {
    console.log(`\n[email:dev] To=${to}\nSubject=${subject}\n${(text || html).replace(/<[^>]+>/g, "")}\n`)
    return { ok: true }
  }

  if (brevoKey) {
    try {
      const res = await fetch("https://api.brevo.com/v3/smtp/email", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-key": brevoKey },
        body: JSON.stringify({
          sender: from,
          to: [{ email: to }],
          subject,
          html,
          text,
        }),
      })
      if (!res.ok) {
        console.error("sendEmail(Brevo) failed", res.status, await res.text().catch(() => ""))
        return { ok: false }
      }
      return { ok: true }
    } catch (e) {
      console.error("sendEmail(Brevo) error", e)
      return { ok: false }
    }
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${resendKey}` },
      body: JSON.stringify({ from: `${from.name} <${from.email}>`, to, subject, html, text }),
    })
    if (!res.ok) {
      console.error("sendEmail(Resend) failed", res.status, await res.text().catch(() => ""))
      return { ok: false }
    }
    return { ok: true }
  } catch (e) {
    console.error("sendEmail(Resend) error", e)
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
