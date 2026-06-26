'use server'

import { prisma } from '@/lib/db'
import { calculatePlannedRR, calculatePnL, calculateRMultiple } from '@/lib/utils'
import { revalidateTradingPaths } from '@/lib/revalidate'
import type { TradeDirection, TradeOrderType } from '@/lib/types'

export type ActionResult = { success: true } | { success: false; error: string }

export interface CreateTradeInput {
  datetime: string
  asset: string
  direction: TradeDirection
  orderType: TradeOrderType
  entryPrice: string | number
  stopLoss: string | number
  takeProfit: string | number
  units: string | number
  riskAmount: number
  riskPercent: number
  checkEMA: boolean
  checkRSI: boolean
  checkVolume: boolean
  checkBBW: boolean
  checkLiquid: boolean
  checkUnlocks: boolean
  checkTVL: boolean
  checkCoinglass: boolean
  setup?: string | null
  marketCondition?: string | null
  emotionScore?: string | number | null
  sessionTime?: string | null
  notes?: string | null
  screenshot?: string | null
  protocolOverride?: boolean
  overrideReason?: string | null
}

export async function createTrade(input: CreateTradeInput): Promise<ActionResult> {
  try {
    const activeCount = await prisma.trade.count({
      where: { status: { in: ['OPEN', 'PENDING'] } },
    })
    if (activeCount > 0 && !input.protocolOverride) {
      return {
        success: false,
        error: 'Un trade est déjà ouvert ou en attente (R14 : un seul actif à la fois). Clôture ou annule-le d\'abord, ou utilise le mode journal honnête.',
      }
    }

    const entryPrice = parseFloat(String(input.entryPrice))
    const stopLoss = parseFloat(String(input.stopLoss))
    const takeProfit = parseFloat(String(input.takeProfit))
    const plannedRR = calculatePlannedRR(entryPrice, stopLoss, takeProfit, input.direction)

    await prisma.trade.create({
      data: {
        datetime: new Date(input.datetime),
        asset: input.asset,
        direction: input.direction,
        orderType: input.orderType,
        entryPrice,
        stopLoss,
        takeProfit,
        units: parseFloat(String(input.units)),
        riskAmount: input.riskAmount,
        riskPercent: input.riskPercent,
        plannedRR,
        status: 'PENDING',
        checkEMA: !!input.checkEMA,
        checkRSI: !!input.checkRSI,
        checkVolume: !!input.checkVolume,
        checkBBW: !!input.checkBBW,
        checkLiquid: !!input.checkLiquid,
        checkUnlocks: !!input.checkUnlocks,
        checkTVL: !!input.checkTVL,
        checkCoinglass: !!input.checkCoinglass,
        setup: input.setup || null,
        marketCondition: input.marketCondition || null,
        emotionScore: input.emotionScore ? parseInt(String(input.emotionScore)) : null,
        sessionTime: input.sessionTime || null,
        notes: input.notes || null,
        screenshot: input.screenshot || null,
        protocolOverride: !!input.protocolOverride,
        overrideReason: input.overrideReason?.trim() || null,
      },
    })

    revalidateTradingPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la création du trade' }
  }
}

export async function deleteTrade(id: string): Promise<ActionResult> {
  try {
    const trade = await prisma.trade.findUnique({ where: { id } })
    if (!trade) return { success: false, error: 'Trade non trouvé' }

    await prisma.$transaction(async (tx) => {
      if (trade.status === 'CLOSED' && trade.pnl != null) {
        const settings = await tx.settings.findUnique({ where: { id: 'singleton' } })
        const current = settings?.currentCapital ?? 100000
        await tx.settings.upsert({
          where: { id: 'singleton' },
          update: { currentCapital: current - trade.pnl },
          create: {
            id: 'singleton',
            initialCapital: 100000,
            currentCapital: 100000 - trade.pnl,
            riskPercent: 1.0,
          },
        })
      }
      await tx.trade.delete({ where: { id } })
    })

    revalidateTradingPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'Impossible de supprimer le trade' }
  }
}

export async function openTrade(id: string): Promise<ActionResult> {
  try {
    await prisma.trade.update({
      where: { id },
      data: { status: 'OPEN', openedAt: new Date() },
    })
    revalidateTradingPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'Impossible d\'ouvrir le trade' }
  }
}

export async function cancelTrade(id: string): Promise<ActionResult> {
  try {
    await prisma.trade.update({
      where: { id },
      data: { status: 'CANCELLED' },
    })
    revalidateTradingPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'Impossible d\'annuler le trade' }
  }
}

export async function closeTrade(
  id: string,
  exitPrice: number,
  mae?: number | null,
  mfe?: number | null,
  postTradeNotes?: string | null,
): Promise<ActionResult> {
  try {
    const trade = await prisma.trade.findUnique({ where: { id } })
    if (!trade) return { success: false, error: 'Trade non trouvé' }
    if (trade.status === 'CLOSED') return { success: false, error: 'Trade déjà clôturé' }
    if (!exitPrice || exitPrice <= 0) return { success: false, error: 'Prix de sortie invalide' }

    const settings = await prisma.settings.findUnique({ where: { id: 'singleton' } })
    const capitalBeforeClose = settings?.currentCapital ?? 100000
    const pnl = calculatePnL(trade.entryPrice, exitPrice, trade.units, trade.direction as TradeDirection)
    const rMultiple = calculateRMultiple(pnl, trade.riskAmount)
    const newCapital = capitalBeforeClose + pnl

    // Append post-trade notes to existing trade notes if provided
    const existingNotes = trade.notes ?? ''
    const updatedNotes = postTradeNotes?.trim()
      ? existingNotes
        ? `${existingNotes}\n\n[POST-TRADE]\n${postTradeNotes.trim()}`
        : `[POST-TRADE]\n${postTradeNotes.trim()}`
      : existingNotes || null

    await prisma.$transaction([
      prisma.trade.update({
        where: { id },
        data: {
          exitPrice,
          pnl,
          pnlPercent: capitalBeforeClose > 0 ? (pnl / capitalBeforeClose) * 100 : 0,
          rMultiple,
          mae: mae ?? null,
          mfe: mfe ?? null,
          status: 'CLOSED',
          closedAt: new Date(),
          notes: updatedNotes,
        },
      }),
      prisma.settings.upsert({
        where: { id: 'singleton' },
        update: { currentCapital: newCapital },
        create: {
          id: 'singleton',
          initialCapital: 100000,
          currentCapital: newCapital,
          riskPercent: 1.0,
        },
      }),
    ])

    revalidateTradingPaths()
    return { success: true }
  } catch {
    return { success: false, error: 'Erreur lors de la clôture' }
  }
}
