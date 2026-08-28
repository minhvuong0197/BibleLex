import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { getCurrentUser } from "@/lib/auth"

export async function GET() {
  const user = await getCurrentUser()
  if (!user) return NextResponse.json({ user: null }, { status: 401 })
  const dbUser = await prisma.user.findUnique({ where: { id: user.sub } })
  if (!dbUser) return NextResponse.json({ user: null }, { status: 401 })
  return NextResponse.json({
    user: { id: dbUser.id, email: dbUser.email, name: dbUser.name, emailVerified: dbUser.emailVerified },
  })
}
