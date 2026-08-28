"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

const btn = "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"

export default function VerifyEmailPage() {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading")
  const [msg, setMsg] = useState("")

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token") || ""
    if (!token) {
      setStatus("error")
      setMsg("Thiếu mã xác nhận.")
      return
    }
    fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`)
      .then((r) => r.json().then((d) => ({ ok: r.ok, d })))
      .then(({ ok, d }) => {
        if (ok) setStatus("ok")
        else {
          setStatus("error")
          setMsg(d.error || "Xác nhận thất bại.")
        }
      })
      .catch(() => {
        setStatus("error")
        setMsg("Lỗi mạng, thử lại.")
      })
  }, [])

  return (
    <div className="container py-16 max-w-md">
      <Card>
        <CardContent className="pt-6 text-center">
          {status === "loading" && <p className="text-muted-foreground">Đang xác nhận email…</p>}
          {status === "ok" && (
            <>
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
              <h1 className="mb-2 text-xl font-semibold">Email đã xác nhận</h1>
              <p className="mb-4 text-muted-foreground">Tài khoản của bạn đã được kích hoạt.</p>
              <Link href="/" className={btn}>
                Về trang chủ
              </Link>
            </>
          )}
          {status === "error" && (
            <>
              <XCircle className="mx-auto mb-3 h-12 w-12 text-destructive" />
              <h1 className="mb-2 text-xl font-semibold">Xác nhận thất bại</h1>
              <p className="mb-4 text-muted-foreground">{msg}</p>
              <Link href="/" className={btn}>
                Về trang chủ
              </Link>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
