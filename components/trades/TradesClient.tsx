'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw, Target, TrendingUp, Shield, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { TradeForm } from '@/components/trades/TradeForm'
import { TradeTable } from '@/components/trades/TradeTable'
import { CloseTradeModal } from '@/components/trades/CloseTradeModal'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { getConfluenceScore } from '@/lib/analytics'
import { formatCurrency, cn } from '@/lib/utils'
import { cancelTrade, deleteTrade, openTrade } from '@/app/actions/trades'
import type { Trade, Settings } from '@/lib/types'

interface TradesClientProps {
  trades: Trade[]
  settings: Settings
}

export function TradesClient({ trades, settings }: TradesClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showForm, setShowForm] = useState(false)
  const [tradeToClose, setTradeToClose] = useState<Trade | null>(null)

  const refresh = () => startTransition(() => router.refresh())

  const stats = useMemo(() => {
    const pending = trades.filter((t) => t.status === 'PENDING').length
    const open = trades.filter((t) => t.status === 'OPEN').length
    const closed = trades.filter((t) => t.status === 'CLOSED')
    const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length
    const totalPnl = closed.reduce((s, t) => s + (t.pnl ?? 0), 0)
    const winRate = closed.length > 0 ? (wins / closed.length) * 100 : 0
    const fullProtocol = closed.filter((t) => getConfluenceScore(t) === 6).length
    const protocolRate = closed.length > 0 ? (fullProtocol / closed.length) * 100 : 0
    const atRisk = trades
      .filter((t) => t.status === 'OPEN' || t.status === 'PENDING')
      .reduce((s, t) => s + t.riskAmount, 0)

    return { pending, open, closed: closed.length, wins, totalPnl, winRate, fullProtocol, protocolRate, atRisk }
  }, [trades])

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce trade définitivement ?')) return
    await deleteTrade(id)
    refresh()
  }

  const handleOpen = async (trade: Trade) => {
    await openTrade(trade.id)
    refresh()
  }

  const handleCancel = async (trade: Trade) => {
    if (!confirm('Annuler cet ordre limite ? (Ordre non déclenché)')) return
    await cancelTrade(trade.id)
    refresh()
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Target size={26} className="text-accent" />
            Trades — Protocole Swing 4H
          </h1>
          <p className="text-base text-text-secondary mt-1">
            Ordre Limite · 1% risque · 6 confluences · R/R minimum 1:3
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={refresh}
            disabled={isPending}
            aria-label="Actualiser la liste des trades"
            className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-bg-hover disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} aria-hidden="true" />
            Actualiser
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent/90 transition-all shadow-lg shadow-accent/20"
          >
            <Plus size={18} />
            Nouveau Trade
          </button>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {[
          { label: 'En attente', value: String(stats.pending), color: 'text-neutral' },
          { label: 'Ouverts', value: String(stats.open), color: 'text-accent' },
          { label: 'Clôturés', value: String(stats.closed), color: 'text-text-primary' },
          { label: 'Win Rate', value: stats.closed > 0 ? `${stats.winRate.toFixed(0)}%` : '—', color: stats.winRate >= 45 ? 'text-profit' : 'text-loss' },
          { label: 'P&L clôturé', value: formatCurrency(stats.totalPnl), color: stats.totalPnl >= 0 ? 'text-profit' : 'text-loss' },
          { label: 'Protocole 6/6', value: stats.closed > 0 ? `${stats.protocolRate.toFixed(0)}%` : '—', color: stats.protocolRate >= 70 ? 'text-profit' : 'text-neutral' },
          { label: 'Risque actif', value: formatCurrency(stats.atRisk), color: 'text-loss' },
          { label: 'Capital', value: formatCurrency(settings.currentCapital), color: 'text-text-primary' },
        ].map(({ label, value, color }) => (
          <Card key={label} className="p-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
            <p className={cn('font-mono text-lg font-bold mt-1', color)}>{value}</p>
          </Card>
        ))}
      </div>

      {/* Protocol reminder */}
      <div className="flex flex-col gap-3 rounded-xl border border-accent/25 bg-accent/5 px-5 py-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Shield size={20} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-text-primary">Avant chaque trade — Checklist obligatoire</p>
            <p className="text-sm text-text-secondary mt-0.5">
              Règle Zéro ≥ 3/5 · MTF aligné (W→D→4H) · 6/6 confluences · Ordre Limite · SL+TP simultanés · 3 invalidations
            </p>
          </div>
        </div>
        <Link
          href="/protocol"
          className="flex items-center gap-2 rounded-lg border border-accent/30 bg-bg-card px-4 py-2 text-sm font-semibold text-accent hover:bg-bg-hover transition-colors whitespace-nowrap"
        >
          <BookOpen size={14} />
          Voir le protocole
        </Link>
      </div>

      {/* Table */}
      {trades.length === 0 ? (
        <Card className="py-16 text-center">
          <TrendingUp size={40} className="mx-auto text-text-muted mb-4" />
          <p className="text-lg font-bold text-text-primary">Aucun trade enregistré</p>
          <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
            Commence par enregistrer un setup avec le protocole complet. Chaque trade alimente tes analytics et ton journal.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white hover:bg-accent/90"
          >
            <Plus size={16} />
            Premier Trade
          </button>
        </Card>
      ) : (
        <TradeTable
          trades={trades}
          onClose={setTradeToClose}
          onDelete={handleDelete}
          onOpen={handleOpen}
          onCancel={handleCancel}
        />
      )}

      <Modal
        open={showForm}
        onClose={() => setShowForm(false)}
        title="Nouveau Trade — Protocole Swing 4H"
        size="full"
      >
        <TradeForm
          currentCapital={settings.currentCapital}
          riskPercent={settings.riskPercent}
          onSuccess={() => { setShowForm(false); refresh() }}
        />
      </Modal>

      <CloseTradeModal
        trade={tradeToClose}
        currentCapital={settings.currentCapital}
        onClose={() => setTradeToClose(null)}
        onSuccess={refresh}
      />
    </div>
  )
}
