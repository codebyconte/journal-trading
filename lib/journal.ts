import { isSameDay } from 'date-fns'
import type { Trade } from '@/lib/types'
import { formatCurrency, formatR } from '@/lib/utils'
import {
  getConfluenceMax,
  getConfluenceScore,
  isFullConfluence,
  MIN_PLANNED_RR,
} from '@/lib/analytics'

// ─── Stockage structuré (JSON dans `content`, rétrocompatible) ────────────────

export const JOURNAL_VERSION = 1 as const

export type AuditKey =
  | 'slMovedAdverse'
  | 'fomoEntry'
  | 'revengeTrade'
  | 'protocolSkipped'
  | 'riskExceeded'
  | 'enteredBefore4HClose'
  | 'overMonitoring'

export type PromptId =
  | 'wellDone'
  | 'protocolDeviation'
  | 'emotionImpact'
  | 'riskRespected'
  | 'confluencesReal'
  | 'slMoved'
  | 'mainLesson'

export interface JournalStorage {
  v: typeof JOURNAL_VERSION
  notes: string
  prompts: Partial<Record<PromptId, string>>
  audit: Partial<Record<AuditKey, boolean>>
  /** Réponses libres aux questions de la revue hebdomadaire, indexées par index */
  weeklyReview?: Partial<Record<string, string>>
}

export const EMPTY_JOURNAL: JournalStorage = {
  v: JOURNAL_VERSION,
  notes: '',
  prompts: {},
  audit: {},
  weeklyReview: {},
}

export function parseJournalContent(raw: string | null | undefined): JournalStorage {
  if (!raw?.trim()) return { ...EMPTY_JOURNAL }
  try {
    const parsed = JSON.parse(raw) as JournalStorage
    if (parsed?.v === JOURNAL_VERSION) {
      return {
        v: JOURNAL_VERSION,
        notes: parsed.notes ?? '',
        prompts: parsed.prompts ?? {},
        audit: parsed.audit ?? {},
        weeklyReview: parsed.weeklyReview ?? {},
      }
    }
  } catch {
    // legacy plain text
  }
  return { ...EMPTY_JOURNAL, notes: raw }
}

export function serializeJournalContent(data: JournalStorage): string {
  const hasPrompts = Object.values(data.prompts).some((v) => v?.trim())
  const hasAudit = Object.values(data.audit).some((v) => v === true)
  const hasNotes = data.notes.trim().length > 0
  const hasWeekly = Object.values(data.weeklyReview ?? {}).some((v) => v?.trim())

  if (!hasPrompts && !hasAudit && !hasWeekly && hasNotes) {
    return data.notes
  }
  return JSON.stringify(data)
}

export function getJournalPreview(raw: string | null | undefined): string {
  const data = parseJournalContent(raw)
  const firstPrompt = Object.values(data.prompts).find((v) => v?.trim())
  return firstPrompt ?? data.notes
}

// ─── Prompts post-session ─────────────────────────────────────────────────────

export interface ReflectionPrompt {
  id: PromptId
  category: string
  question: string
  hint: string
  placeholder: string
}

