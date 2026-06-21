'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, XCircle, BookOpen } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { cn, calculatePnL, calculateRMultiple, formatCurrency, formatR } from '@/lib/utils'
import { getConfluenceScore } from '@/lib/analytics'
import type { Trade } from '@/lib/types'

interface Props {
  trade: Trade | null
  currentCapital: number
  onClose: () => void
  onSuccess: () => void
}

export function CloseTradeModal({ trade, currentCapital, onClose, onSuccess }: Props) {
  const [exitPrice, setExitPrice] = useState('')
  const [mae, setMae] = useState('')
  const [mfe, setMfe] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (trade) {
      setExitPrice('')
      setMae('')
      setMfe('')
      setError(null)
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

  const confScore = getConfluenceScore(trade)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!exit || exit <= 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/trades/${trade.id}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exitPrice: exit, mae: mae || null, mfe: mfe || null }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Erreur clôture')
      }
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

      {/* Quick fill — protocole */}
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
          <label className={labelClass}>Prix de sortie ($) *</label>
          <input
            type="number"
            step="any"
            placeholder="0.00"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            className={cn(
              inputClass,
              previewPnl != null && (isWin ? 'border-profit/50' : 'border-loss/50'),
            )}
            autoFocus
            required
          />
          {(isSL || isTP || isBE) && (
            <p className={cn('mt-1.5 text-xs font-semibold', isTP ? 'text-profit' : isSL ? 'text-loss' : 'text-neutral')}>
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
                Perte {'>'} 1R — SL élargi ou non respecté ? Documente dans le journal.
              </p>
            )}
            {previewR != null && previewR > 0 && previewR < trade.plannedRR * 0.7 && (
              <p className="mt-3 flex items-start gap-2 text-sm text-neutral">
                <AlertTriangle size={14} className="flex-shrink-0 mt-0.5" />
                Sortie prématurée — {formatR(previewR)} sur 1:{trade.plannedRR.toFixed(1)} planifié. As-tu respecté le plan de gestion (+1R breakeven, +1.5R TP partiel) ?
              </p>
            )}
          </div>
        )}

        {/* Post-close reminder */}
        <div className="rounded-xl border border-border bg-bg-surface px-4 py-3">
          <p className="text-xs font-bold uppercase text-text-muted mb-2">Après clôture — protocole</p>
          <ul className="space-y-1 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <CheckCircle2 size={13} className="text-profit flex-shrink-0 mt-0.5" />
              Va sur /journal — remplis les 7 prompts post-session
            </li>
            <li className="flex items-start gap-2">
              <XCircle size={13} className="text-loss flex-shrink-0 mt-0.5" />
              Si perte {'>'} 1R ou 2 pertes consécutives → circuit-breaker
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
          {loading ? 'Clôture en cours...' : 'Confirmer la clôture'}
        </button>
      </form>
    </Modal>
  )
}
