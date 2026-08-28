import { cookies } from "next/headers"
import crypto from "crypto"

export const SESSION_COOKIE = "scriptlex_session"
const SECRET = process.env.AUTH_SECRET || "scriptlex-dev-insecure-secret-change-me"
const MAX_AGE = 60 * 60 * 24 * 7 // 7 days

export interface SessionPayload {
  sub: string
  email: string
  name?: string | null
}

function b64url(input: Buffer | string): string {
  return Buffer.from(input).toString("base64url")
}

function sign(data: string): string {
  return crypto.createHmac("sha256", SECRET).update(data).digest("base64url")
}

export function hashPassword(pw: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto.scryptSync(pw, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(pw: string, stored: string): boolean {
  const [salt, hash] = stored.split(":")
  if (!salt || !hash) return false
  const h = crypto.scryptSync(pw, salt, 64).toString("hex")
  const a = Buffer.from(h)
  const b = Buffer.from(hash)
  if (a.length !== b.length) return false
  return crypto.timingSafeEqual(a, b)
}

export function createToken(payload: SessionPayload): string {
  const header = b64url(JSON.stringify({ alg: "HS256", typ: "JWT" }))
  const now = Math.floor(Date.now() / 1000)
  const body = b64url(JSON.stringify({ ...payload, iat: now, exp: now + MAX_AGE }))
  const sig = sign(`${header}.${body}`)
  return `${header}.${body}.${sig}`
}

export function verifyToken(token: string): SessionPayload | null {
  const parts = token.split(".")
  if (parts.length !== 3) return null
  const expected = sign(`${parts[0]}.${parts[1]}`)
  if (expected !== parts[2]) return null
  try {
    const body = JSON.parse(Buffer.from(parts[1], "base64url").toString())
    if (body.exp && body.exp < Math.floor(Date.now() / 1000)) return null
    return { sub: body.sub, email: body.email, name: body.name ?? null }
  } catch {
    return null
  }
}

export function sessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    maxAge: MAX_AGE,
    secure: process.env.NODE_ENV === "production",
  }
}

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex")
}

export function tokenExpiry(hours = 24): Date {
  return new Date(Date.now() + hours * 3600 * 1000)
}

export async function getCurrentUser(): Promise<SessionPayload | null> {
  const c = await cookies()
  const token = c.get(SESSION_COOKIE)?.value
  if (!token) return null
  return verifyToken(token)
}
