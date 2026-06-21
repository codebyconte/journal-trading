import { cache } from 'react'
import { prisma } from '@/lib/db'
import { serializeSettings } from '@/lib/data/serialize'
import type { Settings } from '@/lib/types'

export const getSettings = cache(async (): Promise<Settings> => {
  let settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 'singleton', initialCapital: 100000, currentCapital: 100000, riskPercent: 1.0 },
    })
  }
  return serializeSettings(settings)
})
