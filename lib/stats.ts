/** Sous-ensemble utilisé pour les calculs stats (compatible Prisma + API) */
export interface TradeLike {
  status: string
  pnl?: number | null
  pnlPercent?: number | null
  rMultiple?: number | null
  riskAmount?: number
  datetime: string | Date
  closedAt?: string | Date | null
  asset?: string
  checkEMA?: boolean
  checkRSI?: boolean
  checkVolume?: boolean
  checkLiquid?: boolean
  checkUnlocks?: boolean
  checkTVL?: boolean
  checkCoinglass?: boolean
}

function formatUsd(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`
}

export interface CircuitBreakerState {
  active: boolean
  warning: boolean
  breaches: string[]
  warnings: string[]
  consecutive: number
  pnl7d: number
  pnl30d: number
  pnl7dUsd: number
  pnl30dUsd: number
  worst24hPct: number
  tradesThisWeek: number
  pnlThisWeek: number
}

export interface TradeStatsInput {
  initialCapital: number
  currentCapital: number
}

function getClosedSorted(trades: TradeLike[]): TradeLike[] {
  return trades
    .filter((t) => t.status === 'CLOSED' && t.pnl != null)
    .sort(
      (a, b) =>
        new Date(a.closedAt ?? a.datetime).getTime() -
        new Date(b.closedAt ?? b.datetime).getTime(),
    )
}

function getTradePnlPercent(trade: TradeLike, referenceCapital: number): number {
  if (!referenceCapital) return 0
  if (trade.pnlPercent != null && isFinite(trade.pnlPercent)) {
    return trade.pnlPercent
  }
  return ((trade.pnl ?? 0) / referenceCapital) * 100
}

/** Pertes consécutives depuis le trade le plus récent */
export function getConsecutiveLosses(closedAsc: TradeLike[]): number {
  const desc = [...closedAsc].reverse()
  let count = 0
  for (const t of desc) {
    if ((t.pnl ?? 0) < 0) count++
    else break
  }
  return count
}

/** Circuit-breaker protocole — calculs basés sur le capital de référence */
export function computeCircuitBreaker(
  trades: TradeLike[],
  referenceCapital: number,
): CircuitBreakerState {
  const now = Date.now()
  const ms24h = 86_400_000
  const ms7d = 7 * ms24h
  const ms30d = 30 * ms24h

  const closedAsc = getClosedSorted(trades)
  const closedDesc = [...closedAsc].reverse()

  const inWindow = (t: TradeLike, ms: number) => {
    const ts = new Date(t.closedAt ?? t.datetime).getTime()
    return now - ts < ms
  }

  const t24h = closedDesc.filter((t) => inWindow(t, ms24h))
  const t7d = closedDesc.filter((t) => inWindow(t, ms7d))
  const t30d = closedDesc.filter((t) => inWindow(t, ms30d))

  const pnl7dUsd = t7d.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const pnl30dUsd = t30d.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const pnl7d = referenceCapital > 0 ? (pnl7dUsd / referenceCapital) * 100 : 0
  const pnl30d = referenceCapital > 0 ? (pnl30dUsd / referenceCapital) * 100 : 0

  const pnlPercents24h = t24h.map((t) => getTradePnlPercent(t, referenceCapital))
  const worst24hPct = pnlPercents24h.length ? Math.min(...pnlPercents24h) : 0
  const singleBreach = worst24hPct <= -1.5

  const consecutive = getConsecutiveLosses(closedAsc)
  const breach7d = pnl7d <= -5
  const breach30d = pnl30d <= -10

  const breaches = [
    singleBreach && `Perte ≥ 1.5% sur un trade (24h) : ${worst24hPct.toFixed(2)}% → Arrêt 24h`,
    consecutive >= 3 && `${consecutive} pertes consécutives → Arrêt 1 semaine`,
    consecutive === 2 && `2 pertes consécutives → Arrêt 48h`,
    breach7d && `Rolling 7j : ${pnl7d.toFixed(1)}% (${formatUsd(pnl7dUsd)}) → Arrêt 1 semaine`,
    breach30d && `Rolling 30j : ${pnl30d.toFixed(1)}% (${formatUsd(pnl30dUsd)}) → Arrêt 2 semaines`,
  ].filter(Boolean) as string[]

  const warnings = [
    consecutive === 1 && pnl7d > -5 && `1 perte — reste discipliné, pas de revenge`,
    pnl7d > -5 && pnl7d <= -3 && `Rolling 7j : ${pnl7d.toFixed(1)}% (seuil -5%)`,
    pnl30d > -10 && pnl30d <= -7 && `Rolling 30j : ${pnl30d.toFixed(1)}% (seuil -10%)`,
  ].filter(Boolean) as string[]

  return {
    active: breaches.length > 0,
    warning: breaches.length === 0 && warnings.length > 0,
    breaches,
    warnings: breaches.length === 0 ? warnings : [],
    consecutive,
    pnl7d,
    pnl30d,
    pnl7dUsd,
    pnl30dUsd,
    worst24hPct,
    tradesThisWeek: t7d.length,
    pnlThisWeek: pnl7dUsd,
  }
}

export interface ComputedDashboardMetrics {
  initialCapital: number
  currentCapital: number
  totalPnl: number
  totalPnlPercent: number
  winRate: number
  profitFactor: number
  avgRR: number
  avgWin: number
  avgLoss: number
  expectancy: number
  expectancyR: number
  maxDrawdown: number
  maxDrawdownPercent: number
  currentStreak: number
  longestWinStreak: number
  longestLossStreak: number
  bestTrade: number
  worstTrade: number
  winCount: number
  lossCount: number
  breakevenCount: number
  closedTrades: number
  openTrades: number
  pendingTrades: number
  totalTrades: number
  openRiskUsd: number
  protocolComplianceRate: number
  equityCurve: { date: string; equity: number; drawdown: number; trade?: string }[]
}

const CHECK_KEYS = ['checkEMA', 'checkRSI', 'checkVolume', 'checkLiquid', 'checkUnlocks', 'checkTVL'] as const

function confluenceScore(trade: TradeLike): number {
  return CHECK_KEYS.filter((k) => trade[k]).length
}

export function computeDashboardMetrics(
  allTrades: TradeLike[],
  settings: TradeStatsInput,
): ComputedDashboardMetrics {
  const initialCapital = settings.initialCapital
  const closedTrades = getClosedSorted(allTrades)
  const openTrades = allTrades.filter((t) => t.status === 'OPEN')
  const pendingTrades = allTrades.filter((t) => t.status === 'PENDING')

  let runningCapital = initialCapital
  let peakCapital = initialCapital
  let maxDrawdown = 0
  let maxDrawdownPercent = 0
  const equityCurve: ComputedDashboardMetrics['equityCurve'] = [
    { date: new Date().toISOString().split('T')[0], equity: initialCapital, drawdown: 0 },
  ]

  for (const trade of closedTrades) {
    runningCapital += trade.pnl ?? 0
    if (runningCapital > peakCapital) peakCapital = runningCapital
    const dd = peakCapital - runningCapital
    const ddPct = peakCapital > 0 ? (dd / peakCapital) * 100 : 0
    if (dd > maxDrawdown) maxDrawdown = dd
    if (ddPct > maxDrawdownPercent) maxDrawdownPercent = ddPct
    equityCurve.push({
      date: new Date(trade.closedAt ?? trade.datetime).toISOString().split('T')[0],
      equity: runningCapital,
      drawdown: -ddPct,
      trade: trade.asset,
    })
  }

  const totalPnl = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const computedCapital = initialCapital + totalPnl
  const currentCapital = settings.currentCapital ?? computedCapital

  const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0)
  const losses = closedTrades.filter((t) => (t.pnl ?? 0) < 0)
  const breakeven = closedTrades.filter((t) => (t.pnl ?? 0) === 0)

  const winCount = wins.length
  const lossCount = losses.length
  const winRate = closedTrades.length > 0 ? (winCount / closedTrades.length) * 100 : 0

  const grossProfit = wins.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0))
  const profitFactor =
    grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0

  const avgWin = winCount > 0 ? grossProfit / winCount : 0
  const avgLoss = lossCount > 0 ? grossLoss / lossCount : 0

  const rValues = closedTrades
    .map((t) => t.rMultiple ?? 0)
    .filter((r) => isFinite(r))
  const avgRR = rValues.length > 0 ? rValues.reduce((a, b) => a + b, 0) / rValues.length : 0

  const expectancy =
    closedTrades.length > 0
      ? (winRate / 100) * avgWin - (1 - winRate / 100) * avgLoss
      : 0

  const winRs = wins.map((t) => t.rMultiple ?? 0).filter((r) => isFinite(r))
  const lossRs = losses.map((t) => t.rMultiple ?? 0).filter((r) => isFinite(r))
  const avgWinR = winRs.length ? winRs.reduce((a, b) => a + b, 0) / winRs.length : 0
  const avgLossR = lossRs.length ? Math.abs(lossRs.reduce((a, b) => a + b, 0) / lossRs.length) : 0
  const expectancyR =
    closedTrades.length > 0
      ? (winRate / 100) * avgWinR - (1 - winRate / 100) * avgLossR
      : 0

  let longestWinStreak = 0
  let longestLossStreak = 0
  let tempWin = 0
  let tempLoss = 0

  for (const t of closedTrades) {
    const isWin = (t.pnl ?? 0) > 0
    if (isWin) {
      tempWin++
      tempLoss = 0
      if (tempWin > longestWinStreak) longestWinStreak = tempWin
    } else if ((t.pnl ?? 0) < 0) {
      tempLoss++
      tempWin = 0
      if (tempLoss > longestLossStreak) longestLossStreak = tempLoss
    } else {
      tempWin = 0
      tempLoss = 0
    }
  }

  const consecutiveLosses = getConsecutiveLosses(closedTrades)
  const consecutiveWins = (() => {
    const desc = [...closedTrades].reverse()
    let c = 0
    for (const t of desc) {
      if ((t.pnl ?? 0) > 0) c++
      else break
    }
    return c
  })()

  const currentStreak =
    closedTrades.length === 0
      ? 0
      : consecutiveWins > 0
        ? consecutiveWins
        : consecutiveLosses > 0
          ? -consecutiveLosses
          : 0

  const fullProtocol = closedTrades.filter((t) => confluenceScore(t) === 6).length
  const protocolComplianceRate =
    closedTrades.length > 0 ? (fullProtocol / closedTrades.length) * 100 : 100

  const openRiskUsd = [...openTrades, ...pendingTrades].reduce(
    (s, t) => s + (t.riskAmount ?? 0),
    0,
  )

  const totalPnlPercent = initialCapital > 0 ? (totalPnl / initialCapital) * 100 : 0

  return {
    initialCapital,
    currentCapital,
    totalPnl,
    totalPnlPercent,
    winRate,
    profitFactor,
    avgRR,
    avgWin,
    avgLoss,
    expectancy,
    expectancyR,
    maxDrawdown,
    maxDrawdownPercent,
    currentStreak,
    longestWinStreak,
    longestLossStreak,
    bestTrade: winCount > 0 ? Math.max(...wins.map((t) => t.pnl ?? 0)) : 0,
    worstTrade: lossCount > 0 ? Math.min(...losses.map((t) => t.pnl ?? 0)) : 0,
    winCount,
    lossCount,
    breakevenCount: breakeven.length,
    closedTrades: closedTrades.length,
    openTrades: openTrades.length,
    pendingTrades: pendingTrades.length,
    totalTrades: allTrades.length,
    openRiskUsd,
    protocolComplianceRate,
    equityCurve,
  }
}

export function formatProfitFactor(pf: number): string {
  if (pf === Infinity || pf > 999) return '∞'
  if (!isFinite(pf)) return '—'
  return pf.toFixed(2)
}
