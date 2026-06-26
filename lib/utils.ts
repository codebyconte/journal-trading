import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | null | undefined, currency = 'USD'): string {
  const n = value ?? 0
  if (!isFinite(n)) return '$—'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n)
}

export function formatPercent(value: number | null | undefined, decimals = 2): string {
  const n = value ?? 0
  if (!isFinite(n)) return '—%'
  const formatted = n.toFixed(decimals)
  const sign = n >= 0 ? '+' : ''
  return `${sign}${formatted}%`
}

export function formatR(value: number | null | undefined): string {
  const n = value ?? 0
  if (!isFinite(n)) return '—R'
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}R`
}

export function formatNumber(value: number | null | undefined, decimals = 2): string {
  const n = value ?? 0
  if (!isFinite(n)) return '—'
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n)
}

export function safeNum(value: number | null | undefined, fallback = 0): number {
  if (value == null || !isFinite(value) || isNaN(value)) return fallback
  return value
}

/**
 * Calcule le nombre d'unités pour risquer exactement riskPercent% du capital.
 * LONG: units = (capital * riskPercent/100) / (entryPrice - stopLoss)
 * SHORT: units = (capital * riskPercent/100) / (stopLoss - entryPrice)
 */
export function calculateUnits(
  capital: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number,
  direction: 'LONG' | 'SHORT',
): { units: number; riskAmount: number } {
  const riskAmount = capital * (riskPercent / 100)
  const slDistance = getSlDistance(entryPrice, stopLoss, direction)

  if (slDistance <= 0) return { units: 0, riskAmount }
  const units = riskAmount / slDistance
  return { units, riskAmount }
}

/** Distance absolue entrée → SL (en $ par unité). */
export function getSlDistance(
  entryPrice: number,
  stopLoss: number,
  direction: 'LONG' | 'SHORT',
): number {
  return direction === 'LONG' ? entryPrice - stopLoss : stopLoss - entryPrice
}

/** Distance SL en % du prix d'entrée. */
export function getSlDistancePercent(
  entryPrice: number,
  stopLoss: number,
  direction: 'LONG' | 'SHORT',
): number {
  if (entryPrice <= 0) return 0
  return (getSlDistance(entryPrice, stopLoss, direction) / entryPrice) * 100
}

/** Prix de take profit à N×R (distance SL = 1R). */
export function calculateTakeProfitAtR(
  entryPrice: number,
  stopLoss: number,
  direction: 'LONG' | 'SHORT',
  rMultiple: number,
): number | null {
  const risk = getSlDistance(entryPrice, stopLoss, direction)
  if (risk <= 0 || rMultiple <= 0) return null
  return direction === 'LONG'
    ? entryPrice + risk * rMultiple
    : entryPrice - risk * rMultiple
}

export interface PositionSizing {
  units: number
  riskAmount: number
  slDistance: number
  slDistancePct: number
  notional: number
}

/** Calcule taille, perte max et exposition à partir du risque % (perte max au SL). */
export function calculatePositionSizing(
  capital: number,
  riskPercent: number,
  entryPrice: number,
  stopLoss: number,
  direction: 'LONG' | 'SHORT',
): PositionSizing {
  const { units, riskAmount } = calculateUnits(capital, riskPercent, entryPrice, stopLoss, direction)
  const slDistance = getSlDistance(entryPrice, stopLoss, direction)
  const slDistancePct = getSlDistancePercent(entryPrice, stopLoss, direction)
  const notional = units * entryPrice
  return { units, riskAmount, slDistance, slDistancePct, notional }
}

/**
 * Calcule le Risk/Reward ratio planifié.
 * LONG: RR = (TP - Entry) / (Entry - SL)
 * SHORT: RR = (Entry - TP) / (SL - Entry)
 */
export function calculatePlannedRR(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  direction: 'LONG' | 'SHORT',
): number {
  if (direction === 'LONG') {
    const reward = takeProfit - entryPrice
    const risk = entryPrice - stopLoss
    if (risk <= 0) return 0
    return reward / risk
  } else {
    const reward = entryPrice - takeProfit
    const risk = stopLoss - entryPrice
    if (risk <= 0) return 0
    return reward / risk
  }
}

/** Stop loss dynamique basé sur ATR × multiplicateur (protocole : 1.5). */
export function calculateStopLossFromATR(
  entryPrice: number,
  atr: number,
  direction: 'LONG' | 'SHORT',
  multiplier = 1.5,
): number | null {
  if (!entryPrice || !atr || atr <= 0 || !isFinite(atr)) return null
  const dist = atr * multiplier
  return direction === 'LONG' ? entryPrice - dist : entryPrice + dist
}

/**
 * Calcule le P&L réel à la clôture.
 * LONG: pnl = (exitPrice - entryPrice) * units
 * SHORT: pnl = (entryPrice - exitPrice) * units
 */
export function calculatePnL(
  entryPrice: number,
  exitPrice: number,
  units: number,
  direction: 'LONG' | 'SHORT',
): number {
  if (direction === 'LONG') {
    return (exitPrice - entryPrice) * units
  } else {
    return (entryPrice - exitPrice) * units
  }
}

/**
 * Calcule le R-Multiple : P&L réel / montant risqué initial
 */
export function calculateRMultiple(pnl: number, riskAmount: number): number {
  if (riskAmount === 0) return 0
  return pnl / riskAmount
}

/** Marge de maintenance approximative Hyperliquid (BTC/ETH perp isolé) */
const DEFAULT_MAINTENANCE_MARGIN_RATE = 0.005

/**
 * Estime le prix de liquidation (marge isolée, perp).
 * Formule standard : initial margin = 1/leverage, maintenance ~0.5%.
 */
export function estimateLiquidationPrice(
  entryPrice: number,
  direction: 'LONG' | 'SHORT',
  leverage: number,
  maintenanceMarginRate = DEFAULT_MAINTENANCE_MARGIN_RATE,
): number | null {
  if (entryPrice <= 0 || leverage <= 0) return null
  const imr = 1 / leverage
  if (direction === 'LONG') {
    return entryPrice * (1 - imr + maintenanceMarginRate)
  }
  return entryPrice * (1 + imr - maintenanceMarginRate)
}

/**
 * Protocole : le SL doit être plus proche de l'entrée que la liquidation.
 * Sinon le levier est trop élevé — liquidation avant le SL.
 */
export function isStopLossSaferThanLiquidation(
  entryPrice: number,
  stopLoss: number,
  liquidationPrice: number,
  direction: 'LONG' | 'SHORT',
): boolean {
  const slDistance = Math.abs(entryPrice - stopLoss)
  const liqDistance = Math.abs(entryPrice - liquidationPrice)
  if (slDistance <= 0) return false
  return liqDistance > slDistance
}

export function validateTradePrices(
  entryPrice: number,
  stopLoss: number,
  takeProfit: number,
  direction: 'LONG' | 'SHORT',
): string | null {
  if (direction === 'LONG') {
    if (stopLoss >= entryPrice) return 'LONG : le Stop Loss doit être sous le prix d\'entrée.'
    if (takeProfit > 0 && takeProfit <= entryPrice) return 'LONG : le Take Profit doit être au-dessus du prix d\'entrée.'
  } else {
    if (stopLoss <= entryPrice) return 'SHORT : le Stop Loss doit être au-dessus du prix d\'entrée.'
    if (takeProfit > 0 && takeProfit >= entryPrice) return 'SHORT : le Take Profit doit être sous le prix d\'entrée.'
  }
  return null
}

/**
 * Expectancy = (WinRate * AvgWin) - (LossRate * AvgLoss)
 * Exprimée en R
 */
export function calculateExpectancy(
  winRate: number,
  avgWinR: number,
  avgLossR: number,
): number {
  const lossRate = 1 - winRate / 100
  return (winRate / 100) * avgWinR - lossRate * Math.abs(avgLossR)
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'OPEN':      return 'text-indigo-400'
    case 'CLOSED':    return 'text-zinc-400'
    case 'PENDING':   return 'text-amber-400'
    case 'CANCELLED': return 'text-zinc-500'
    default:          return 'text-zinc-400'
  }
}

export function getPnlColor(value: number | null | undefined): string {
  if (value == null) return 'text-zinc-400'
  if (value > 0) return 'text-emerald-400'
  if (value < 0) return 'text-red-400'
  return 'text-zinc-400'
}

export function getDirectionColor(direction: string): string {
  return direction === 'LONG' ? 'text-emerald-400' : 'text-red-400'
}

export function getEmotionLabel(score: number): string {
  if (score <= 2) return 'Critique'
  if (score <= 4) return 'Dégradé'
  if (score <= 6) return 'Neutre'
  if (score <= 8) return 'Bon'
  return 'Optimal'
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function getDayOfWeek(dateStr: string): string {
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  return days[new Date(dateStr).getDay()]
}
