'use client'

import { TrendingUp, TrendingDown, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/catalyst/badge'
import { DirectionIcon } from '@/components/ui/TradingIcons'
import { cn, formatCurrency, formatR } from '@/lib/utils'
import { formatConfluenceScore } from '@/lib/analytics'
import { reviewTrade, type DaySummary } from '@/lib/journal'
import type { Trade } from '@/lib/types'

interface Props {
  trades: Trade[]
  summary: DaySummary
  riskPercent?: number
}

export function DayTradeReview({ trades, summary, riskPercent = 1 }: Props) {
  if (trades.length === 0) {
    return (
      <Card variant="neutral">
        <CardHeader>
          <CardTitle className="text-base normal-case tracking-normal text-white">
            Trades du jour
          </CardTitle>
        </CardHeader>
        <p className="text-sm text-zinc-400">
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
          { label: 'Trades', value: String(summary.total), color: 'text-white' },
          { label: 'W / L', value: `${summary.wins} / ${summary.losses}`, color: summary.wins >= summary.losses ? 'text-emerald-400' : 'text-red-400' },
          { label: 'P&L jour', value: formatCurrency(summary.pnl), color: summary.pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
          { label: 'R moyen', value: formatR(summary.avgR), color: summary.avgR >= 0 ? 'text-emerald-400' : 'text-red-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl bg-zinc-900/80 px-4 py-3 text-center shadow-xs ring-1 ring-white/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
            <p className={cn('mt-1 text-lg font-bold', color)}>{value}</p>
          </div>
        ))}
      </div>

      {/* Détail par trade */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base normal-case tracking-normal text-white">
            Analyse automatique — Ce qui a bien / mal fonctionné
          </CardTitle>
        </CardHeader>
        <div className="space-y-4">
          {trades.map((trade) => {
            const review = reviewTrade(trade, riskPercent)
            const isWin = (trade.pnl ?? 0) > 0
            const isLoss = trade.status === 'CLOSED' && (trade.pnl ?? 0) < 0

            return (
              <div
                key={trade.id}
                className={cn(
                  'rounded-xl p-4 ring-1',
                  isWin && 'ring-emerald-500/25 bg-emerald-500/10',
                  isLoss && 'ring-red-500/25 bg-red-500/10',
                  !isWin && !isLoss && 'ring-white/10 bg-zinc-900/80',
                )}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    <DirectionIcon direction={trade.direction} size={18} />
                    <span className="font-bold text-white">{trade.asset}</span>
                    <span className="text-sm text-zinc-500">{trade.setup ?? 'Setup non renseigné'}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge color="zinc">
                      Confluence {formatConfluenceScore(trade)}
                    </Badge>
                    {trade.status === 'CLOSED' && trade.pnl != null && (
                      <span className={cn('text-sm font-bold', isWin ? 'text-emerald-400' : 'text-red-400')}>
                        {formatCurrency(trade.pnl)} · {formatR(trade.rMultiple ?? 0)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  {review.strengths.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-400">
                        <CheckCircle2 size={13} /> Bonnes conduites
                      </p>
                      {review.strengths.map((s) => (
                        <p key={s} className="text-sm text-zinc-400 pl-5">{s}</p>
                      ))}
                    </div>
                  )}
                  {review.issues.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-400">
                        <XCircle size={13} /> Défauts / écarts
                      </p>
                      {review.issues.map((s) => (
                        <p key={s} className="text-sm text-zinc-400 pl-5">{s}</p>
                      ))}
                    </div>
                  )}
                </div>

                {isLoss && review.issues.length >= 2 && (
                  <div className="mt-3 flex items-start gap-2 rounded-lg ring-1 ring-red-500/30 bg-red-500/10 px-3 py-2">
                    <AlertTriangle size={14} className="text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">
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
