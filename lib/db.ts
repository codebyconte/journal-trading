import { requireSession } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (!globalForPrisma.prisma) prisma.$use(async (params, next) => { await requireSession(); return next(params) })
globalForPrisma.prisma = prisma