export const POST_SESSION_PROMPTS: ReflectionPrompt[] = [
  {
    id: 'wellDone',
    category: 'Discipline',
    question: 'Qu\'est-ce que j\'ai bien fait aujourd\'hui ?',
    hint: 'Concentre-toi sur le PROCESSUS, pas le résultat. Attendre la clôture 4H, respecter le SL, ne pas trader en état ≤ 2/5 — même une journée perdante peut être excellente sur le plan discipline.',
    placeholder: 'Ex : J\'ai attendu la clôture 4H avant d\'entrer. J\'ai posé SL et TP en même temps. Je n\'ai pas regardé les graphiques entre 10h et 18h...',
  },
  {
    id: 'protocolDeviation',
    category: 'Protocole',
    question: 'Où est-ce que j\'ai dévié du protocole ?',
    hint: 'Compare avec les 7 étapes : Règle Zéro → MTF → Structure → Indicateurs → On-Chain → Macro → Exécution. Une seule étape sautée = déviation à documenter.',
    placeholder: 'Ex : J\'ai entré sans vérifier CryptoQuant (4/7). J\'ai analysé le 4H sans regarder le weekly d\'abord...',
  },
  {
    id: 'emotionImpact',
    category: 'Psychologie',
    question: 'Mon état émotionnel a-t-il influencé mes décisions ?',
    hint: 'Compare ton humeur du jour (Règle Zéro) avec ton score émotionnel à l\'entrée de chaque trade. Une perte récente, de la fatigue ou de l\'euphorie post-gain biaise les décisions.',
    placeholder: 'Ex : Après le SL du matin, j\'ai voulu "récupérer" sur ETH. Mon score était 2/5 mais j\'ai quand même tradé...',
  },
  {
    id: 'riskRespected',
    category: 'Gestion du risque',
    question: 'Ai-je respecté ma gestion du risque (1% max par trade) ?',
    hint: 'Vérifie : taille calculée avec la formule, marge isolée, levier ≤ 5×, prix de liquidation ≥ 2× l\'écart SL. Augmenter la taille après des gains = violation.',
    placeholder: 'Ex : Trade 1 OK à 1%. Trade 2 j\'ai doublé la taille après le gain du matin — erreur de surconfiance...',
  },
  {
    id: 'confluencesReal',
    category: 'Confluences',
    question: 'Les 6 confluences étaient-elles vraiment présentes avant l\'entrée ?',
    hint: 'EMA + RSI + Volume + CryptoQuant 4/7 + Arkham + Macro + Coinglass (Funding Rate / L-S Ratio / Heatmap). Cocher une case sans vérifier = biais de confirmation. Sois honnête : combien étaient réellement validées ?',
    placeholder: 'Ex : J\'ai coché Arkham sans vérifier — en réalité une alerte whale était active. Seulement 5/7 réellement présentes...',
  },
  {
    id: 'slMoved',
    category: 'Exécution',
    question: 'Ai-je déplacé un SL dans la direction adverse ?',
    hint: 'Règle d\'acier : le SL ne recule JAMAIS. Il peut uniquement aller vers le breakeven ou en profit. Si oui → documente pourquoi et quelle émotion t\'a poussé.',
    placeholder: 'Ex : Non, SL respecté sur les 2 trades. / Oui, j\'ai élargi le SL de 1.2% à 2.5% par peur — résultat : -2.1R au lieu de -1R...',
  },
  {
    id: 'mainLesson',
    category: 'Leçon',
    question: 'Quelle est la leçon principale pour la prochaine session ?',
    hint: 'Une seule leçon concrète et actionnable. Pas une liste de 10 points. Quel comportement précis vas-tu changer demain ?',
    placeholder: 'Ex : Demain, je ne trade pas si mon score émotionnel est ≤ 3/5, même si le setup semble parfait...',
  },
]

export interface AuditItem {
  key: AuditKey
  label: string
  severity: 'loss' | 'neutral'
}

export const QUICK_AUDIT_ITEMS: AuditItem[] = [
  { key: 'slMovedAdverse', label: 'SL déplacé dans la direction adverse', severity: 'loss' },
  { key: 'fomoEntry', label: 'Entrée FOMO (mouvement déjà > 5%)', severity: 'loss' },
  { key: 'revengeTrade', label: 'Revenge trading après une perte', severity: 'loss' },
  { key: 'protocolSkipped', label: 'Protocole incomplet (étapes sautées)', severity: 'loss' },
  { key: 'riskExceeded', label: 'Risque > 1% sur au moins un trade', severity: 'loss' },
  { key: 'enteredBefore4HClose', label: 'Entrée avant clôture bougie 4H', severity: 'loss' },
  { key: 'overMonitoring', label: 'Surveillance excessive (> 2 checks/jour)', severity: 'neutral' },
]

export const WEEKLY_PROMPTS = [
  {
    q: 'Ai-je respecté toutes les règles psychologiques cette semaine ?',
    hint: 'Règle Zéro, max 2 checks/jour, pas de revenge, SL d\'acier, taille fixe 1%.',
  },
  {
    q: 'Quel biais s\'est manifesté le plus souvent ?',
    hint: 'Consulte tes audits quotidiens : FOMO, revenge, confirmation, surconfiance, aversion aux pertes ?',
  },
  {
    q: 'Quel était mon état émotionnel moyen lors de mes trades perdants ?',
    hint: 'Compare emotionScore des trades perdants vs humeur journal. Corrélation fréquente = signal d\'alarme.',
  },
  {
    q: 'Quel était mon état émotionnel moyen lors de mes trades gagnants ?',
    hint: 'Les trades gagnants en état ≤ 3/5 peuvent créer une fausse confiance — le WR baisse sur la durée.',
  },
  {
    q: 'Ai-je déplacé un stop loss dans la direction adverse ?',
    hint: 'Compte le nombre de fois cette semaine. 1 fois = alerte. 2+ = revue protocole obligatoire.',
  },
  {
    q: 'Ai-je pris un trade par FOMO (mouvement déjà > 5%) ?',
    hint: 'Entrées tardives = R/R moyen 0.8 — mathématiquement négatif sur 50+ trades.',
  },
  {
    q: 'Mes 3 raisons d\'invalidation étaient-elles pertinentes et honnêtes ?',
    hint: 'Si tu ne trouves pas 3 raisons réelles → analyse insuffisante. Revoir le TradeForm.',
  },
  {
    q: 'Quelle est LA chose à améliorer la semaine prochaine ?',
    hint: 'Une seule amélioration concrète. Ex : "Toujours vérifier weekly avant 4H".',
  },
]

