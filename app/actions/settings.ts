'use server'

import { prisma } from '@/lib/db'
import { revalidateTradingPaths } from '@/lib/revalidate'
import type { ActionResult } from '@/app/actions/trades'

export async function updateSettings(input: {
  initialCapital: number
  currentCapital: number
  riskPercent: number
}): Promise<ActionResult> {
  try {
    await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: {
        initialCapital: input.initialCapital,
        currentCapital: input.currentCapital,
        riskPercent: input.riskPercent,
      },
      create: {
        id: 'singleton',
        initialCapital: input.initialCapital,
        currentCapital: input.currentCapital,
        riskPercent: input.riskPercent,
      },
    })
    revalidateTradingPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la sauvegarde' }
  }
}
