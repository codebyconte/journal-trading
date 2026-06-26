import type { Trade, TradeDirection } from '@/lib/types'

export const CHECK_KEYS = [
  'checkEMA',
  'checkRSI',
  'checkVolume',
  'checkBBW',
  'checkLiquid',
  'checkUnlocks',
  'checkTVL',
  'checkCoinglass',
] as const
export type ConfluenceCheckKey = (typeof CHECK_KEYS)[number]

const NON_CRYPTO_ASSETS = new Set(['SPX', 'QQQ'])

/** R/R minimum protocole (Version Finale Optimisée). */
export const MIN_PLANNED_RR = 3

/** Multiplicateur ATR pour le stop loss dynamique. */
export const ATR_SL_MULTIPLIER = 1.5

/** Coinglass ne s'applique qu'aux crypto perpetuels (pas SPX/QQQ). */
export function isCoinglassApplicable(asset: string): boolean {
  const normalized = asset.toUpperCase().replace(/-PERP$/, '')
  return !NON_CRYPTO_ASSETS.has(normalized)
}

export function getApplicableCheckKeys(asset: string): readonly ConfluenceCheckKey[] {
  if (isCoinglassApplicable(asset)) return CHECK_KEYS
  return CHECK_KEYS.filter((k) => k !== 'checkCoinglass')
}

export function getConfluenceMax(asset: string): number {
  return getApplicableCheckKeys(asset).length
}

export type ConfluenceChecks = Partial<Record<ConfluenceCheckKey, boolean>>
export type ConfluenceTrade = ConfluenceChecks & { asset: string }

export function getConfluenceScore(trade: ConfluenceChecks & { asset?: string }): number {
  const keys = trade.asset ? getApplicableCheckKeys(trade.asset) : CHECK_KEYS
  return keys.filter((k) => trade[k]).length
}

export function isFullConfluence(trade: ConfluenceTrade): boolean {
  return getApplicableCheckKeys(trade.asset).every((k) => !!trade[k])
}

export function formatConfluenceScore(trade: ConfluenceTrade): string {
  return `${getConfluenceScore(trade)}/${getConfluenceMax(trade.asset)}`
}

export type ConfluenceTone = 'full' | 'partial' | 'low'

/** Multiplicateur de risque quand une seule confluence manque. */
export const PARTIAL_RISK_MULTIPLIER = 0.5

/** Minimum confluences pour short en bull market (exception stricte). */
export const BULL_SHORT_MIN_SCORE_OFFSET = 3 // score >= max - 3

export const CONFLUENCE_KEY_LABELS: Record<ConfluenceCheckKey, string> = {
  checkEMA: 'EMA Ribbon + régime',
  checkRSI: 'RSI / Divergence',
  checkVolume: 'Volume Profile',
  checkBBW: 'BBW — tendance active',
  checkLiquid: 'CryptoQuant',
  checkUnlocks: 'Arkham Intel',
  checkTVL: 'Macro / DXY',
  checkCoinglass: 'Coinglass',
}

export type MarketRegime = 'BULL' | 'BEAR' | 'LATERAL' | 'UNKNOWN'

export function normalizeMarketRegime(condition: string | null | undefined): MarketRegime {
  if (!condition) return 'UNKNOWN'
  const c = condition.toUpperCase()
  if (c === 'BULL' || c === 'TREND_UP') return 'BULL'
  if (c === 'BEAR' || c === 'TREND_DOWN') return 'BEAR'
  if (c === 'LATERAL' || c === 'RANGING') return 'LATERAL'
  return 'UNKNOWN'
}

export function getConfluenceTone(trade: ConfluenceTrade): ConfluenceTone {
  const score = getConfluenceScore(trade)
  const max = getConfluenceMax(trade.asset)
  if (score >= max) return 'full'
  if (score >= max - 1) return 'partial'
  return 'low'
}

export function getMissingConfluenceKeys(trade: ConfluenceTrade): ConfluenceCheckKey[] {
  return getApplicableCheckKeys(trade.asset).filter((k) => !trade[k]) as ConfluenceCheckKey[]
}

export interface RiskContext extends ConfluenceTrade {
  direction?: TradeDirection
  marketCondition?: string | null
}

/** Bloque direction vs régime (hors mode journal honnête). */
export function getDirectionRegimeBlock(ctx: RiskContext): string | null {
  const regime = normalizeMarketRegime(ctx.marketCondition)
  const score = getConfluenceScore(ctx)
  const max = getConfluenceMax(ctx.asset)

  if (regime === 'BEAR' && ctx.direction === 'LONG') {
    return 'Long interdit en bear market (R11) — prix sous EMA 200, privilégier les shorts ou cash.'
  }
  if (regime === 'BULL' && ctx.direction === 'SHORT') {
    const minScore = max - BULL_SHORT_MIN_SCORE_OFFSET
    if (score < minScore) {
      return `Short en bull market : minimum ${minScore}/${max} confluences (exception stricte R16).`
    }
  }
  return null
}

