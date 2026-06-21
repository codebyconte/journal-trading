'use client'

import { Fragment, useMemo, useState } from 'react'
import Image from 'next/image'
import {
  ChevronDown, ChevronUp, ExternalLink, Trash2, DoorOpen, XCircle,
  CheckCircle2, AlertTriangle,
} from 'lucide-react'
import { ChecklistIcon, MoodIcon } from '@/components/ui/TradingIcons'
import { cn, formatCurrency, formatDateTime, formatR } from '@/lib/utils'
import { DirectionBadge, StatusBadge } from '@/components/ui/Badge'
import { getConfluenceScore } from '@/lib/analytics'
import { reviewTrade } from '@/lib/journal'
import { MARKET_CONDITIONS, PRESET_ASSETS, type Trade, type TradeStatus } from '@/lib/types'

interface Props {
  trades: Trade[]
  onClose: (trade: Trade) => void
  onDelete: (id: string) => void
  onOpen: (trade: Trade) => void
  onCancel: (trade: Trade) => void
}

const STATUS_FILTERS: { value: TradeStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'Tous' },
  { value: 'PENDING', label: 'En attente' },
  { value: 'OPEN', label: 'Ouverts' },
  { value: 'CLOSED', label: 'Clôturés' },
  { value: 'CANCELLED', label: 'Annulés' },
]

const CONFLUENCE_LABELS = [
  { key: 'checkEMA', label: 'EMA Ribbon' },
  { key: 'checkRSI', label: 'RSI / Divergence' },
  { key: 'checkVolume', label: 'Volume Profile' },
  { key: 'checkLiquid', label: 'CryptoQuant 4/7' },
  { key: 'checkUnlocks', label: 'Arkham Intel' },
  { key: 'checkTVL', label: 'Macro / DXY' },
] as const

function normalizeEmotion(score: number | null | undefined): number {
  if (score == null) return 0
  return score <= 5 ? score : Math.min(5, Math.round(score / 2))
}

function marketLabel(value: string | null | undefined): string {
  if (!value) return '—'
  return MARKET_CONDITIONS.find((m) => m.value === value)?.label ?? value
}