export interface TradeReview {
  trade: Trade
  confluenceScore: number
  strengths: string[]
  issues: string[]
}

export function reviewTrade(trade: Trade): TradeReview {
  const confluenceScore = getConfluenceScore(trade)
  const max = getConfluenceMax(trade.asset)
  const strengths: string[] = []
  const issues: string[] = []

  if (trade.protocolOverride) {
    issues.push(`⚠️ Mode journal honnête — ${trade.overrideReason || 'violation assumée'}`)
  }

  if (isFullConfluence(trade)) strengths.push(`Confluence complète (${confluenceScore}/${max})`)
  else if (confluenceScore >= max - 1) strengths.push(`Confluence partielle (${confluenceScore}/${max})`)
  else issues.push(`Confluence insuffisante (${confluenceScore}/${max}) — protocole non respecté`)

  if (trade.riskPercent <= 1.01) strengths.push(`Risque ${trade.riskPercent.toFixed(1)}% ≤ 1%`)
  else issues.push(`Risque ${trade.riskPercent.toFixed(1)}% > 1% — taille excessive`)

  if (trade.emotionScore != null) {
    if (trade.emotionScore <= 2) issues.push(`Émotion pré-trade ${trade.emotionScore}/5 — ne devrait pas trader`)
    else if (trade.emotionScore >= 4) strengths.push(`État émotionnel solide à l'entrée (${trade.emotionScore}/5)`)
    else issues.push(`Émotion neutre (${trade.emotionScore}/5) — vigilance requise`)
  }

  if (trade.plannedRR >= MIN_PLANNED_RR) strengths.push(`R/R planifié ${trade.plannedRR.toFixed(1)}:1 (≥ 1:${MIN_PLANNED_RR})`)
  else if (trade.plannedRR > 0) issues.push(`R/R planifié faible (${trade.plannedRR.toFixed(1)}:1) — minimum 1:${MIN_PLANNED_RR} requis`)

  if (trade.status === 'CLOSED' && trade.pnl != null) {
    if (trade.pnl >= 0) {
      strengths.push(`Trade gagnant ${formatCurrency(trade.pnl)} (${formatR(trade.rMultiple ?? 0)})`)
    } else {
      if (trade.rMultiple != null && trade.rMultiple >= -1.1) {
        strengths.push('Perte maîtrisée — SL respecté (≤ 1R)')
      } else {
        issues.push(`Perte importante ${formatCurrency(trade.pnl)} (${formatR(trade.rMultiple ?? 0)})`)
      }
    }
  }

  return { trade, confluenceScore, strengths, issues }
}

export function getTradesForDay(trades: Trade[], day: Date): Trade[] {
  return trades.filter((t) => {
    const d = new Date(t.closedAt ?? t.datetime)
    return isSameDay(d, day)
  })
}

export interface DaySummary {
  total: number
  wins: number
  losses: number
  pnl: number
  avgR: number
}

export function summarizeDay(trades: Trade[]): DaySummary {
  const closed = trades.filter((t) => t.status === 'CLOSED' && t.pnl != null)
  const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length
  const losses = closed.filter((t) => (t.pnl ?? 0) <= 0).length
  const pnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0)
  const rValues = closed.map((t) => t.rMultiple ?? 0).filter((r) => isFinite(r))
  const avgR = rValues.length ? rValues.reduce((a, b) => a + b, 0) / rValues.length : 0
  return { total: trades.length, wins, losses, pnl, avgR }
}

export interface BehaviorPattern {
  id: string
  type: 'good' | 'bad' | 'neutral'
  title: string
  detail: string
  count?: number
}