/**
 * Risque effectif selon confluence, BBW, régime et direction.
 * `null` = pas de trade.
 */
export function getEffectiveRiskPercent(baseRiskPercent: number, ctx: RiskContext): number | null {
  const regime = normalizeMarketRegime(ctx.marketCondition)
  const score = getConfluenceScore(ctx)
  const max = getConfluenceMax(ctx.asset)

  // Short en bull : minimum confluences avant tout trade
  if (regime === 'BULL' && ctx.direction === 'SHORT' && score < max - BULL_SHORT_MIN_SCORE_OFFSET) {
    return null
  }

  const tone = getConfluenceTone(ctx)
  let risk: number | null
  if (tone === 'full') risk = baseRiskPercent
  else if (tone === 'partial') risk = baseRiskPercent * PARTIAL_RISK_MULTIPLIER
  else return null

  // BBW sous moyenne → max 0.5 % (R5)
  if (!ctx.checkBBW && risk != null) {
    risk = Math.min(risk, baseRiskPercent * PARTIAL_RISK_MULTIPLIER)
  }

  // Marché latéral → max 0.5 % (R5)
  if (regime === 'LATERAL' && risk != null) {
    risk = Math.min(risk, baseRiskPercent * PARTIAL_RISK_MULTIPLIER)
  }

  // Short en bull : max 0.5 % sauf confluence parfaite (8/8 ou 7/7 indices)
  if (regime === 'BULL' && ctx.direction === 'SHORT' && risk != null && tone !== 'full') {
    risk = Math.min(risk, baseRiskPercent * PARTIAL_RISK_MULTIPLIER)
  }

  return risk
}

export type ProtocolViolationType =
  | 'manual_override'
  | 'low_confluence'
  | 'risk_exceeded'
  | 'low_emotion'
  | 'low_rr'
  | 'regime_direction'
  | 'bbw_compression'

export interface ProtocolViolation {
  type: ProtocolViolationType
  label: string
}

export interface ProtocolCheckInput extends ProtocolCheckInputBase {
  protocolOverride?: boolean
}

interface ProtocolCheckInputBase {
  asset: string
  riskPercent: number
  plannedRR: number
  emotionScore?: number | null
  direction?: TradeDirection
  marketCondition?: string | null
  checkEMA?: boolean
  checkRSI?: boolean
  checkVolume?: boolean
  checkBBW?: boolean
  checkLiquid?: boolean
  checkUnlocks?: boolean
  checkTVL?: boolean
  checkCoinglass?: boolean
}

/** Détecte les violations du protocole sur un trade (pour affichage & analytics). */
export function getProtocolViolations(
  trade: ProtocolCheckInput,
  baseRiskPercent = 1,
): ProtocolViolation[] {
  const violations: ProtocolViolation[] = []

  if (trade.protocolOverride) {
    violations.push({
      type: 'manual_override',
      label: 'Enregistré en mode journal honnête (violation assumée)',
    })
    return violations
  }

  const confluenceTrade: ConfluenceTrade = { ...trade, asset: trade.asset }
  const tone = getConfluenceTone(confluenceTrade)
  if (tone === 'low') {
    violations.push({
      type: 'low_confluence',
      label: `Confluence insuffisante (${formatConfluenceScore(confluenceTrade)})`,
    })
  }

  if (!trade.checkBBW) {
    violations.push({
      type: 'bbw_compression',
      label: 'BBW sous moyenne — compression / pas de trend following',
    })
  }

  const regimeBlock = getDirectionRegimeBlock({
    ...confluenceTrade,
    direction: trade.direction,
    marketCondition: trade.marketCondition,
  })
  if (regimeBlock) {
    violations.push({ type: 'regime_direction', label: regimeBlock })
  }

  const expectedRisk = getEffectiveRiskPercent(baseRiskPercent, {
    ...confluenceTrade,
    direction: trade.direction,
    marketCondition: trade.marketCondition,
  })
  if (expectedRisk != null && trade.riskPercent > expectedRisk + 0.05) {
    violations.push({
      type: 'risk_exceeded',
      label: `Risque ${trade.riskPercent.toFixed(2)}% > ${expectedRisk}% autorisé`,
    })
  } else if (trade.riskPercent > baseRiskPercent + 0.05) {
    violations.push({
      type: 'risk_exceeded',
      label: `Risque ${trade.riskPercent.toFixed(2)}% > ${baseRiskPercent}% protocole`,
    })
  }

  const emotion = normalizeEmotionScore(trade.emotionScore)
  if (emotion <= 2) {
    violations.push({
      type: 'low_emotion',
      label: `État émotionnel ${emotion}/5 (minimum 3 recommandé)`,
    })
  }

  if (trade.plannedRR > 0 && trade.plannedRR < MIN_PLANNED_RR) {
    violations.push({
      type: 'low_rr',
      label: `R/R planifié 1:${trade.plannedRR.toFixed(1)} < 1:${MIN_PLANNED_RR} minimum`,
    })
  }

  return violations
}

