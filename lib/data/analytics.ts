import { cache } from 'react'
import { prisma } from '@/lib/db'
import { getSettings } from '@/lib/data/settings'
import { computeSummary, getConfluenceScore, normalizeEmotionScore, isTradeProtocolCompliant } from '@/lib/analytics'
import type { TradeDirection } from '@/lib/types'
import type { AnalyticsSummary } from '@/lib/analytics'

const TRADING_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const

function dayIndex(date: Date): number {
  const js = date.getDay()
  return js === 0 ? 6 : js - 1
}

export interface AnalyticsData {
  summary: AnalyticsSummary
  riskViolations: number
  assetPerformance: { asset: string; trades: number; winRate: number; pnl: number; avgR: number }[]
  setupPerformance: { setup: string; trades: number; winRate: number; pnl: number }[]
  dayPerformance: { day: string; trades: number; winRate: number; pnl: number }[]
  rDistribution: { r: number; asset: string }[]
  maeAnalysis: { mae: number; mfe: number; pnl: number; r: number }[]
  emotionPerformance: { score: number; trades: number; winRate: number; pnl: number }[]
  confluencePerformance: { score: number; trades: number; winRate: number; pnl: number }[]
  sessionPerformance: { session: string; trades: number; winRate: number; pnl: number }[]
  monthlyPerformance: { month: string; trades: number; winRate: number; pnl: number }[]
  directionStats: {
    long: { trades: number; wins: number; pnl: number; avgR: number }
    short: { trades: number; wins: number; pnl: number; avgR: number }
  }
}

