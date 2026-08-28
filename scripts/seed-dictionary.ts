import { seedDictionaries } from "@/lib/dictionary-seed"
import { prisma } from "@/lib/db"

seedDictionaries()
  .catch((e) => {
    console.error("SEED ERROR:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
