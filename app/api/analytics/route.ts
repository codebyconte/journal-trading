import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { computeSummary, getConfluenceScore, normalizeEmotionScore } from '@/lib/analytics'

const TRADING_DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'] as const

function dayIndex(date: Date): number {
  const js = date.getDay()
  return js === 0 ? 6 : js - 1
}

export async function GET() {
  try {
    const trades = await prisma.trade.findMany({
      where: { status: 'CLOSED' },
      orderBy: { datetime: 'asc' },
    })

    const summary = computeSummary(trades)
    const riskViolations = trades.filter((t) => t.riskPercent > 1.01).length

    // Performance par actif
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
        avgR: data.rValues.length
          ? data.rValues.reduce((a, b) => a + b, 0) / data.rValues.length
          : 0,
      }))
      .sort((a, b) => b.pnl - a.pnl)

    // Performance par setup
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

    // Performance par jour (Lun → Dim)
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

    // Distribution R-Multiple
    const rDistribution = trades.map((t) => ({
      r: t.rMultiple ?? 0,
      asset: t.asset,
    }))

    // MAE vs MFE
    const maeAnalysis = trades
      .filter((t) => t.mae != null && t.mfe != null)
      .map((t) => ({
        mae: t.mae!,
        mfe: t.mfe!,
        pnl: t.pnl ?? 0,
        r: t.rMultiple ?? 0,
      }))

    // Performance par état émotionnel (normalisé 1-5)
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

    // Performance par confluence (0-6)
    const byConfluence: Record<number, { trades: number; wins: number; pnl: number }> = {}
    for (const t of trades) {
      const score = getConfluenceScore(t)
      if (!byConfluence[score]) byConfluence[score] = { trades: 0, wins: 0, pnl: 0 }
      byConfluence[score].trades++
      if ((t.pnl ?? 0) > 0) byConfluence[score].wins++
      byConfluence[score].pnl += t.pnl ?? 0
    }
    const confluencePerformance = [0, 1, 2, 3, 4, 5, 6]
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

    // Performance par session
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

    // Direction
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

    // Performance mensuelle (6 derniers mois)
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

    return NextResponse.json({
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
    })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
