"use client"

import { useEffect, useState, FormEvent } from "react"
import Link from "next/link"
import { User, LogOut, BookMarked, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface MeUser {
  id: string
  email: string
  name?: string | null
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

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" })
    setUser(null)
    setMenu(false)
  }

  if (user === undefined) return <div className="h-9 w-9" />

  if (!user) {
    return (
      <>
        <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
          <User className="h-4 w-4" /> Đăng nhập
        </Button>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
            <div className="w-full max-w-sm rounded-2xl border bg-card p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold">{tab === "login" ? "Đăng nhập" : "Tạo tài khoản"}</h2>
                <button onClick={() => setOpen(false)} aria-label="Đóng">
                  <X className="h-5 w-5" />
                </button>
              </div>
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
              <p className="mt-3 text-xs text-muted-foreground">
                Dữ liệu học (ghi chú, đánh dấu) được lưu trên máy bạn khi chưa đăng nhập, và đồng bộ trên máy chủ khi đã đăng nhập.
              </p>
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
        <div className="absolute right-0 z-50 mt-2 w-48 rounded-xl border bg-card p-2 shadow-xl">
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
