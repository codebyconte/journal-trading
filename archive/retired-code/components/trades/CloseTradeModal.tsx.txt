'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  AlertTriangle, TrendingUp, TrendingDown, CheckCircle2, XCircle,
  BookOpen, ChevronDown, ChevronUp, Brain, Target,
} from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { Field, Label } from '@/components/catalyst/fieldset'
import { Input } from '@/components/catalyst/input'
import { cn, calculatePnL, calculateRMultiple, calculateTakeProfitAtR, formatCurrency, formatR, parseOptionalFloat } from '@/lib/utils'
import { formatConfluenceScore, getConfluenceTone } from '@/lib/analytics'
import { closeTrade } from '@/app/actions/trades'
import { formatPostTradeNotes, type PostTradeAnalysis } from '@/lib/post-trade'
import { PostTradePTJForm, hasPostTradeContent } from '@/components/trades/PostTradePTJForm'
import type { Trade } from '@/lib/types'

interface Props {
  trade: Trade | null
  currentCapital: number
  onClose: () => void
  onSuccess: () => void
}

type CloseType = 'TP' | 'SL' | 'MANUAL' | ''

const EMPTY_PTJ: PostTradeAnalysis = {}

export function CloseTradeModal({ trade, currentCapital, onClose, onSuccess }: Props) {
  const [exitPrice, setExitPrice] = useState('')
  const [mae, setMae] = useState('')
  const [mfe, setMfe] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPostTrade, setShowPostTrade] = useState(false)
  const [ptj, setPtj] = useState<PostTradeAnalysis>(EMPTY_PTJ)

  useEffect(() => {
    if (trade) {
      setExitPrice('')
      setMae('')
      setMfe('')
      setError(null)
      setShowPostTrade(false)
      setPtj(EMPTY_PTJ)
    }
  }, [trade?.id])

  useEffect(() => {
    if (!trade) return
    const ex = parseFloat(exitPrice)
    if (isNaN(ex) || ex <= 0) return
    const pnl = calculatePnL(trade.entryPrice, ex, trade.units, trade.direction)
    if (pnl < 0) setShowPostTrade(true)
  }, [trade, exitPrice])

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

  const riskDist = Math.abs(trade.entryPrice - trade.stopLoss)
  const tpR = Math.max(3, Math.round(trade.plannedRR))
  const priceAtTargetR =
    calculateTakeProfitAtR(trade.entryPrice, trade.stopLoss, trade.direction, tpR) ??
    (trade.direction === 'LONG' ? trade.entryPrice + tpR * riskDist : trade.entryPrice - tpR * riskDist)

  const autoCloseType: CloseType = isTP ? 'TP' : isSL ? 'SL' : exit > 0 ? 'MANUAL' : ''
  const effectiveCloseType = ptj.closeType || autoCloseType

  const confLabel = formatConfluenceScore(trade)
  const confTone = getConfluenceTone(trade)

  const buildPostTradeNotes = (): string | null => {
    const payload: PostTradeAnalysis = {
      ...ptj,
      closeType: effectiveCloseType || undefined,
    }
    if (!hasPostTradeContent(payload)) return null
    return formatPostTradeNotes(payload)
  }

  const hasPostTradeData = hasPostTradeContent({ ...ptj, closeType: effectiveCloseType || undefined })

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
        parseOptionalFloat(mae),
        parseOptionalFloat(mfe),
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

  const updatePtj = (patch: Partial<PostTradeAnalysis>) => setPtj((prev) => ({ ...prev, ...patch }))

  return (
    <Modal open={!!trade} onClose={onClose} title={`Clôturer — ${trade.asset} ${trade.direction}`} size="lg">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Badge color={confTone === 'full' ? 'lime' : confTone === 'partial' ? 'amber' : 'pink'}>
          Confluence {confLabel}
        </Badge>
        <span className="text-xs text-zinc-500">R/R planifié 1:{trade.plannedRR.toFixed(1)}</span>
        <span className="text-xs text-zinc-500">Perte max {formatCurrency(trade.riskAmount)}</span>
      </div>

      <div className="mb-5 rounded-xl bg-zinc-900/80 p-4 text-sm shadow-xs ring-1 ring-white/10 space-y-2">
        <div className="flex justify-between">
          <span className="text-zinc-500">Entrée</span>
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
      </div>

      <div className="mb-4">
        <p className="text-xs font-bold uppercase tracking-wide text-zinc-500 mb-2">Remplissage rapide</p>
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Stop Loss', price: trade.stopLoss, color: 'red' as const },
            { label: `TP @ ${tpR}R`, price: priceAtTargetR, color: 'emerald' as const },
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
        <Field>
          <Label htmlFor="exit-price">Prix de sortie ($) *</Label>
          <Input
            id="exit-price"
            type="number"
            step="any"
            value={exitPrice}
            onChange={(e) => setExitPrice(e.target.value)}
            required
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field>
            <Label htmlFor="mae">MAE ($)</Label>
            <Input id="mae" type="number" step="any" value={mae} onChange={(e) => setMae(e.target.value)} />
          </Field>
          <Field>
            <Label htmlFor="mfe">MFE ($)</Label>
            <Input id="mfe" type="number" step="any" value={mfe} onChange={(e) => setMfe(e.target.value)} />
          </Field>
        </div>

        {previewPnl != null && (
          <div className={cn('rounded-xl p-4 ring-1', isWin ? 'ring-emerald-500/30 bg-emerald-500/10' : 'ring-red-500/30 bg-red-500/10')}>
            <div className="flex items-center gap-2 mb-2">
              {isWin ? <TrendingUp size={18} className="text-emerald-400" /> : <TrendingDown size={18} className="text-red-400" />}
              <span className={cn('text-sm font-bold', isWin ? 'text-emerald-400' : 'text-red-400')}>
                {isWin ? 'Trade gagnant' : 'Trade perdant — analyse PTJ recommandée'}
                {previewR != null && ` · ${formatR(previewR)}`}
              </span>
            </div>
            <p className="font-mono text-lg font-bold">{formatCurrency(previewPnl)}</p>
          </div>
        )}

        <div className="rounded-xl ring-1 ring-white/10 overflow-hidden">
          <Button
            type="button"
            plain
            onClick={() => setShowPostTrade((v) => !v)}
            className="flex w-full items-center justify-between gap-3 rounded-none px-4 py-3 text-left"
          >
            <div className="flex items-center gap-2">
              <Brain size={16} className="text-indigo-400" />
              <div>
                <p className="text-sm font-bold text-white">Analyse post-trade — 5 questions PTJ</p>
                <p className="text-xs text-zinc-500">Paul Tudor Jones · Ray Dalio · 5 min max</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasPostTradeData && <Badge color="indigo">Rempli</Badge>}
              {showPostTrade ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
            </div>
          </Button>

          {showPostTrade && (
            <div className="border-t border-white/10 bg-zinc-900/50 p-4">
              <PostTradePTJForm
                data={ptj}
                onChange={updatePtj}
                effectiveCloseType={effectiveCloseType}
                isLoss={previewPnl != null ? previewPnl < 0 : false}
              />
            </div>
          )}
        </div>

        <div className="rounded-xl bg-zinc-900/80 px-4 py-3 ring-1 ring-white/10 text-sm text-zinc-400">
          <p className="text-xs font-bold uppercase text-zinc-500 mb-2">Après clôture</p>
          <ul className="space-y-1">
            <li className="flex gap-2"><Target size={13} className="text-indigo-400 mt-0.5" /> Complète l&apos;analyse PTJ ci-dessus</li>
            <li className="flex gap-2"><CheckCircle2 size={13} className="text-emerald-400 mt-0.5" /> Revue mensuelle des pertes sur /journal</li>
            <li className="flex gap-2"><XCircle size={13} className="text-red-400 mt-0.5" /> 2 pertes consécutives → circuit-breaker 48h</li>
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
