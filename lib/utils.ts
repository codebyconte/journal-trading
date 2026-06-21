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
  const slDistance =
    direction === 'LONG'
      ? entryPrice - stopLoss
      : stopLoss - entryPrice

  if (slDistance <= 0) return { units: 0, riskAmount }
  const units = riskAmount / slDistance
  return { units, riskAmount }
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
    case 'OPEN':      return 'text-accent'
    case 'CLOSED':    return 'text-text-secondary'
    case 'PENDING':   return 'text-neutral'
    case 'CANCELLED': return 'text-text-muted'
    default:          return 'text-text-secondary'
  }
}

export function getPnlColor(value: number | null | undefined): string {
  if (value == null) return 'text-text-secondary'
  if (value > 0) return 'text-profit'
  if (value < 0) return 'text-loss'
  return 'text-text-secondary'
}

export function getDirectionColor(direction: string): string {
  return direction === 'LONG' ? 'text-profit' : 'text-loss'
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
