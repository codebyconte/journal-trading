import { cache } from 'react'
import { prisma } from '@/lib/db'
import { serializeSettings } from '@/lib/data/serialize'
import type { Settings, CapitalAdjustment } from '@/lib/types'
import type { CapitalAdjustment as PrismaCapitalAdjustment } from '@prisma/client'

export const getSettings = cache(async (): Promise<Settings> => {
  let settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 'singleton', initialCapital: 100000, currentCapital: 100000, riskPercent: 1.0 },
    })
  }
  return serializeSettings(settings)
})

function serializeAdjustment(adj: PrismaCapitalAdjustment): CapitalAdjustment {
  return {
    id: adj.id,
    createdAt: adj.createdAt.toISOString(),
    amount: adj.amount,
    note: adj.note,
    balanceAfter: adj.balanceAfter,
  }
}

export const getCapitalAdjustments = cache(async (): Promise<CapitalAdjustment[]> => {
  const rows = await prisma.capitalAdjustment.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
  })
  return rows.map(serializeAdjustment)
})
