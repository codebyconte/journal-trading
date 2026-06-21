'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, XCircle,
  BookOpen, ChevronDown, ChevronUp, Brain, Award, Target,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn, calculatePnL, calculateRMultiple, formatCurrency, formatR } from '@/lib/utils'
import { getConfluenceScore } from '@/lib/analytics'
import { closeTrade } from '@/app/actions/trades'
import type { Trade } from '@/lib/types'

interface Props {
  trade: Trade | null
  currentCapital: number
  onClose: () => void
  onSuccess: () => void
}

type CloseType = 'TP' | 'SL' | 'MANUAL' | ''

export function CloseTradeModal({ trade, currentCapital, onClose, onSuccess }: Props) {
  const [exitPrice, setExitPrice] = useState('')
  const [mae, setMae] = useState('')
  const [mfe, setMfe] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Section post-trade (tout optionnel)
  const [showPostTrade, setShowPostTrade] = useState(false)
  const [closeType, setCloseType] = useState<CloseType>('')
  const [manualReason, setManualReason] = useState('')
  const [protocolRespected, setProtocolRespected] = useState<boolean | null>(null)
  const [ruleViolated, setRuleViolated] = useState('')
  const [setupWasValid, setSetupWasValid] = useState<boolean | null>(null)
  const [slWasMoved, setSlWasMoved] = useState<boolean | null>(null)
  const [mainLesson, setMainLesson] = useState('')

  useEffect(() => {
    if (trade) {
      setExitPrice('')
      setMae('')
      setMfe('')
      setError(null)
      setShowPostTrade(false)
      setCloseType('')
      setManualReason('')
      setProtocolRespected(null)
      setRuleViolated('')
      setSetupWasValid(null)
      setSlWasMoved(null)
      setMainLesson('')
    }
  }, [trade?.id])

  if (!trade) return null

  const exit = parseFloat(exitPrice)
  const previewPnl =
    !isNaN(exit) && exit > 0
      ? calculatePnL(trade.entryPrice, exit, trade.units, trade.direction)
      : null
  const previewR = previewPnl != null ? calculateRMultiple(previewPnl, trade.riskAmount) : null
  const previewPct = previewPnl != null ? (previewPnl / currentCapital) * 100 : null
  const newCapital = previewPnl != null ? currentCapital + previewPnl : null
  const isWin = (previewPnl ?? 0) > 0
  const isSL = !isNaN(exit) && Math.abs(exit - trade.stopLoss) / trade.stopLoss < 0.002
  const isTP = !isNaN(exit) && Math.abs(exit - trade.takeProfit) / trade.takeProfit < 0.002
  const isBE = !isNaN(exit) && Math.abs(exit - trade.entryPrice) / trade.entryPrice < 0.002

  // Auto-detect close type
  const autoCloseType: CloseType = isTP ? 'TP' : isSL ? 'SL' : exit > 0 ? 'MANUAL' : ''
  const effectiveCloseType = closeType || autoCloseType

  const confScore = getConfluenceScore(trade)

  // Construire les notes post-trade
  const buildPostTradeNotes = (): string | null => {
    const parts: string[] = []
    if (effectiveCloseType) parts.push(`Clôture via : ${effectiveCloseType}${effectiveCloseType === 'MANUAL' && manualReason.trim() ? ` — ${manualReason.trim()}` : ''}`)
    if (protocolRespected !== null) parts.push(`Protocole respecté : ${protocolRespected ? 'OUI' : 'NON'}${!protocolRespected && ruleViolated.trim() ? ` — Règle : ${ruleViolated.trim()}` : ''}`)
    if (setupWasValid !== null) parts.push(`Setup valide à l'entrée : ${setupWasValid ? 'OUI' : 'NON'}`)
    if (slWasMoved !== null) parts.push(`SL déplacé : ${slWasMoved ? 'OUI' : 'NON'}`)
    if (mainLesson.trim()) parts.push(`Leçon : ${mainLesson.trim()}`)
    return parts.length > 0 ? parts.join('\n') : null
  }

  const hasPostTradeData = effectiveCloseType || protocolRespected !== null || setupWasValid !== null || slWasMoved !== null || mainLesson.trim()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exit || exit <= 0) return
    setLoading(true)
    setError(null)
    try {
      const postNotes = buildPostTradeNotes()
      const result = await closeTrade(
        trade.id,
        exit,
        mae ? parseFloat(mae) : null,
        mfe ? parseFloat(mfe) : null,
        postNotes,
      )
      if (!result.success) throw new Error(result.error)
      onSuccess()
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la clôture')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full rounded-lg border border-border bg-bg-surface px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/30'
  const labelClass = 'mb-1.5 block text-sm font-semibold uppercase tracking-wide text-text-secondary'

  return (
    <Modal open={!!trade} onClose={onClose} title={`Clôturer — ${trade.asset} ${trade.direction}`} size="md">
      {/* Recap protocole */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className={cn(
          'rounded-md px-2 py-0.5 text-xs font-bold font-mono',
          confScore === 6 ? 'bg-profit-dim text-profit' : 'bg-loss-dim text-loss',
        )}>
          Confluence {confScore}/6
        </span>
        <span className="text-xs text-text-muted">R/R planifié 1:{trade.plannedRR.toFixed(1)}</span>
        <span className="text-xs text-text-muted">Risque {formatCurrency(trade.riskAmount)}</span>
      </div>

      <div className="mb-5 rounded-xl border border-border bg-bg-surface p-4 text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-text-muted">Entrée (Limite)</span>
          <span className="font-mono font-semibold text-text-primary">${trade.entryPrice.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Stop Loss</span>
          <span className="font-mono text-loss">${trade.stopLoss.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-text-muted">Take Profit</span>
          <span className="font-mono text-profit">${trade.takeProfit.toFixed(4)}</span>
        </div>
        <div className="flex justify-between border-t border-border pt-2">
          <span className="text-text-muted">Unités · Setup</span>
          <span className="text-text-secondary text-right">{trade.units.toFixed(4)} · {trade.setup?.split('(')[0].trim() ?? '—'}</span>
        </div>
      </div>

      {/* Quick fill */}
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wide text-text-muted mb-2">Remplissage rapide</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Stop Loss', price: trade.stopLoss, variant: 'loss' as const },
            { label: 'Take Profit', price: trade.takeProfit, variant: 'profit' as const },
            { label: 'Breakeven', price: trade.entryPrice, variant: 'neutral' as const },
          ].map(({ label, price, variant }) => (
            <button
              key={label}
              type="button"
              onClick={() => setExitPrice(price.toFixed(4))}
              className={cn(
                'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                variant === 'loss' && 'border-loss/40 text-loss hover:bg-loss-dim',
                variant === 'profit' && 'border-profit/40 text-profit hover:bg-profit-dim',
                variant === 'neutral' && 'border-border text-text-secondary hover:bg-bg-hover',
              )}
            >
              {label} (${price.toFixed(2)})
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="exit-price" className={labelClass}>Prix de sortie ($) *</label>
          <input
            id="exit-price"
            name="exitPrice"
            type="number"
            inputMode="decimal"
            autoComplete="off"
            spellCheck={false}
            step="any"
            placeholder="0.00"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            className={cn(
              inputClass,
              previewPnl != null && (isWin ? 'border-profit/50' : 'border-loss/50'),
            )}
            required
            aria-describedby={(isSL || isTP || isBE) ? 'exit-hint' : undefined}
          />
          {(isSL || isTP || isBE) && (
            <p id="exit-hint" className={cn('mt-1.5 text-xs font-semibold', isTP ? 'text-profit' : isSL ? 'text-loss' : 'text-neutral')}>
              {isSL && 'Sortie au Stop Loss — perte maîtrisée si ≤ 1R'}
              {isTP && 'Sortie au Take Profit — objectif protocole atteint'}
              {isBE && 'Sortie au Breakeven — trade "free" selon plan de gestion'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>
              MAE ($) <span className="normal-case font-normal text-text-muted">max adverse</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder={`Ex: ${trade.riskAmount.toFixed(0)}`}
              value={mae}
              onChange={(e) => setMae(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              MFE ($) <span className="normal-case font-normal text-text-muted">max favorable</span>
            </label>
            <input
              type="number"
              step="any"
              placeholder="Ex: 800"
              value={mfe}
              onChange={(e) => setMfe(e.target.value)}
              className={inputClass}
            />
          </div>
        </div>

        {previewPnl != null && (
          <div className={cn(
            'rounded-xl border p-4',
            isWin ? 'border-profit/30 bg-profit-dim' : 'border-loss/30 bg-loss-dim',
          )}>
            <div className="flex items-center gap-2 mb-3">
              {isWin ? <TrendingUp size={18} className="text-profit" /> : <TrendingDown size={18} className="text-loss" />}
              <span className={cn('text-sm font-bold', isWin ? 'text-profit' : 'text-loss')}>
                {isWin ? 'Trade gagnant' : 'Trade perdant'}
                {previewR != null && ` · ${formatR(previewR)}`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-text-muted">P&L</p>
                <p className={cn('font-mono text-xl font-bold', isWin ? 'text-profit' : 'text-loss')}>
                  {formatCurrency(previewPnl)}
                </p>
              </div>
              <div>
                <p className="text-text-muted">Nouveau capital</p>
                <p className="font-mono text-lg font-bold text-text-primary">{formatCurrency(newCapital!)}</p>
              </div>
              <div>
                <p className="text-text-muted">% capital</p>
                <p className={cn('font-mono font-semibold', isWin ? 'text-profit' : 'text-loss')}>
                  {previewPct! >= 0 ? '+' : ''}{previewPct!.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-text-muted">vs planifié</p>
                <p className="font-mono font-semibold text-text-secondary">
                  1:{trade.plannedRR.toFixed(1)} planifié
                </p>
              </div>
            </div>

            {previewR != null && previewR < -1.1 && (
              <p className="mt-3 flex items-start gap-2 text-sm text-loss">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                Perte {'>'} 1R — SL élargi ou non respecté ? Documente dans la section ci-dessous.
              </p>
            )}
            {previewR != null && previewR > 0 && previewR < trade.plannedRR * 0.7 && (
              <p className="mt-3 flex items-start gap-2 text-sm text-neutral">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                Sortie prématurée — {formatR(previewR)} sur 1:{trade.plannedRR.toFixed(1)} planifié.
              </p>
            )}
          </div>
        )}

        {/* ── Section post-trade (optionnelle) ── */}
        <div className="rounded-xl border border-border overflow-hidden">
          <button
            type="button"
            onClick={() => setShowPostTrade((v) => !v)}
            className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-bg-hover transition-colors"
          >
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-accent" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-text-primary">Analyse post-trade</p>
                <p className="text-xs text-text-muted">
                  {hasPostTradeData ? 'Données saisies — ' : ''}Tout optionnel · Règle des 5 minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasPostTradeData && (
                <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                  Rempli
                </span>
              )}
              {showPostTrade ? (
                <ChevronUp size={16} className="text-text-muted" />
              ) : (
                <ChevronDown size={16} className="text-text-muted" />
              )}
            </div>
          </button>

          {showPostTrade && (
            <div className="space-y-5 border-t border-border bg-bg-surface/50 p-4">
              {/* Type de clôture */}
              <div>
                <p className={labelClass}>Type de clôture</p>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'TP', label: 'Take Profit atteint', cls: 'border-profit/40 text-profit hover:bg-profit-dim' },
                    { value: 'SL', label: 'Stop Loss atteint', cls: 'border-loss/40 text-loss hover:bg-loss-dim' },
                    { value: 'MANUAL', label: 'Clôture manuelle', cls: 'border-neutral/40 text-neutral hover:bg-neutral-dim' },
                  ] as const).map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setCloseType(effectiveCloseType === opt.value ? '' : opt.value)}
                      className={cn(
                        'rounded-lg border px-3 py-1.5 text-xs font-semibold transition-all',
                        effectiveCloseType === opt.value ? opt.cls : 'border-border text-text-secondary hover:bg-bg-hover',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {effectiveCloseType === 'MANUAL' && (
                  <input
                    type="text"
                    placeholder="Pourquoi la clôture manuelle ? (ex : cassure structure 4H, signal adverse Arkham…)"
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                    className={cn(inputClass, 'mt-2')}
                  />
                )}
              </div>

              {/* Protocole respecté */}
              <div>
                <p className={labelClass}>Toutes les règles du protocole ont été respectées ?</p>
                <div className="flex gap-2">
                  {[
                    { val: true, label: 'OUI', cls: 'border-profit/40 text-profit hover:bg-profit-dim', active: 'border-profit bg-profit-dim' },
                    { val: false, label: 'NON', cls: 'border-loss/40 text-loss hover:bg-loss-dim', active: 'border-loss bg-loss-dim' },
                  ].map((opt) => (
                    <button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setProtocolRespected(protocolRespected === opt.val ? null : opt.val)}
                      className={cn(
                        'flex-1 rounded-lg border py-2 text-sm font-bold transition-all',
                        protocolRespected === opt.val ? opt.active : 'border-border text-text-secondary hover:bg-bg-hover',
                      )}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {protocolRespected === false && (
                  <input
                    type="text"
                    placeholder="Quelle règle a été violée ? (ex : entrée avant clôture 4H, SL élargi…)"
                    value={ruleViolated}
                    onChange={(e) => setRuleViolated(e.target.value)}
                    className={cn(inputClass, 'mt-2')}
                  />
                )}
              </div>

              {/* 2 questions rapides en grille */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className={labelClass}>Setup valide à l'entrée ?</p>
                  <p className="mb-2 text-xs text-text-muted">Indépendamment du résultat final</p>
                  <div className="flex gap-2">
                    {[
                      { val: true, label: 'OUI', activeClass: 'border-profit/50 bg-profit-dim text-profit' },
                      { val: false, label: 'NON', activeClass: 'border-loss/50 bg-loss-dim text-loss' },
                    ].map((opt) => (
                      <button
                        key={String(opt.val)}
                        type="button"
                        onClick={() => setSetupWasValid(setupWasValid === opt.val ? null : opt.val)}
                        className={cn(
                          'flex-1 rounded-lg border py-2 text-sm font-bold transition-all',
                          setupWasValid === opt.val ? opt.activeClass : 'border-border text-text-secondary hover:bg-bg-hover',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className={labelClass}>SL déplacé dans la direction adverse ?</p>
                  <p className="mb-2 text-xs text-text-muted">Règle d'acier — jamais reculer</p>
                  <div className="flex gap-2">
                    {[
                      { val: false, label: 'NON ✓', activeClass: 'border-profit/50 bg-profit-dim text-profit' },
                      { val: true, label: 'OUI ✗', activeClass: 'border-loss/50 bg-loss-dim text-loss' },
                    ].map((opt) => (
                      <button
                        key={String(opt.val)}
                        type="button"
                        onClick={() => setSlWasMoved(slWasMoved === opt.val ? null : opt.val)}
                        className={cn(
                          'flex-1 rounded-lg border py-2 text-sm font-bold transition-all',
                          slWasMoved === opt.val ? opt.activeClass : 'border-border text-text-secondary hover:bg-bg-hover',
                        )}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Leçon principale */}
              <div>
                <div className="mb-1.5 flex items-center gap-2">
                  <Award size={14} className="text-accent" />
                  <p className={cn(labelClass, 'mb-0')}>Leçon principale (1 phrase)</p>
                </div>
                <p className="mb-2 text-xs text-text-muted">
                  Une seule leçon concrète et actionnable — pas une liste. Quel comportement précis vas-tu changer ?
                </p>
                <textarea
                  placeholder="Ex : Demain je ne trade pas si le RSI est > 62 même si l'EMA est validée — deux fois que ça me coûte…"
                  value={mainLesson}
                  onChange={(e) => setMainLesson(e.target.value)}
                  rows={2}
                  className={cn(inputClass, 'resize-none')}
                />
              </div>

              {/* Alerte contexte */}
              {slWasMoved === true && (
                <div className="flex items-start gap-2 rounded-lg border border-loss/30 bg-loss-dim px-3 py-2.5 text-sm text-loss">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  SL déplacé → violation de la règle d'acier. Documente dans ton journal et revois le protocole section Gestion du Trade.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rappel protocole post-clôture */}
        <div className="rounded-xl border border-border bg-bg-surface px-4 py-3">
          <p className="text-xs font-bold uppercase text-text-muted mb-2">Après clôture — protocole</p>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <Target size={13} className="text-accent flex-shrink-0 mt-0.5" />
              Complète l'analyse post-trade ci-dessus dans les 5 min
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-profit flex-shrink-0 mt-0.5" />
              Va sur /journal — remplis les 7 prompts post-session
            </li>
            <li className="flex items-start gap-2">
              <XCircle size={13} className="text-loss flex-shrink-0 mt-0.5" />
              Si 2 pertes consécutives ou {'>'} 3% drawdown → circuit-breaker
            </li>
          </ul>
          <Link href="/journal" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-accent hover:underline">
            <BookOpen size={12} /> Ouvrir le journal
          </Link>
        </div>

        {error && (
          <p className="text-sm text-loss flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !exitPrice}
          className="w-full rounded-xl bg-accent py-3 text-sm font-bold text-white transition-all hover:bg-accent/90 disabled:opacity-50"
        >
          {loading ? 'Clôture en cours…' : 'Confirmer la clôture'}
        </button>
      </form>
    </Modal>
  )
}
