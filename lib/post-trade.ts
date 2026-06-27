/** Protocole d'analyse post-trade — 5 questions Paul Tudor Jones / Ray Dalio */

export const PTJ_BIASES = [
  'FOMO',
  'Impatience',
  'Surconfiance',
  'Aversion aux pertes',
  'Revenge',
  'Autre',
] as const

export type PTJBias = (typeof PTJ_BIASES)[number]
export type HistoricalImpact = 'yes' | 'no' | 'neutral'
export type RuleDecision = 'adopt' | 'test' | 'reject'

export interface PostTradeAnalysis {
  closeType?: string
  manualReason?: string
  /** Q1 — Setup valide à l'entrée ? */
  setupValid?: boolean | null
  setupInvalidReason?: string
  /** Q2 — Règle violée */
  noRuleViolated?: boolean
  ruleViolated?: string
  psychReason?: string
  bias?: PTJBias | ''
  /** Q3 — Ce que le marché a enseigné */
  missedSignal?: string
  contextChanged?: string
  preventiveTool?: string
  /** Q4 — Nouvelle règle candidate */
  candidateRule?: string
  ruleCondition?: string
  /** Q5 — Validation historique */
  historicalImpact?: HistoricalImpact | ''
  ruleDecision?: RuleDecision | ''
  /** Extras protocole */
  slWasMoved?: boolean | null
  partialTpAt3R?: boolean | null
  trailingExitUsed?: boolean | null
  emotionDuring?: number | null
  emotionCorrelation?: string
  mainLesson?: string
}

export function formatPostTradeNotes(data: PostTradeAnalysis): string {
  const lines: string[] = ['═══ ANALYSE POST-TRADE (PTJ) ═══']

  if (data.closeType) {
    lines.push(
      `Clôture : ${data.closeType}${data.manualReason?.trim() ? ` — ${data.manualReason.trim()}` : ''}`,
    )
  }

  lines.push('')
  lines.push('Q1 · LE SETUP ÉTAIT-IL VALIDE À L\'ENTRÉE ?')
  if (data.setupValid === true) lines.push('[✓] Oui — protocole respecté à 100 %')
  else if (data.setupValid === false) {
    lines.push(`[✗] Non — raison : ${data.setupInvalidReason?.trim() || '—'}`)
  }

  lines.push('')
  lines.push('Q2 · QUELLE RÈGLE AI-JE VIOLÉE ?')
  if (data.noRuleViolated) {
    lines.push('[✓] Aucune — perte statistiquement normale')
  } else if (data.ruleViolated?.trim()) {
    lines.push(`Règle violée : ${data.ruleViolated.trim()}`)
    if (data.psychReason?.trim()) lines.push(`Raison psychologique : ${data.psychReason.trim()}`)
    if (data.bias) lines.push(`Biais : ${data.bias}`)
  }

  lines.push('')
  lines.push('Q3 · CE QUE LE MARCHÉ M\'A APPRIS')
  if (data.missedSignal?.trim()) lines.push(`Signal manqué/ignoré : ${data.missedSignal.trim()}`)
  if (data.contextChanged?.trim()) lines.push(`Contexte changé : ${data.contextChanged.trim()}`)
  if (data.preventiveTool?.trim()) lines.push(`Outil préventif : ${data.preventiveTool.trim()}`)

  lines.push('')
  lines.push('Q4 · NOUVELLE RÈGLE CANDIDATE')
  if (data.candidateRule?.trim()) lines.push(`Règle testable : ${data.candidateRule.trim()}`)
  if (data.ruleCondition?.trim()) lines.push(`Condition : ${data.ruleCondition.trim()}`)

  lines.push('')
  lines.push('Q5 · VALIDATION SUR L\'HISTORIQUE')
  if (data.historicalImpact) lines.push(`Impact 10-20 trades similaires : ${data.historicalImpact}`)
  if (data.ruleDecision) lines.push(`Décision : ${data.ruleDecision.toUpperCase()}`)

  lines.push('')
  lines.push('GESTION & ÉMOTION')
  if (data.slWasMoved != null) lines.push(`SL déplacé (adverse) : ${data.slWasMoved ? 'OUI' : 'NON'}`)
  if (data.partialTpAt3R != null) lines.push(`50% fermé @ 3R : ${data.partialTpAt3R ? 'OUI' : 'NON'}`)
  if (data.trailingExitUsed != null) lines.push(`Trailing EMA 20 (50% restants) : ${data.trailingExitUsed ? 'OUI' : 'NON'}`)
  if (data.emotionDuring != null) lines.push(`État émotionnel pendant le trade : ${data.emotionDuring}/5`)
  if (data.emotionCorrelation?.trim()) lines.push(`Corrélation émotion/résultat : ${data.emotionCorrelation.trim()}`)

  lines.push('')
  lines.push('LEÇON EN UNE PHRASE')
  lines.push(data.mainLesson?.trim() || '—')

  return lines.join('\n')
}

export function hasPostTradeContent(data: PostTradeAnalysis): boolean {
  return !!(
    data.closeType ||
    data.setupValid != null ||
    data.noRuleViolated ||
    data.ruleViolated?.trim() ||
    data.missedSignal?.trim() ||
    data.candidateRule?.trim() ||
    data.historicalImpact ||
    data.mainLesson?.trim() ||
    data.slWasMoved != null ||
    data.partialTpAt3R != null ||
    data.trailingExitUsed != null ||
    data.emotionDuring != null
  )
}

/** Espérance théorique à WR fixe (en R par trade). */
export function expectancyAtWinRate(winRatePct: number, avgWinR: number, avgLossR = 1): number {
  const wr = winRatePct / 100
  return wr * avgWinR - (1 - wr) * avgLossR
}

export const PTJ_EXPECTANCY = {
  winRate: 31,
  at3R: expectancyAtWinRate(31, 3),
  at5R: expectancyAtWinRate(31, 5),
} as const
