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

/** Ajoute ou retire du capital (dépôt / retrait manuel). */
export async function adjustCapital(input: {
  amount: number
  note?: string | null
}): Promise<ActionResult> {
  try {
    if (!input.amount || !isFinite(input.amount) || input.amount === 0) {
      return { success: false, error: 'Montant invalide' }
    }

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const current = settings?.currentCapital ?? 100000
    const newBalance = current + input.amount
    if (newBalance < 0) {
      return { success: false, error: 'Le capital ne peut pas devenir négatif' }
    }

    await prisma.$transaction([
      prisma.settings.upsert({
        where: { id: 'singleton' },
        update: { currentCapital: newBalance },
        create: {
          id: 'singleton',
          initialCapital: 100000,
          currentCapital: newBalance,
          riskPercent: 1.0,
        },
      }),
      prisma.capitalAdjustment.create({
        data: {
          amount: input.amount,
          note: input.note?.trim() || null,
          balanceAfter: newBalance,
        },
      }),
    ])

    revalidateTradingPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de l\'ajustement du capital' }
  }
}

/** Recalcule le capital actuel = initial + somme des PnL clôturés + ajustements manuels. */
export async function recalculateCapital(): Promise<ActionResult & { capital?: number }> {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const initial = settings?.initialCapital ?? 100000

    const closedTrades = await prisma.trade.findMany({
      where: { status: 'CLOSED', pnl: { not: null } },
      select: { pnl: true },
    })
    const tradePnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)

    const adjustments = await prisma.capitalAdjustment.findMany({
      select: { amount: true },
    })
    const adjustmentTotal = adjustments.reduce((s, a) => s + a.amount, 0)

    const newCapital = initial + tradePnl + adjustmentTotal

    await prisma.settings.upsert({
      where: { id: 'singleton' },
      update: { currentCapital: newCapital },
      create: {
        id: 'singleton',
        initialCapital: initial,
        currentCapital: newCapital,
        riskPercent: settings?.riskPercent ?? 1.0,
      },
    })

    revalidateTradingPaths()
    return { success: true, capital: newCapital }
  } catch {
    return { success: false, error: 'Erreur lors du recalcul du capital' }
  }
}

/** Réinitialise le journal : supprime tous les trades et remet le capital. */
export async function resetJournal(input: {
  resetCapitalTo?: number
  deleteAdjustments?: boolean
}): Promise<ActionResult> {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const newCapital = input.resetCapitalTo ?? settings?.initialCapital ?? 100000

    const ops = [
      prisma.trade.deleteMany(),
      prisma.settings.upsert({
        where: { id: 'singleton' },
        update: { currentCapital: newCapital },
        create: {
          id: 'singleton',
          initialCapital: newCapital,
          currentCapital: newCapital,
          riskPercent: settings?.riskPercent ?? 1.0,
        },
      }),
    ]

    if (input.deleteAdjustments) {
      ops.push(prisma.capitalAdjustment.deleteMany())
    }

    await prisma.$transaction(ops)

    revalidateTradingPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la réinitialisation' }
  }
}