export function TradeTable({ trades, onClose, onDelete, onOpen, onCancel }: Props) {
  const [statusFilter, setStatusFilter] = useState<TradeStatus | 'ALL'>('ALL')
  const [assetFilter, setAssetFilter] = useState<string>('ALL')
  const [directionFilter, setDirectionFilter] = useState<'ALL' | 'LONG' | 'SHORT'>('ALL')
  const [sortField, setSortField] = useState<keyof Trade>('datetime')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const assetsInUse = useMemo(() => {
    const set = new Set(trades.map((t) => t.asset))
    return PRESET_ASSETS.filter((a) => set.has(a))
  }, [trades])

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('desc') }
  }

  const filtered = useMemo(() => {
    return trades
      .filter((t) => statusFilter === 'ALL' || t.status === statusFilter)
      .filter((t) => assetFilter === 'ALL' || t.asset === assetFilter)
      .filter((t) => directionFilter === 'ALL' || t.direction === directionFilter)
      .sort((a, b) => {
        const av = a[sortField] as string | number | null
        const bv = b[sortField] as string | number | null
        const aVal = av ?? ''
        const bVal = bv ?? ''
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return sortDir === 'asc' ? cmp : -cmp
      })
  }, [trades, statusFilter, assetFilter, directionFilter, sortField, sortDir])

  const SortIcon = ({ field }: { field: keyof Trade }) => {
    if (sortField !== field) return null
    return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  const thClass = 'cursor-pointer select-none whitespace-nowrap px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted hover:text-text-secondary transition-colors'

  return (
    <div>
      {/* Filtres statut */}
      <div className="mb-3 flex flex-wrap gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-semibold transition-all',
              statusFilter === f.value
                ? 'bg-accent text-white'
                : 'border border-border text-text-secondary hover:border-border-strong hover:text-text-primary',
            )}
          >
            {f.label}
            <span className="ml-1.5 opacity-70">
              ({f.value === 'ALL' ? trades.length : trades.filter((t) => t.status === f.value).length})
            </span>
          </button>
        ))}
      </div>

      {/* Filtres actif + direction */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => setAssetFilter('ALL')}
            className={cn(
              'rounded-md px-2.5 py-1 text-xs font-semibold transition-all',
              assetFilter === 'ALL' ? 'bg-bg-elevated text-text-primary' : 'text-text-muted hover:text-text-secondary',
            )}
          >
            Tous actifs
          </button>
          {assetsInUse.map((a) => (
            <button
              key={a}
              onClick={() => setAssetFilter(a)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-mono font-semibold transition-all',
                assetFilter === a ? 'bg-accent text-white' : 'border border-border text-text-muted hover:border-accent/40',
              )}
            >
              {a}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-border hidden sm:block" />
        <div className="flex gap-1.5">
          {(['ALL', 'LONG', 'SHORT'] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDirectionFilter(d)}
              className={cn(
                'rounded-md px-2.5 py-1 text-xs font-semibold transition-all',
                directionFilter === d
                  ? d === 'LONG' ? 'bg-profit-dim text-profit' : d === 'SHORT' ? 'bg-loss-dim text-loss' : 'bg-accent text-white'
                  : 'border border-border text-text-muted hover:text-text-secondary',
              )}
            >
              {d === 'ALL' ? 'Toutes dirs' : d}
            </button>
          ))}
        </div>
        <span className="text-xs text-text-muted ml-auto">{filtered.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-bg-surface">
            <tr>
              <th className={thClass} onClick={() => handleSort('datetime')}>
                <span className="flex items-center gap-1">Date <SortIcon field="datetime" /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('asset')}>
                <span className="flex items-center gap-1">Actif <SortIcon field="asset" /></span>
              </th>
              <th className={thClass}>Dir.</th>
              <th className={thClass}>Conf.</th>
              <th className={thClass} onClick={() => handleSort('entryPrice')}>
                <span className="flex items-center gap-1">Entrée <SortIcon field="entryPrice" /></span>
              </th>
              <th className={thClass}>SL / TP</th>
              <th className={thClass} onClick={() => handleSort('plannedRR')}>
                <span className="flex items-center gap-1">R/R <SortIcon field="plannedRR" /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('pnl')}>
                <span className="flex items-center gap-1">P&L <SortIcon field="pnl" /></span>
              </th>
              <th className={thClass} onClick={() => handleSort('rMultiple')}>
                <span className="flex items-center gap-1">R <SortIcon field="rMultiple" /></span>
              </th>
              <th className={thClass}>Statut</th>
              <th className="px-3 py-3 text-left text-xs font-bold uppercase tracking-wider text-text-muted">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="py-12 text-center text-sm text-text-muted">
                  Aucun trade ne correspond aux filtres
                </td>
              </tr>
            )}
            {filtered.map((trade) => {
              const confScore = getConfluenceScore(trade)
              const review = reviewTrade(trade)
              const emotion = normalizeEmotion(trade.emotionScore)
              const isExpanded = expandedId === trade.id

              return (
                <Fragment key={trade.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : trade.id)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-bg-hover',
                      isExpanded && 'bg-bg-elevated',
                    )}
                  >
                    <td className="px-3 py-3 font-mono text-xs text-text-secondary whitespace-nowrap">
                      {formatDateTime(trade.datetime)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-mono font-bold text-text-primary">{trade.asset}</span>
                      {trade.setup && (
                        <p className="text-xs text-text-muted mt-0.5 truncate max-w-[120px]">{trade.setup.split('(')[0].trim()}</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <DirectionBadge direction={trade.direction} />
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn(
                        'inline-flex rounded-md px-2 py-0.5 text-xs font-bold font-mono',
                        confScore === 6 ? 'bg-profit-dim text-profit' : confScore >= 4 ? 'bg-neutral-dim text-neutral' : 'bg-loss-dim text-loss',
                      )}>
                        {confScore}/6
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-text-primary">
                      ${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
                      <span className="text-loss">${trade.stopLoss.toFixed(2)}</span>
                      <span className="mx-1 text-text-muted">/</span>
                      <span className="text-profit">${trade.takeProfit.toFixed(2)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn(
                        'font-mono font-semibold',
                        trade.plannedRR >= 3 ? 'text-profit' : trade.plannedRR >= 2 ? 'text-neutral' : 'text-loss',
                      )}>
                        1:{trade.plannedRR.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {trade.pnl != null ? (
                        <span className={cn('font-mono font-semibold', trade.pnl >= 0 ? 'text-profit' : 'text-loss')}>
                          {formatCurrency(trade.pnl)}
                        </span>
                      ) : (
                        <span className="text-text-muted text-xs">{formatCurrency(-trade.riskAmount)} max</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {trade.rMultiple != null ? (
                        <span className={cn('font-mono font-semibold', trade.rMultiple >= 0 ? 'text-profit' : 'text-loss')}>
                          {formatR(trade.rMultiple)}
                        </span>
                      ) : (
                        <span className="text-text-muted">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <StatusBadge status={trade.status} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        {trade.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => onOpen(trade)}
                              title="Marquer comme ouvert (ordre déclenché)"
                              className="rounded-lg p-1.5 text-text-muted hover:bg-accent/10 hover:text-accent"
                            >
                              <DoorOpen size={15} />
                            </button>
                            <button
                              onClick={() => onCancel(trade)}
                              title="Annuler l'ordre limite"
                              className="rounded-lg p-1.5 text-text-muted hover:bg-neutral-dim hover:text-neutral"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {(trade.status === 'OPEN' || trade.status === 'PENDING') && (
                          <button
                            onClick={() => onClose(trade)}
                            title="Clôturer le trade"
                            className="rounded-lg p-1.5 text-text-muted hover:bg-profit-dim hover:text-profit"
                          >
                            <ExternalLink size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(trade.id)}
                          title="Supprimer"
                          className="rounded-lg p-1.5 text-text-muted hover:bg-loss-dim hover:text-loss"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-bg-elevated/80">
                      <td colSpan={11} className="px-5 py-5">
                        <div className="space-y-5">
                          {/* Analyse protocole */}
                          {(review.strengths.length > 0 || review.issues.length > 0) && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {review.strengths.length > 0 && (
                                <div className="rounded-xl border border-profit/20 bg-profit-dim/20 p-4">
                                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-profit mb-2">
                                    <CheckCircle2 size={13} /> Bonnes conduites
                                  </p>
                                  <ul className="space-y-1">
                                    {review.strengths.map((s) => (
                                      <li key={s} className="text-sm text-text-secondary">{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {review.issues.length > 0 && (
                                <div className="rounded-xl border border-loss/20 bg-loss-dim/20 p-4">
                                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-loss mb-2">
                                    <AlertTriangle size={13} /> Écarts protocole
                                  </p>
                                  <ul className="space-y-1">
                                    {review.issues.map((s) => (
                                      <li key={s} className="text-sm text-text-secondary">{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                            <div>
                              <p className="text-xs font-semibold uppercase text-text-muted mb-1">Setup</p>
                              <p className="text-sm text-text-primary">{trade.setup || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-text-muted mb-1">Marché</p>
                              <p className="text-sm text-text-primary">{marketLabel(trade.marketCondition)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-text-muted mb-1">Émotion</p>
                              {emotion > 0 ? (
                                <div className="flex items-center gap-1.5">
                                  <MoodIcon score={emotion} size={18} />
                                  <span className="text-sm font-semibold">{emotion}/5</span>
                                </div>
                              ) : (
                                <p className="text-sm text-text-muted">—</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-text-muted mb-1">Session</p>
                              <p className="text-sm text-text-primary">{trade.sessionTime || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-text-muted mb-1">Risque</p>
                              <p className="text-sm font-mono text-loss">{formatCurrency(trade.riskAmount)} ({trade.riskPercent}%)</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-text-muted mb-1">Ordre</p>
                              <p className="text-sm text-text-primary">{trade.orderType}</p>
                            </div>
                            {trade.mae != null && (
                              <div>
                                <p className="text-xs font-semibold uppercase text-text-muted mb-1">MAE</p>
                                <p className="font-mono text-sm text-loss">{formatCurrency(trade.mae)}</p>
                              </div>
                            )}
                            {trade.mfe != null && (
                              <div>
                                <p className="text-xs font-semibold uppercase text-text-muted mb-1">MFE</p>
                                <p className="font-mono text-sm text-profit">{formatCurrency(trade.mfe)}</p>
                              </div>
                            )}
                          </div>

                          {trade.notes && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-text-muted mb-1">Notes & Invalidations</p>
                              <p className="text-sm text-text-secondary whitespace-pre-wrap rounded-lg border border-border bg-bg-surface px-4 py-3">{trade.notes}</p>
                            </div>
                          )}

                          {trade.screenshot && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-text-muted mb-2">Capture TradingView</p>
                              <Image
                                src={trade.screenshot}
                                alt="Trade chart"
                                width={800}
                                height={400}
                                className="max-h-72 rounded-xl border border-border object-contain"
                              />
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-semibold uppercase text-text-muted mb-2">
                              Checklist confluence — Protocole 6/6
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {CONFLUENCE_LABELS.map(({ key, label }) => {
                                const checked = Boolean(trade[key as keyof Trade])
                                return (
                                  <span
                                    key={key}
                                    className={cn(
                                      'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium border',
                                      checked
                                        ? 'bg-profit-dim text-profit border-profit/30'
                                        : 'bg-loss-dim text-loss border-loss/30',
                                    )}
                                  >
                                    <ChecklistIcon checked={checked} size={14} />
                                    {label}
                                  </span>
                                )
                              })}
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
