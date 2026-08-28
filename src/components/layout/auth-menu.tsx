"use client"

import { useEffect, useState, FormEvent } from "react"
import Link from "next/link"
import { User, LogOut, BookMarked, X, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MeUser {
  id: string
  email: string
  name?: string | null
  emailVerified?: boolean
}

export function AuthMenu() {
  const [user, setUser] = useState<MeUser | null | undefined>(undefined)
  const [open, setOpen] = useState(false)
  const [menu, setMenu] = useState(false)
  const [tab, setTab] = useState<"login" | "register">("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [forgot, setForgot] = useState(false)
  const [forgotEmail, setForgotEmail] = useState("")
  const [forgotMsg, setForgotMsg] = useState("")
  const [resendBusy, setResendBusy] = useState(false)
  const [resendMsg, setResendMsg] = useState("")

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((d) => setUser(d.user || null))
      .catch(() => setUser(null))
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError("")
    setBusy(true)
    const url = tab === "login" ? "/api/auth/login" : "/api/auth/register"
    const body = tab === "login" ? { email, password } : { email, password, name }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const data = await res.json().catch(() => ({}))
    setBusy(false)
    if (!res.ok) {
      setError(data.error || "Đã xảy ra lỗi")
      return
    }
    setUser(data.user)
    setOpen(false)
    setEmail("")
    setPassword("")
    setName("")
  }

  async function submitForgot(e: FormEvent) {
    e.preventDefault()
    setForgotMsg("")
    setBusy(true)
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: forgotEmail }),
    })
    setBusy(false)
    if (res.ok) setForgotMsg("Nếu email tồn tại, hướng dẫn đặt lại mật khẩu đã được gửi.")
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setMenu(false)
  }

  async function resend() {
    if (!user) return
    setResendBusy(true)
    setResendMsg("")
    const res = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    })
    setResendBusy(false)
    if (res.ok) setResendMsg("Đã gửi lại link xác nhận vào email.")
  }

  if (user === undefined) return <div className="h-9 w-9" />

  if (!user) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <User className="h-4 w-4" /> Đăng nhập
        </Button>
        {open && (
          <div className="fixed inset-0 z-50 overflow-y-auto bg-black/40 p-4" onClick={() => setOpen(false)}>
            <div className="flex min-h-full items-center justify-center">
            <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{forgot ? "Quên mật khẩu" : tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h2>
                <button onClick={() => setOpen(false)} aria-label="Đóng">
                  <X className="h-5 w-5" />
                </button>
              </div>

              {forgot ? (
                <form onSubmit={submitForgot} className="space-y-3">
                  <Input
                    type="email"
                    required
                    placeholder="Email của bạn"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                  {forgotMsg && <p className="text-sm text-primary">{forgotMsg}</p>}
                  <Button type="submit" className="w-full" disabled={busy}>
                    {busy ? "Đang gửi…" : "Gửi hướng dẫn"}
                  </Button>
                  <button type="button" className="text-xs text-muted-foreground hover:underline" onClick={() => setForgot(false)}>
                    ← Quay lại đăng nhập
                  </button>
                </form>
              ) : (
                <>
                  <div className="mb-4 flex gap-2">
                    <button
                      onClick={() => setTab("login")}
                      className={"flex-1 rounded-lg py-1.5 text-sm " + (tab === "login" ? "bg-primary text-primary-foreground" : "bg-muted")}
                    >
                      Đăng nhập
                    </button>
                    <button
                      onClick={() => setTab("register")}
                      className={"flex-1 rounded-lg py-1.5 text-sm " + (tab === "register" ? "bg-primary text-primary-foreground" : "bg-muted")}
                    >
                      Đăng ký
                    </button>
                  </div>
                  <form onSubmit={submit} className="space-y-3">
                    {tab === "register" && (
                      <Input placeholder="Tên (tùy chọn)" value={name} onChange={(e) => setName(e.target.value)} />
                    )}
                    <Input type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    <Input type="password" required minLength={6} placeholder="Mật khẩu (tối thiểu 6 ký tự)" value={password} onChange={(e) => setPassword(e.target.value)} />
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button type="submit" className="w-full" disabled={busy}>
                      {busy ? "Đang xử lý…" : tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}
                    </Button>
                  </form>
                  {tab === "login" && (
                    <button
                      type="button"
                      className="mt-2 text-xs text-muted-foreground hover:underline"
                      onClick={() => setForgot(true)}
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                Chưa xác nhận email? Kiểm tra hộp thư (hoặc console dev) để lấy link xác nhận.
              </p>
            </div>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setMenu((m) => !m)}>
        <User className="h-4 w-4" /> {user.name || user.email.split("@")[0]}
      </Button>
      {menu && (
        <div className="absolute right-0 z-50 mt-2 w-56 rounded-xl border bg-card p-2 shadow-xl">
          {!user.emailVerified && (
            <div className="mb-2 space-y-1 rounded-lg bg-amber-100/70 p-2 text-xs text-amber-900 dark:bg-amber-900/30 dark:text-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                <span>Email chưa xác nhận. Kiểm tra hộp thư để kích hoạt.</span>
              </div>
              <button
                type="button"
                onClick={resend}
                disabled={resendBusy}
                className="rounded-md bg-amber-200 px-2 py-1 font-medium hover:bg-amber-300 disabled:opacity-60"
              >
                {resendBusy ? "Đang gửi…" : "Gửi lại xác nhận"}
              </button>
              {resendMsg && <p className="text-amber-800 dark:text-amber-100">{resendMsg}</p>}
            </div>
          )}
          <Link
            href="/study"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm hover:bg-accent"
            onClick={() => setMenu(false)}
          >
            <BookMarked className="h-4 w-4" /> Học của tôi
          </Link>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive hover:bg-accent"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      )}
    </div>
  )
}
