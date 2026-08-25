import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe(
    'ALTER TABLE strong_entries ADD COLUMN IF NOT EXISTS vietnamese_def text',
  )
  const rows = await prisma.$queryRawUnsafe<{ count: number }[]>(
    'SELECT COUNT(*)::int AS count FROM strong_entries WHERE vietnamese_def IS NOT NULL',
  )
  console.log('Column vietnamese_def ensured. Translated rows so far:', rows[0]?.count ?? 0)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