export function isTradeProtocolCompliant(
  trade: ProtocolCheckInput,
  baseRiskPercent = 1,
): boolean {
  return getProtocolViolations(trade, baseRiskPercent).length === 0
}

/** Score max absolu (crypto avec Coinglass). */
export const CONFLUENCE_MAX = 8

export function normalizeEmotionScore(score: number | null | undefined): number {
  if (score == null) return 4
  if (score <= 5) return score
  return Math.min(5, Math.round(score / 2))
}

export interface AnalyticsSummary {
  totalTrades: number
  winCount: number
  lossCount: number
  winRate: number
  profitFactor: number
  expectancy: number
  avgR: number
  totalPnl: number
  avgWin: number
  avgLoss: number
  grossProfit: number
  grossLoss: number
}

export interface AnalyticsInsight {
  id: string
  type: 'good' | 'bad' | 'neutral'
  title: string
  detail: string
}

export function computeSummary(trades: Pick<Trade, 'pnl' | 'rMultiple'>[]): AnalyticsSummary {
  const wins = trades.filter((t) => (t.pnl ?? 0) > 0)
  const losses = trades.filter((t) => (t.pnl ?? 0) < 0)
  const grossProfit = wins.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0))
  const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0
  const avgWin = wins.length > 0 ? grossProfit / wins.length : 0
  const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? 999 : 0
  const expectancy =
    trades.length > 0 ? (winRate / 100) * avgWin - (1 - winRate / 100) * avgLoss : 0
  const rValues = trades.map((t) => t.rMultiple ?? 0).filter((r) => isFinite(r))
  const avgR = rValues.length ? rValues.reduce((a, b) => a + b, 0) / rValues.length : 0
  const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0)

  return {
    totalTrades: trades.length,
    winCount: wins.length,
    lossCount: losses.length,
    winRate,
    profitFactor: profitFactor === 999 ? Infinity : profitFactor,
    expectancy,
    avgR,
    totalPnl,
    avgWin,
    avgLoss,
    grossProfit,
    grossLoss,
  }
}

