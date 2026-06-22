'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, XCircle,
  BookOpen, ChevronDown, ChevronUp, Brain, Award, Target,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Description, Field, Label } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { Textarea } from '@/components/catalyst/textarea'
import { cn, calculatePnL, calculateRMultiple, formatCurrency, formatR } from '@/lib/utils'
import { formatConfluenceScore, getConfluenceTone } from '@/lib/analytics'
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

  const confLabel = formatConfluenceScore(trade)
  const confTone = getConfluenceTone(trade)

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

  return (
    <Modal open={!!trade} onClose={onClose} title={`Clôturer — ${trade.asset} ${trade.direction}`} size="md">
      {/* Recap protocole */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge color={confTone === 'full' ? 'lime' : confTone === 'partial' ? 'amber' : 'pink'}>
          Confluence {confLabel}
        </Badge>
        <span className="text-xs text-zinc-500">R/R planifié 1:{trade.plannedRR.toFixed(1)}</span>
        <span className="text-xs text-zinc-500">Risque {formatCurrency(trade.riskAmount)}</span>
      </div>

      <div className="mb-5 rounded-xl bg-zinc-900/80 p-4 text-sm shadow-xs ring-1 ring-white/10 space-y-2">
        <div className="flex justify-between">
          <span className="text-zinc-500">Entrée (Limite)</span>
          <span className="font-mono font-semibold text-white">${trade.entryPrice.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Stop Loss</span>
          <span className="font-mono text-red-400">${trade.stopLoss.toFixed(4)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-zinc-500">Take Profit</span>
          <span className="font-mono text-emerald-400">${trade.takeProfit.toFixed(4)}</span>
        </div>
        <div className="flex justify-between border-t border-white/10 pt-2">
          <span className="text-zinc-500">Unités · Setup</span>
          <span className="text-zinc-400 text-right">{trade.units.toFixed(4)} · {trade.setup?.split('(')[0].trim() ?? '—'}</span>
        </div>
      </div>

      {/* Quick fill */}
      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Remplissage rapide</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Stop Loss', price: trade.stopLoss, color: 'red' as const },
            { label: 'Take Profit', price: trade.takeProfit, color: 'emerald' as const },
            { label: 'Breakeven', price: trade.entryPrice, color: undefined },
          ].map(({ label, price, color }) => (
            <Button
              key={label}
              type="button"
              onClick={() => setExitPrice(price.toFixed(4))}
              {...(color ? { color } : { outline: true as const })}
              className="text-xs"
            >
              {label} (${price.toFixed(2)})
            </Button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Field>
            <Label htmlFor="exit-price">Prix de sortie ($) *</Label>
            <Input
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
              required
              aria-describedby={(isSL || isTP || isBE) ? 'exit-hint' : undefined}
            />
          </Field>
          {(isSL || isTP || isBE) && (
            <p id="exit-hint" className={cn('mt-1.5 text-xs font-semibold', isTP ? 'text-emerald-400' : isSL ? 'text-red-400' : 'text-amber-400')}>
              {isSL && 'Sortie au Stop Loss — perte maîtrisée si ≤ 1R'}
              {isTP && 'Sortie au Take Profit — objectif protocole atteint'}
              {isBE && 'Sortie au Breakeven — trade "free" selon plan de gestion'}
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="mae">
              MAE ($){' '}
              <span className="font-normal normal-case text-zinc-500">max adverse</span>
            </Label>
            <Input
              id="mae"
              name="mae"
              type="number"
              step="any"
              placeholder={`Ex: ${trade.riskAmount.toFixed(0)}`}
              value={mae}
              onChange={(e) => setMae(e.target.value)}
            />
          </Field>
          <Field>
            <Label htmlFor="mfe">
              MFE ($){' '}
              <span className="font-normal normal-case text-zinc-500">max favorable</span>
            </Label>
            <Input
              id="mfe"
              name="mfe"
              type="number"
              step="any"
              placeholder="Ex: 800"
              value={mfe}
              onChange={(e) => setMfe(e.target.value)}
            />
          </Field>
        </div>

        {previewPnl != null && (
          <div className={cn(
            'rounded-xl p-4 ring-1',
            isWin ? 'ring-emerald-500/30 bg-emerald-500/10' : 'ring-red-500/30 bg-red-500/10',
          )}>
            <div className="flex items-center gap-2 mb-3">
              {isWin ? <TrendingUp size={18} className="text-emerald-400" /> : <TrendingDown size={18} className="text-red-400" />}
              <span className={cn('text-sm font-bold', isWin ? 'text-emerald-400' : 'text-red-400')}>
                {isWin ? 'Trade gagnant' : 'Trade perdant'}
                {previewR != null && ` · ${formatR(previewR)}`}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-zinc-500">P&L</p>
                <p className={cn('font-mono text-xl font-bold', isWin ? 'text-emerald-400' : 'text-red-400')}>
                  {formatCurrency(previewPnl)}
                </p>
              </div>
              <div>
                <p className="text-zinc-500">Nouveau capital</p>
                <p className="font-mono text-lg font-bold text-white">{formatCurrency(newCapital!)}</p>
              </div>
              <div>
                <p className="text-zinc-500">% capital</p>
                <p className={cn('font-mono font-semibold', isWin ? 'text-emerald-400' : 'text-red-400')}>
                  {previewPct! >= 0 ? '+' : ''}{previewPct!.toFixed(2)}%
                </p>
              </div>
              <div>
                <p className="text-zinc-500">vs planifié</p>
                <p className="font-mono font-semibold text-zinc-400">
                  1:{trade.plannedRR.toFixed(1)} planifié
                </p>
              </div>
            </div>

            {previewR != null && previewR < -1.1 && (
              <p className="mt-3 flex items-start gap-2 text-sm text-red-400">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                Perte {'>'} 1R — SL élargi ou non respecté ? Documente dans la section ci-dessous.
              </p>
            )}
            {previewR != null && previewR > 0 && previewR < trade.plannedRR * 0.7 && (
              <p className="mt-3 flex items-start gap-2 text-sm text-amber-400">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                Sortie prématurée — {formatR(previewR)} sur 1:{trade.plannedRR.toFixed(1)} planifié.
              </p>
            )}
          </div>
        )}

        {/* ── Section post-trade (optionnelle) ── */}
        <div className="rounded-xl ring-1 ring-white/10 overflow-hidden">
          <Button
            type="button"
            plain
            onClick={() => setShowPostTrade((v) => !v)}
            className="flex w-full items-center justify-between gap-3 rounded-none px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-indigo-400" aria-hidden="true" />
              <div>
                <p className="text-sm font-bold text-white">Analyse post-trade</p>
                <p className="text-xs text-zinc-500">
                  {hasPostTradeData ? 'Données saisies — ' : ''}Tout optionnel · Règle des 5 minutes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasPostTradeData && (
                <Badge color="indigo">Rempli</Badge>
              )}
              {showPostTrade ? (
                <ChevronUp size={16} className="text-zinc-500" />
              ) : (
                <ChevronDown size={16} className="text-zinc-500" />
              )}
            </div>
          </Button>

          {showPostTrade && (
            <div className="space-y-5 border-t border-white/10 bg-zinc-900/50 p-4">
              {/* Type de clôture */}
              <Field>
                <Label>Type de clôture</Label>
                <div className="flex flex-wrap gap-2">
                  {([
                    { value: 'TP', label: 'Take Profit atteint', color: 'emerald' as const },
                    { value: 'SL', label: 'Stop Loss atteint', color: 'red' as const },
                    { value: 'MANUAL', label: 'Clôture manuelle', color: 'amber' as const },
                  ] as const).map((opt) => (
                    <Button
                      key={opt.value}
                      type="button"
                      onClick={() => setCloseType(effectiveCloseType === opt.value ? '' : opt.value)}
                      {...(effectiveCloseType === opt.value ? { color: opt.color } : { outline: true as const })}
                      className="text-xs"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
                {effectiveCloseType === 'MANUAL' && (
                  <Input
                    type="text"
                    placeholder="Pourquoi la clôture manuelle ? (ex : cassure structure 4H, signal adverse Arkham…)"
                    value={manualReason}
                    onChange={(e) => setManualReason(e.target.value)}
                  />
                )}
              </Field>

              {/* Protocole respecté */}
              <Field>
                <Label>Toutes les règles du protocole ont été respectées ?</Label>
                <div className="flex gap-2">
                  {[
                    { val: true, label: 'OUI', color: 'emerald' as const },
                    { val: false, label: 'NON', color: 'red' as const },
                  ].map((opt) => (
                    <Button
                      key={String(opt.val)}
                      type="button"
                      onClick={() => setProtocolRespected(protocolRespected === opt.val ? null : opt.val)}
                      {...(protocolRespected === opt.val ? { color: opt.color } : { outline: true as const })}
                      className="flex-1"
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
                {protocolRespected === false && (
                  <Input
                    type="text"
                    placeholder="Quelle règle a été violée ? (ex : entrée avant clôture 4H, SL élargi…)"
                    value={ruleViolated}
                    onChange={(e) => setRuleViolated(e.target.value)}
                  />
                )}
              </Field>

              {/* 2 questions rapides en grille */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field>
                  <Label>Setup valide à l&apos;entrée ?</Label>
                  <Description>Indépendamment du résultat final</Description>
                  <div className="flex gap-2">
                    {[
                      { val: true, label: 'OUI', color: 'emerald' as const },
                      { val: false, label: 'NON', color: 'red' as const },
                    ].map((opt) => (
                      <Button
                        key={String(opt.val)}
                        type="button"
                        onClick={() => setSetupWasValid(setupWasValid === opt.val ? null : opt.val)}
                        {...(setupWasValid === opt.val ? { color: opt.color } : { outline: true as const })}
                        className="flex-1"
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </Field>

                <Field>
                  <Label>SL déplacé dans la direction adverse ?</Label>
                  <Description>Règle d&apos;acier — jamais reculer</Description>
                  <div className="flex gap-2">
                    {[
                      { val: false, label: 'NON ✓', color: 'emerald' as const },
                      { val: true, label: 'OUI ✗', color: 'red' as const },
                    ].map((opt) => (
                      <Button
                        key={String(opt.val)}
                        type="button"
                        onClick={() => setSlWasMoved(slWasMoved === opt.val ? null : opt.val)}
                        {...(slWasMoved === opt.val ? { color: opt.color } : { outline: true as const })}
                        className="flex-1"
                      >
                        {opt.label}
                      </Button>
                    ))}
                  </div>
                </Field>
              </div>

              {/* Leçon principale */}
              <Field>
                <Label className="flex items-center gap-2">
                  <Award size={14} className="text-indigo-400" />
                  Leçon principale (1 phrase)
                </Label>
                <Description>
                  Une seule leçon concrète et actionnable — pas une liste. Quel comportement précis vas-tu changer ?
                </Description>
                <Textarea
                  placeholder="Ex : Demain je ne trade pas si le RSI est > 62 même si l'EMA est validée — deux fois que ça me coûte…"
                  value={mainLesson}
                  onChange={(e) => setMainLesson(e.target.value)}
                  rows={2}
                  resizable={false}
                />
              </Field>

              {/* Alerte contexte */}
              {slWasMoved === true && (
                <div className="flex items-start gap-2 rounded-lg ring-1 ring-red-500/30 bg-red-500/10 px-3 py-2.5 text-sm text-red-400">
                  <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                  SL déplacé → violation de la règle d&apos;acier. Documente dans ton journal et revois le protocole section Gestion du Trade.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Rappel protocole post-clôture */}
        <div className="rounded-xl bg-zinc-900/80 px-4 py-3 shadow-xs ring-1 ring-white/10">
          <p className="text-xs font-bold uppercase text-zinc-500 mb-2">Après clôture — protocole</p>
          <ul className="space-y-1 text-sm text-zinc-400">
            <li className="flex items-start gap-2">
              <Target size={13} className="text-indigo-400 flex-shrink-0 mt-0.5" />
              Complète l&apos;analyse post-trade ci-dessus dans les 5 min
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
              Va sur /journal — remplis les 7 prompts post-session
            </li>
            <li className="flex items-start gap-2">
              <XCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
              Si 2 pertes consécutives ou {'>'} 3% drawdown → circuit-breaker
            </li>
          </ul>
          <Link href="/journal" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:underline">
            <BookOpen size={12} /> Ouvrir le journal
          </Link>
        </div>

        {error && (
          <p className="text-sm text-red-400 flex items-center gap-2">
            <AlertTriangle size={14} /> {error}
          </p>
        )}

        <Button type="submit" disabled={loading || !exitPrice} color="indigo" className="w-full">
          {loading ? 'Clôture en cours…' : 'Confirmer la clôture'}
        </Button>
      </form>
    </Modal>
  )
}