export function detectPatterns(trades: Trade[], entries: { mood?: number | null; content: string }[]): BehaviorPattern[] {
  const patterns: BehaviorPattern[] = []
  const closed = trades.filter((t) => t.status === 'CLOSED')

  if (closed.length === 0) {
    patterns.push({
      id: 'no-trades',
      type: 'neutral',
      title: 'Pas assez de trades fermés',
      detail: 'Ferme au moins 10 trades pour identifier des patterns comportementaux fiables.',
    })
    return patterns
  }

  const losers = closed.filter((t) => (t.pnl ?? 0) < 0)
  const winners = closed.filter((t) => (t.pnl ?? 0) > 0)

  const lowEmotionLosses = losers.filter((t) => (t.emotionScore ?? 5) <= 2).length
  if (lowEmotionLosses >= 2) {
    patterns.push({
      id: 'emotion-losses',
      type: 'bad',
      title: 'Trades perdants en mauvais état émotionnel',
      detail: `${lowEmotionLosses} perte(s) avec émotion ≤ 2/5. Edgewonk : WR -23% en état dégradé.`,
      count: lowEmotionLosses,
    })
  }

  const lowConfluenceLosses = losers.filter((t) => !isFullConfluence(t)).length
  if (lowConfluenceLosses >= 2) {
    patterns.push({
      id: 'confluence-losses',
      type: 'bad',
      title: 'Pertes avec confluence incomplète',
      detail: `${lowConfluenceLosses} perte(s) sans confluence complète. Le protocole existe pour filtrer ces trades.`,
      count: lowConfluenceLosses,
    })
  }

  const riskViolations = closed.filter((t) => t.riskPercent > 1.01).length
  if (riskViolations >= 1) {
    patterns.push({
      id: 'risk-violations',
      type: 'bad',
      title: 'Violations de gestion du risque',
      detail: `${riskViolations} trade(s) avec risque > 1%. Van Tharp : 94% des survivants risquent ≤ 2%.`,
      count: riskViolations,
    })
  }

  const fullConfluenceWins = winners.filter((t) => isFullConfluence(t)).length
  if (fullConfluenceWins >= 2) {
    patterns.push({
      id: 'confluence-wins',
      type: 'good',
      title: 'Gains avec confluence complète',
      detail: `${fullConfluenceWins} gain(s) avec confluence complète. Continue à ne trader que ces setups.`,
      count: fullConfluenceWins,
    })
  }

  const controlledLosses = losers.filter((t) => (t.rMultiple ?? -99) >= -1.1).length
  if (controlledLosses >= 2 && losers.length >= 2) {
    patterns.push({
      id: 'controlled-losses',
      type: 'good',
      title: 'Pertes maîtrisées (SL respecté)',
      detail: `${controlledLosses}/${losers.length} pertes ≤ 1R. Discipline d'exécution solide même en drawdown.`,
      count: controlledLosses,
    })
  }

  const avgWinEmotion = winners.length
    ? winners.reduce((s, t) => s + (t.emotionScore ?? 3), 0) / winners.length
    : null
  const avgLossEmotion = losers.length
    ? losers.reduce((s, t) => s + (t.emotionScore ?? 3), 0) / losers.length
    : null
  if (avgWinEmotion != null && avgLossEmotion != null && avgLossEmotion < avgWinEmotion - 0.5) {
    patterns.push({
      id: 'emotion-gap',
      type: 'bad',
      title: 'Émotion plus basse sur les pertes',
      detail: `Moyenne gagnants ${avgWinEmotion.toFixed(1)}/5 vs perdants ${avgLossEmotion.toFixed(1)}/5. Les pertes arrivent souvent en état dégradé.`,
    })
  }

  const badMoodDays = entries.filter((e) => (e.mood ?? 5) <= 2).length
  if (badMoodDays >= 2) {
    patterns.push({
      id: 'bad-mood-days',
      type: 'neutral',
      title: 'Journées en état critique/dégradé',
      detail: `${badMoodDays} jour(s) noté(s) ≤ 2/5. As-tu respecté la règle "pas de trade" ces jours-là ?`,
      count: badMoodDays,
    })
  }

  if (patterns.length === 0) {
    patterns.push({
      id: 'consistent',
      type: 'good',
      title: 'Discipline globalement cohérente',
      detail: 'Aucun pattern négatif majeur détecté sur la période. Continue le journal quotidien.',
    })
  }

  return patterns
}

export function normalizeMood(mood: number | null | undefined): number {
  if (mood == null) return 4
  if (mood <= 5) return mood
  return Math.min(5, Math.round(mood / 2))
}
