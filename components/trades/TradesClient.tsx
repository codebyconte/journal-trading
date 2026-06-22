'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw, Target, TrendingUp, Shield, BookOpen } from 'lucide-react'
import { TradeForm } from '@/components/trades/TradeForm'
import { PageShell } from '@/components/ui/PageShell'
import { TradeTable } from '@/components/trades/TradeTable'
import { CloseTradeModal } from '@/components/trades/CloseTradeModal'
import { Modal } from '@/components/ui/Modal'
import { Card } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { KpiGrid, CalloutBanner } from '@/components/ui/SystemState'
import { Button } from '@/components/catalyst/button'
import { isFullConfluence } from '@/lib/analytics'
import { formatCurrency } from '@/lib/utils'
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
    const fullProtocol = closed.filter((t) => isFullConfluence(t)).length
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
    <PageShell>
      <PageHeader
        title="Trades — Protocole Swing 4H"
        description="Ordre Limite · 1% risque · 7 confluences · R/R minimum 1:3"
        icon={<Target data-slot="icon" className="size-7 text-indigo-400" aria-hidden="true" />}
        actions={
          <>
            <Button outline onClick={refresh} disabled={isPending} aria-label="Actualiser la liste des trades">
              <RefreshCw data-slot="icon" className={isPending ? 'animate-spin' : ''} aria-hidden="true" />
              Actualiser
            </Button>
            <Button color="indigo" onClick={() => setShowForm(true)}>
              <Plus data-slot="icon" className="size-4" aria-hidden="true" />
              Nouveau Trade
            </Button>
          </>
        }
      />

      <KpiGrid
        items={[
          { label: 'En attente', value: String(stats.pending), tone: 'neutral' },
          { label: 'Ouverts', value: String(stats.open), tone: 'accent' },
          { label: 'Clôturés', value: String(stats.closed), tone: 'default' },
          {
            label: 'Win Rate',
            value: stats.closed > 0 ? `${stats.winRate.toFixed(0)}%` : '—',
            tone: stats.closed > 0 ? (stats.winRate >= 45 ? 'profit' : 'loss') : 'default',
          },
          {
            label: 'P&L clôturé',
            value: formatCurrency(stats.totalPnl),
            tone: stats.totalPnl >= 0 ? 'profit' : 'loss',
          },
          {
            label: 'Protocole 7/7',
            value: stats.closed > 0 ? `${stats.protocolRate.toFixed(0)}%` : '—',
            tone: stats.closed > 0 ? (stats.protocolRate >= 70 ? 'profit' : 'neutral') : 'default',
          },
          { label: 'Risque actif', value: formatCurrency(stats.atRisk), tone: 'loss' },
          { label: 'Capital', value: formatCurrency(settings.currentCapital), tone: 'default' },
        ]}
      />

      <CalloutBanner
        tone="indigo"
        icon={<Shield data-slot="icon" className="size-5 text-indigo-400" aria-hidden="true" />}
        title="Avant chaque trade — Checklist obligatoire"
      >
        Règle Zéro ≥ 3/5 · MTF aligné (W→D→4H) · 7/7 confluences · Ordre Limite · SL+TP simultanés · 3 invalidations
        <div className="mt-3">
          <Button href="/protocol" outline>
            <BookOpen data-slot="icon" className="size-4" aria-hidden="true" />
            Voir le protocole
          </Button>
        </div>
      </CalloutBanner>

      {/* Table */}
      {trades.length === 0 ? (
        <Card className="py-16 text-center">
          <TrendingUp size={40} className="mx-auto mb-4 text-zinc-500" />
          <p className="text-lg font-bold text-white">Aucun trade enregistré</p>
          <p className="mt-2 max-w-md mx-auto text-sm text-zinc-400">
            Commence par enregistrer un setup avec le protocole complet. Chaque trade alimente tes analytics et ton journal.
          </p>
          <Button color="indigo" onClick={() => setShowForm(true)} className="mt-6">
            <Plus data-slot="icon" className="size-4" aria-hidden="true" />
            Premier Trade
          </Button>
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
        showClose={false}
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
    </PageShell>
  )
}
