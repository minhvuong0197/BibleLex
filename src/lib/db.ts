import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pgPool: Pool | undefined
}

function buildConnectionString(): string {
  const url = process.env.DATABASE_URL ?? ''
  if (!url) return url
  const u = new URL(url)
  const params = u.searchParams
  // Với Supabase pooler (pgbouncer), mỗi Lambda chỉ nên giữ 1 connection
  if (params.get('pgbouncer') === 'true' && !params.has('connection_limit')) {
    params.set('connection_limit', '1')
  }
  // Bắt buộc TLS. Supabase pooler dùng cert tự ký -> cần no-verify (tắt xác thực CA)
  if (!params.has('sslmode')) {
    params.set('sslmode', 'no-verify')
  }
  u.search = params.toString()
  return u.toString()
}

const connectionString = buildConnectionString()
const needsSsl = /(^|[?&])sslmode=(require|no-verify|prefer)/.test(connectionString)
const pgPool =
  globalForPrisma.pgPool ??
  new Pool({
    connectionString,
    max: 1,
    ...(needsSsl ? { ssl: { rejectUnauthorized: false } } : {}),
  })
if (process.env.NODE_ENV !== 'production') globalForPrisma.pgPool = pgPool

const adapter = new PrismaPg(pgPool, { disposeExternalPool: false })

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    adapter,
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma
