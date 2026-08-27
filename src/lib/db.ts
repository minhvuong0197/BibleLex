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
  // Với Supabase pooler (pgbouncer), mỗi Lambda chỉ nên giữ 1 connection
  if (url.includes('pgbouncer=true') && !url.includes('connection_limit=')) {
    return `${url}&connection_limit=1`
  }
  return url
}

const pgPool = globalForPrisma.pgPool ?? new Pool({ connectionString: buildConnectionString(), max: 1 })
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
