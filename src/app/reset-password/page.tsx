"use client"

import { useEffect, useState, FormEvent } from "react"
import Link from "next/link"
import { CheckCircle2, XCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const linkBtn = "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"

export default function ResetPasswordPage() {
  const [token, setToken] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [done, setDone] = useState(false)

  useEffect(() => {
    setToken(new URLSearchParams(window.location.search).get("token") || "")
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError("")
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    })
    const d = await res.json().catch(() => ({}))
    if (res.ok) setDone(true)
    else setError(d.error || "Đặt lại thất bại.")
  }

  return (
    <div className="container py-16 max-w-md">
      <Card>
        <CardContent className="pt-6">
          <h1 className="mb-4 text-xl font-semibold text-center">Đặt lại mật khẩu</h1>
          {!done ? (
            <form onSubmit={submit} className="space-y-3">
              {!token && <p className="text-sm text-destructive">Thiếu mã đặt lại từ email.</p>}
              <Input
                type="password"
                required
                minLength={6}
                placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={!token || password.length < 6}>
                Đặt lại mật khẩu
              </Button>
            </form>
          ) : (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-green-600" />
              <p className="mb-4 text-muted-foreground">Mật khẩu đã được cập nhật.</p>
              <Link href="/" className={linkBtn}>
                Đăng nhập
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
