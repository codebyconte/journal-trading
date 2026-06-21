'use client'

import { TrendingUp, TrendingDown, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { DirectionIcon } from '@/components/ui/TradingIcons'
import { cn, formatCurrency, formatR } from '@/lib/utils'
import { reviewTrade, summarizeDay, type DaySummary } from '@/lib/journal'
import type { Trade } from '@/lib/types'

interface Props {
  trades: Trade[]
  summary: DaySummary
}

export function DayTradeReview({ trades, summary }: Props) {
  if (trades.length === 0) {
    return (
      <Card variant="neutral">
        <CardHeader>
          <CardTitle className="text-base normal-case tracking-normal text-text-primary">
            Trades du jour
          </CardTitle>
        </CardHeader>
        <p className="text-sm text-text-secondary">
          Aucun trade enregistré pour cette date. Journée sans exécution — note quand même ton état mental et ce que tu as observé sur le marché.
        </p>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats du jour */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: 'Trades', value: String(summary.total), color: 'text-text-primary' },
          { label: 'W / L', value: `${summary.wins} / ${summary.losses}`, color: summary.wins >= summary.losses ? 'text-profit' : 'text-loss' },
          { label: 'P&L jour', value: formatCurrency(summary.pnl), color: summary.pnl >= 0 ? 'text-profit' : 'text-loss' },
          { label: 'R moyen', value: formatR(summary.avgR), color: summary.avgR >= 0 ? 'text-profit' : 'text-loss' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl border border-border bg-bg-surface px-4 py-3 text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
            <p className={cn('mt-1 text-lg font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Détail par trade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base normal-case tracking-normal text-text-primary">
            Analyse automatique — Ce qui a bien / mal fonctionné
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {trades.map((trade) => {
            const review = reviewTrade(trade)
            const isWin = (trade.pnl ?? 0) > 0
            const isLoss = trade.status === 'CLOSED' && (trade.pnl ?? 0) < 0

            return (
              <div
                key={trade.id}
                className={cn(
                  'rounded-xl border p-4',
                  isWin && 'border-profit/25 bg-profit-dim/30',
                  isLoss && 'border-loss/25 bg-loss-dim/30',
                  !isWin && !isLoss && 'border-border bg-bg-surface',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <DirectionIcon direction={trade.direction} size={18} />
                    <span className="font-bold text-text-primary">{trade.asset}</span>
                    <span className="text-sm text-text-muted">{trade.setup ?? 'Setup non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs rounded-md border border-border px-2 py-0.5 text-text-secondary">
                      Confluence {review.confluenceScore}/6
                    </span>
                    {trade.status === 'CLOSED' && trade.pnl != null && (
                      <span className={cn('text-sm font-bold', isWin ? 'text-profit' : 'text-loss')}>
                        {formatCurrency(trade.pnl)} · {formatR(trade.rMultiple ?? 0)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {review.strengths.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-profit">
                        <CheckCircle2 size={13} /> Bonnes conduites
                      </p>
                      {review.strengths.map((s) => (
                        <p key={s} className="text-sm text-text-secondary pl-5">{s}</p>
                      ))}
                    </div>
                  )}
                  {review.issues.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-loss">
                        <XCircle size={13} /> Défauts / écarts
                      </p>
                      {review.issues.map((s) => (
                        <p key={s} className="text-sm text-text-secondary pl-5">{s}</p>
                      ))}
                    </div>
                  )}
                </div>

                {isLoss && review.issues.length >= 2 && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg border border-loss/30 bg-loss-dim/50 px-3 py-2">
                    <AlertTriangle size={14} className="text-loss flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-loss">
                      Trade perdant avec plusieurs écarts protocole — documente dans les prompts ci-dessous pour éviter la répétition.
                    </p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
