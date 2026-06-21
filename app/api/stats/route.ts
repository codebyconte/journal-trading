import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { computeDashboardMetrics, computeCircuitBreaker } from '@/lib/stats'
import type { DashboardStats } from '@/lib/types'

export async function GET() {
  try {
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

    const referenceCapital =
      metrics.initialCapital + metrics.totalPnl || metrics.currentCapital

    const stats: DashboardStats = {
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

    return NextResponse.json(stats)
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
