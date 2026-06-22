export type TradeDirection = 'LONG' | 'SHORT'
export type TradeOrderType = 'LIMITE' | 'STOP'
export type TradeStatus = 'PENDING' | 'OPEN' | 'CLOSED' | 'CANCELLED'
export type MarketCondition = 'TREND_UP' | 'TREND_DOWN' | 'RANGING' | 'VOLATILE' | 'BREAKOUT'
export type SessionTime = 'ASIA' | 'LONDON' | 'NY' | 'OVERLAP'

export const TRADE_SETUPS = [
  // ─── Setups LONG ───────────────────────────────────────────────────
  'Retest EMA 200 par dessus (Long — setup #1)',
  'Retest EMA 50 par dessus (Long — setup #2)',
  'Retest EMA 100 par dessus (Long)',
  'Retest POC + EMA confluence (Long)',
  'Support Historique + EMA',
  'Breakout Confirmé (volume > 120%)',
  'Divergence RSI Haussière (Long)',
  'Divergence OBV Haussière (Long)',
  'Stop Hunt Haussier — Buy Side',
  'Capitulation Volume (Long)',
  // ─── Setups SHORT ──────────────────────────────────────────────────
  'Retest EMA 200 par dessous (Short — setup #1)',
  'Retest EMA 50 comme résistance (Short — setup #2)',
  'Retest POC + EMA résistance (Short)',
  'Rejet Résistance Majeure (Short)',
  'Cassure Support + Retest résistance (Short)',
  'Divergence RSI Baissière (Short)',
  'Divergence OBV Baissière (Short)',
  'Stop Hunt Baissier — Sell Side',
  // ─── Neutre ────────────────────────────────────────────────────────
  'Autre',
] as const

export const PRESET_ASSETS = [
  'BTC-PERP',
  'ETH-PERP',
  'SOL-PERP',
  'BTC',
  'ETH',
  'SOL',
  'SPX',   // S&P 500
  'QQQ',   // NASDAQ 100
] as const

export const MARKET_CONDITIONS: { value: MarketCondition; label: string }[] = [
  { value: 'TREND_UP',   label: 'Tendance haussière' },
  { value: 'TREND_DOWN', label: 'Tendance baissière' },
  { value: 'RANGING',    label: 'Ranging / Consolidation' },
  { value: 'VOLATILE',   label: 'Haute volatilité' },
  { value: 'BREAKOUT',   label: 'Breakout' },
]

export const SESSION_TIMES: { value: SessionTime; label: string }[] = [
  { value: 'ASIA',    label: 'Asie (00h-09h)' },
  { value: 'LONDON',  label: 'Londres (08h-17h)' },
  { value: 'NY',      label: 'New York (13h-22h)' },
  { value: 'OVERLAP', label: 'Overlap London/NY' },
]

export interface Trade {
  id: string
  createdAt: string
  updatedAt: string
  datetime: string
  asset: string
  direction: TradeDirection
  orderType: TradeOrderType
  entryPrice: number
  stopLoss: number
  takeProfit: number
  units: number
  riskAmount: number
  riskPercent: number
  plannedRR: number
  status: TradeStatus
  exitPrice?: number | null
  pnl?: number | null
  pnlPercent?: number | null
  rMultiple?: number | null
  mae?: number | null
  mfe?: number | null
  checkEMA: boolean
  checkRSI: boolean
  checkVolume: boolean
  checkLiquid: boolean
  checkUnlocks: boolean
  checkTVL: boolean
  checkCoinglass: boolean
  setup?: string | null
  marketCondition?: string | null
  emotionScore?: number | null
  sessionTime?: string | null
  notes?: string | null
  screenshot?: string | null
  openedAt?: string | null
  closedAt?: string | null
}

export interface JournalEntry {
  id: string
  createdAt: string
  updatedAt: string
  date: string
  content: string
  mood?: number | null
}

export interface Settings {
  id: string
  initialCapital: number
  currentCapital: number
  riskPercent: number
  currency: string
}

import type { CircuitBreakerState } from './stats'

export interface DashboardStats {
  currentCapital: number
  initialCapital: number
  totalPnl: number
  totalPnlPercent: number
  winRate: number
  profitFactor: number
  avgRR: number
  avgWin: number
  avgLoss: number
  expectancy: number
  expectancyR?: number
  totalTrades: number
  closedTrades: number
  openTrades: number
  pendingTrades: number
  winCount: number
  lossCount: number
  maxDrawdown: number
  maxDrawdownPercent: number
  currentStreak: number
  longestWinStreak: number
  longestLossStreak: number
  bestTrade: number
  worstTrade: number
  openRiskUsd?: number
  protocolComplianceRate?: number
  equityCurve: EquityPoint[]
  drawdownCurve: DrawdownPoint[]
  circuitBreaker?: CircuitBreakerState
}

export interface EquityPoint {
  date: string
  equity: number
  drawdown: number
  trade?: string
}

export interface DrawdownPoint {
  date: string
  drawdown: number
}

export interface TradeFormData {
  datetime: string
  asset: string
  direction: TradeDirection
  orderType: TradeOrderType
  entryPrice: string
  stopLoss: string
  takeProfit: string
  units: string
  setup: string
  marketCondition: string
  emotionScore: string
  sessionTime: string
  notes: string
  checkEMA: boolean
  checkRSI: boolean
  checkVolume: boolean
  checkLiquid: boolean
  checkUnlocks: boolean
  checkTVL: boolean
  checkCoinglass: boolean
  screenshot?: File | null
}
