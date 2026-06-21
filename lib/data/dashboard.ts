import { cache } from 'react'
import { prisma } from '@/lib/db'
import { computeDashboardMetrics, computeCircuitBreaker } from '@/lib/stats'
import { serializeTrade } from '@/lib/data/serialize'
import type { DashboardStats, Trade } from '@/lib/types'

export const getDashboardStats = cache(async (): Promise<DashboardStats> => {
  const [settings, allTrades] = await Promise.all([
    prisma.settings.findUnique({ where: { id: 'singleton' } }),
    prisma.trade.findMany({ orderBy: { datetime: 'asc' } }),
  ])

  const initialCapital = settings?.initialCapital ?? 100000
  const currentCapital = settings?.currentCapital ?? initialCapital

  const metrics = computeDashboardMetrics(allTrades, {
    initialCapital,
    currentCapital,
  })

  const referenceCapital = metrics.initialCapital + metrics.totalPnl || metrics.currentCapital

  return {
    currentCapital: metrics.currentCapital,
    initialCapital: metrics.initialCapital,
    totalPnl: metrics.totalPnl,
    totalPnlPercent: metrics.totalPnlPercent,
    winRate: metrics.winRate,
    profitFactor: metrics.profitFactor,
    avgRR: metrics.avgRR,
    avgWin: metrics.avgWin,
    avgLoss: metrics.avgLoss,
    expectancy: metrics.expectancy,
    expectancyR: metrics.expectancyR,
    totalTrades: metrics.totalTrades,
    closedTrades: metrics.closedTrades,
    openTrades: metrics.openTrades,
    pendingTrades: metrics.pendingTrades,
    winCount: metrics.winCount,
    lossCount: metrics.lossCount,
    maxDrawdown: metrics.maxDrawdown,
    maxDrawdownPercent: metrics.maxDrawdownPercent,
    currentStreak: metrics.currentStreak,
    longestWinStreak: metrics.longestWinStreak,
    longestLossStreak: metrics.longestLossStreak,
    bestTrade: metrics.bestTrade,
    worstTrade: metrics.worstTrade,
    openRiskUsd: metrics.openRiskUsd,
    protocolComplianceRate: metrics.protocolComplianceRate,
    equityCurve: metrics.equityCurve,
    drawdownCurve: metrics.equityCurve.map((p) => ({ date: p.date, drawdown: p.drawdown })),
    circuitBreaker: computeCircuitBreaker(allTrades, referenceCapital),
  }
})

export const getRecentClosedTrades = cache(async (limit = 8): Promise<Trade[]> => {
  const trades = await prisma.trade.findMany({
    where: { status: 'CLOSED' },
    orderBy: [{ closedAt: 'desc' }, { datetime: 'desc' }],
    take: limit,
  })
  return trades.map(serializeTrade)
})