export function generateInsights(data: {
  summary: AnalyticsSummary
  confluencePerformance: { score: number; trades: number; winRate: number; pnl: number }[]
  emotionPerformance: { score: number; trades: number; winRate: number; pnl: number }[]
  setupPerformance: { setup: string; trades: number; winRate: number; pnl: number }[]
  assetPerformance: { asset: string; trades: number; winRate: number; pnl: number; avgR: number }[]
  riskViolations: number
}): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = []
  const { summary } = data

  if (summary.totalTrades === 0) {
    return [{
      id: 'no-data',
      type: 'neutral',
      title: 'Pas encore de données',
      detail: 'Ferme tes premiers trades pour débloquer l\'analyse complète.',
    }]
  }

  if (summary.profitFactor >= 1.5 && summary.totalPnl > 0) {
    insights.push({
      id: 'pf-good',
      type: 'good',
      title: 'Profit Factor solide',
      detail: `PF ${summary.profitFactor === Infinity ? '∞' : summary.profitFactor.toFixed(2)} — tes gains compensent nettement tes pertes. Continue la même discipline.`,
    })
  } else if (summary.profitFactor < 1 && summary.totalTrades >= 5) {
    insights.push({
      id: 'pf-bad',
      type: 'bad',
      title: 'Profit Factor < 1',
      detail: 'Tu perds plus que tu gagnes sur la période. Priorité : réduire les trades hors protocole et respecter le SL.',
    })
  }

  if (summary.expectancy > 0) {
    insights.push({
      id: 'expectancy-good',
      type: 'good',
      title: 'Expectancy positive',
      detail: `+${summary.expectancy.toFixed(0)}$ par trade en moyenne — edge statistique confirmé sur ${summary.totalTrades} trades.`,
    })
  } else if (summary.totalTrades >= 10) {
    insights.push({
      id: 'expectancy-bad',
      type: 'bad',
      title: 'Expectancy négative',
      detail: `${summary.expectancy.toFixed(0)}$/trade — le système actuel n\'est pas rentable. Revoir les setups ou la gestion post-entrée.`,
    })
  }

  const fullConf = data.confluencePerformance.find((c) => c.score >= CONFLUENCE_MAX)
  const lowConf = data.confluencePerformance.filter((c) => c.score < CONFLUENCE_MAX && c.trades >= 2)
  if (fullConf && fullConf.trades >= 3) {
    insights.push({
      id: 'confluence-full',
      type: 'good',
      title: `Meilleurs résultats à ${CONFLUENCE_MAX}/${CONFLUENCE_MAX} confluences`,
      detail: `${fullConf.trades} trades avec confluence complète — WR ${fullConf.winRate.toFixed(0)}%, P&L ${fullConf.pnl >= 0 ? '+' : ''}${fullConf.pnl.toFixed(0)}$. Trade uniquement ces setups.`,
    })
  }
  const badLowConf = lowConf.find((c) => c.score <= CONFLUENCE_MAX - 2 && c.pnl < 0)
  if (badLowConf) {
    insights.push({
      id: 'confluence-low',
      type: 'bad',
      title: `Pertes avec confluence ≤ ${badLowConf.score}/${CONFLUENCE_MAX}`,
      detail: `${badLowConf.trades} trades, WR ${badLowConf.winRate.toFixed(0)}%. Le protocole filtre précisément ces situations — ne pas les forcer.`,
    })
  }

  const lowEmotion = data.emotionPerformance.filter((e) => e.score <= 2 && e.trades >= 2)
  if (lowEmotion.length > 0) {
    const avgWr = lowEmotion.reduce((s, e) => s + e.winRate * e.trades, 0) /
      lowEmotion.reduce((s, e) => s + e.trades, 0)
    insights.push({
      id: 'emotion-low',
      type: 'bad',
      title: 'Trades en état émotionnel ≤ 2/5',
      detail: `WR moyen ${avgWr.toFixed(0)}% en état dégradé. Edgewonk : −23% de WR vs état optimal. Appliquer la Règle Zéro.`,
    })
  }

  if (data.riskViolations >= 1) {
    insights.push({
      id: 'risk-violation',
      type: 'bad',
      title: `${data.riskViolations} trade(s) hors protocole`,
      detail: 'Trades avec violations (R/R, confluence, régime, BBW). Analyse pourquoi tu gagnes/perds hors règles.',
    })
  }

  const bestAsset = [...data.assetPerformance].sort((a, b) => b.pnl - a.pnl)[0]
  const worstAsset = [...data.assetPerformance].sort((a, b) => a.pnl - b.pnl)[0]
  if (bestAsset && bestAsset.trades >= 3 && bestAsset.pnl > 0) {
    insights.push({
      id: 'best-asset',
      type: 'good',
      title: `Meilleur actif : ${bestAsset.asset}`,
      detail: `${bestAsset.trades} trades, WR ${bestAsset.winRate.toFixed(0)}%, avg ${bestAsset.avgR >= 0 ? '+' : ''}${bestAsset.avgR.toFixed(2)}R. Concentre-toi sur ce qui fonctionne.`,
    })
  }
  if (worstAsset && worstAsset.trades >= 3 && worstAsset.pnl < 0 && worstAsset.asset !== bestAsset?.asset) {
    insights.push({
      id: 'worst-asset',
      type: 'bad',
      title: `Actif sous-performant : ${worstAsset.asset}`,
      detail: `${worstAsset.trades} trades, P&L ${worstAsset.pnl.toFixed(0)}$. Réduire la taille ou éviter temporairement.`,
    })
  }

  const bestSetup = [...data.setupPerformance].sort((a, b) => b.pnl - a.pnl)[0]
  if (bestSetup && bestSetup.trades >= 3 && bestSetup.pnl > 0) {
    insights.push({
      id: 'best-setup',
      type: 'good',
      title: 'Setup le plus rentable',
      detail: `"${bestSetup.setup}" — ${bestSetup.trades} trades, WR ${bestSetup.winRate.toFixed(0)}%.`,
    })
  }

  if (insights.length === 0) {
    insights.push({
      id: 'continue',
      type: 'neutral',
      title: 'Continue à journaliser',
      detail: `${summary.totalTrades} trades analysés. Plus de données = insights plus précis (minimum 20-30 trades).`,
    })
  }

  return insights.slice(0, 6)
}

export function truncateSetup(name: string, max = 28): string {
  return name.length > max ? `${name.slice(0, max)}…` : name
}