export const getAnalyticsData = cache(async (): Promise<AnalyticsData> => {
  const [trades, settings] = await Promise.all([
    prisma.trade.findMany({
      where: { status: 'CLOSED' },
      orderBy: { datetime: 'asc' },
    }),
    getSettings(),
  ])

  const baseRiskPercent = settings.riskPercent
  const summary = computeSummary(trades)
  const riskViolations = trades.filter(
    (t) =>
      t.protocolOverride ||
      !isTradeProtocolCompliant(
        {
          ...t,
          asset: t.asset,
          direction: t.direction as TradeDirection,
          marketCondition: t.marketCondition,
          riskPercent: t.riskPercent,
          plannedRR: t.plannedRR,
          emotionScore: t.emotionScore,
          checkBBW: t.checkBBW,
        },
        baseRiskPercent,
      ),
  ).length

  const byAsset: Record<string, { trades: number; wins: number; pnl: number; rValues: number[] }> = {}
  for (const t of trades) {
    if (!byAsset[t.asset]) byAsset[t.asset] = { trades: 0, wins: 0, pnl: 0, rValues: [] }
    byAsset[t.asset].trades++
    if ((t.pnl ?? 0) > 0) byAsset[t.asset].wins++
    byAsset[t.asset].pnl += t.pnl ?? 0
    byAsset[t.asset].rValues.push(t.rMultiple ?? 0)
  }
  const assetPerformance = Object.entries(byAsset)
    .map(([asset, data]) => ({
      asset,
      trades: data.trades,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      pnl: data.pnl,
      avgR: data.rValues.length ? data.rValues.reduce((a, b) => a + b, 0) / data.rValues.length : 0,
    }))
    .sort((a, b) => b.pnl - a.pnl)

  const bySetup: Record<string, { trades: number; wins: number; pnl: number }> = {}
  for (const t of trades) {
    const setup = t.setup || 'Non défini'
    if (!bySetup[setup]) bySetup[setup] = { trades: 0, wins: 0, pnl: 0 }
    bySetup[setup].trades++
    if ((t.pnl ?? 0) > 0) bySetup[setup].wins++
    bySetup[setup].pnl += t.pnl ?? 0
  }
  const setupPerformance = Object.entries(bySetup)
    .map(([setup, data]) => ({
      setup,
      trades: data.trades,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      pnl: data.pnl,
    }))
    .sort((a, b) => b.pnl - a.pnl)

  const byDay: Record<string, { trades: number; wins: number; pnl: number }> = {}
  TRADING_DAYS.forEach((d) => { byDay[d] = { trades: 0, wins: 0, pnl: 0 } })
  for (const t of trades) {
    const day = TRADING_DAYS[dayIndex(new Date(t.datetime))]
    byDay[day].trades++
    if ((t.pnl ?? 0) > 0) byDay[day].wins++
    byDay[day].pnl += t.pnl ?? 0
  }
  const dayPerformance = TRADING_DAYS.map((day) => ({
    day,
    trades: byDay[day].trades,
    winRate: byDay[day].trades > 0 ? (byDay[day].wins / byDay[day].trades) * 100 : 0,
    pnl: byDay[day].pnl,
  }))

  const rDistribution = trades.map((t) => ({ r: t.rMultiple ?? 0, asset: t.asset }))

  const maeAnalysis = trades
    .filter((t) => t.mae != null && t.mfe != null)
    .map((t) => ({
      mae: t.mae!,
      mfe: t.mfe!,
      pnl: t.pnl ?? 0,
      r: t.rMultiple ?? 0,
    }))

  const byEmotion: Record<number, { trades: number; wins: number; pnl: number }> = {}
  for (const t of trades) {
    const score = normalizeEmotionScore(t.emotionScore)
    if (!byEmotion[score]) byEmotion[score] = { trades: 0, wins: 0, pnl: 0 }
    byEmotion[score].trades++
    if ((t.pnl ?? 0) > 0) byEmotion[score].wins++
    byEmotion[score].pnl += t.pnl ?? 0
  }
  const emotionPerformance = [1, 2, 3, 4, 5]
    .map((score) => {
      const data = byEmotion[score] ?? { trades: 0, wins: 0, pnl: 0 }
      return {
        score,
        trades: data.trades,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
        pnl: data.pnl,
      }
    })
    .filter((e) => e.trades > 0)

  const byConfluence: Record<number, { trades: number; wins: number; pnl: number }> = {}
  for (const t of trades) {
    const score = getConfluenceScore(t)
    if (!byConfluence[score]) byConfluence[score] = { trades: 0, wins: 0, pnl: 0 }
    byConfluence[score].trades++
    if ((t.pnl ?? 0) > 0) byConfluence[score].wins++
    byConfluence[score].pnl += t.pnl ?? 0
  }
  const confluencePerformance = [0, 1, 2, 3, 4, 5, 6, 7, 8]
    .map((score) => {
      const data = byConfluence[score] ?? { trades: 0, wins: 0, pnl: 0 }
      return {
        score,
        trades: data.trades,
        winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
        pnl: data.pnl,
      }
    })
    .filter((c) => c.trades > 0)

  const sessionLabels: Record<string, string> = {
    ASIA: 'Asie',
    LONDON: 'Londres',
    NY: 'New York',
    OVERLAP: 'Overlap',
  }
  const bySession: Record<string, { trades: number; wins: number; pnl: number }> = {}
  for (const t of trades) {
    const session = t.sessionTime ? (sessionLabels[t.sessionTime] ?? t.sessionTime) : 'Non renseigné'
    if (!bySession[session]) bySession[session] = { trades: 0, wins: 0, pnl: 0 }
    bySession[session].trades++
    if ((t.pnl ?? 0) > 0) bySession[session].wins++
    bySession[session].pnl += t.pnl ?? 0
  }
  const sessionPerformance = Object.entries(bySession)
    .map(([session, data]) => ({
      session,
      trades: data.trades,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      pnl: data.pnl,
    }))
    .sort((a, b) => b.pnl - a.pnl)

  const longTrades = trades.filter((t) => t.direction === 'LONG')
  const shortTrades = trades.filter((t) => t.direction === 'SHORT')
  const directionStats = {
    long: {
      trades: longTrades.length,
      wins: longTrades.filter((t) => (t.pnl ?? 0) > 0).length,
      pnl: longTrades.reduce((s, t) => s + (t.pnl ?? 0), 0),
      avgR: longTrades.length
        ? longTrades.reduce((s, t) => s + (t.rMultiple ?? 0), 0) / longTrades.length
        : 0,
    },
    short: {
      trades: shortTrades.length,
      wins: shortTrades.filter((t) => (t.pnl ?? 0) > 0).length,
      pnl: shortTrades.reduce((s, t) => s + (t.pnl ?? 0), 0),
      avgR: shortTrades.length
        ? shortTrades.reduce((s, t) => s + (t.rMultiple ?? 0), 0) / shortTrades.length
        : 0,
    },
  }

  const byMonth: Record<string, { trades: number; wins: number; pnl: number }> = {}
  for (const t of trades) {
    const d = new Date(t.closedAt ?? t.datetime)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    if (!byMonth[key]) byMonth[key] = { trades: 0, wins: 0, pnl: 0 }
    byMonth[key].trades++
    if ((t.pnl ?? 0) > 0) byMonth[key].wins++
    byMonth[key].pnl += t.pnl ?? 0
  }
  const monthlyPerformance = Object.entries(byMonth)
    .map(([month, data]) => ({
      month,
      trades: data.trades,
      winRate: data.trades > 0 ? (data.wins / data.trades) * 100 : 0,
      pnl: data.pnl,
    }))
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-8)

  return {
    summary,
    riskViolations,
    assetPerformance,
    setupPerformance,
    dayPerformance,
    rDistribution,
    maeAnalysis,
    emotionPerformance,
    confluencePerformance,
    sessionPerformance,
    monthlyPerformance,
    directionStats,
  }
})
