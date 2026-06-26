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
import { Badge } from '@/components/catalyst/badge'
import { Button } from '@/components/catalyst/button'
import { formatConfluenceScore, getConfluenceTone, getProtocolViolations } from '@/lib/analytics'
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
  { key: 'checkBBW', label: 'BBW — tendance active' },
  { key: 'checkLiquid', label: 'CryptoQuant 4/7' },
  { key: 'checkUnlocks', label: 'Arkham Intel' },
  { key: 'checkTVL', label: 'Macro / DXY' },
  { key: 'checkCoinglass', label: 'Coinglass' },
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

  const thClass = 'cursor-pointer select-none whitespace-nowrap px-3 py-3 text-left text-xs/5 font-semibold uppercase tracking-wide text-zinc-500 hover:text-zinc-300 dark:text-zinc-400'

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-zinc-950/10 dark:ring-white/10">
      {/* Filtres statut */}
      <div className="flex flex-wrap gap-2 border-b border-zinc-950/10 bg-zinc-950/2.5 p-4 dark:border-white/10 dark:bg-white/2.5">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f.value}
            {...(statusFilter === f.value ? { color: 'indigo' as const } : { outline: true as const })}
            onClick={() => setStatusFilter(f.value)}
            className="text-sm"
          >
            {f.label}
            <span className="opacity-70">
              ({f.value === 'ALL' ? trades.length : trades.filter((t) => t.status === f.value).length})
            </span>
          </Button>
        ))}
      </div>

      {/* Filtres actif + direction */}
      <div className="flex flex-wrap items-center gap-3 border-b border-zinc-950/10 px-4 py-3 dark:border-white/10">
        <div className="flex flex-wrap gap-1.5">
          <Button
            plain
            onClick={() => setAssetFilter('ALL')}
            className={cn('text-xs', assetFilter === 'ALL' && 'bg-white/10')}
          >
            Tous actifs
          </Button>
          {assetsInUse.map((a) => (
            <Button
              key={a}
              {...(assetFilter === a ? { color: 'indigo' as const } : { plain: true as const })}
              onClick={() => setAssetFilter(a)}
              className="font-mono text-xs"
            >
              {a}
            </Button>
          ))}
        </div>
        <div className="hidden h-4 w-px bg-zinc-700 sm:block" />
        <div className="flex gap-1.5">
          {(['ALL', 'LONG', 'SHORT'] as const).map((d) => (
            <Button
              key={d}
              plain
              onClick={() => setDirectionFilter(d)}
              className={cn(
                'text-xs',
                directionFilter === d && (
                  d === 'LONG' ? 'text-emerald-400' : d === 'SHORT' ? 'text-red-400' : 'text-indigo-400'
                ),
              )}
            >
              {d === 'ALL' ? 'Toutes dirs' : d}
            </Button>
          ))}
        </div>
        <span className="ml-auto text-xs text-zinc-500">{filtered.length} résultat(s)</span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-zinc-950/10 bg-zinc-950/2.5 dark:border-white/10 dark:bg-white/2.5">
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
              <th className="px-3 py-3 text-left text-xs/5 font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-950/10 dark:divide-white/10">
            {filtered.length === 0 && (
              <tr>
                <td colSpan={11} className="py-12 text-center text-sm text-zinc-500">
                  Aucun trade ne correspond aux filtres
                </td>
              </tr>
            )}
            {filtered.map((trade) => {
              const confTone = getConfluenceTone(trade)
              const confLabel = formatConfluenceScore(trade)
              const review = reviewTrade(trade)
              const emotion = normalizeEmotion(trade.emotionScore)
              const isExpanded = expandedId === trade.id
              const violations = trade.protocolOverride
                ? [{ label: trade.overrideReason || 'Violation protocole assumée' }]
                : getProtocolViolations(
                    {
                      ...trade,
                      asset: trade.asset,
                      riskPercent: trade.riskPercent,
                      plannedRR: trade.plannedRR,
                      emotionScore: trade.emotionScore,
                    },
                    1,
                  )
              const hasViolation = trade.protocolOverride || violations.length > 0

              return (
                <Fragment key={trade.id}>
                  <tr
                    onClick={() => setExpandedId(isExpanded ? null : trade.id)}
                    className={cn(
                      'cursor-pointer transition-colors hover:bg-white/5',
                      isExpanded && 'bg-zinc-800',
                      hasViolation && 'bg-red-500/5 ring-1 ring-inset ring-red-500/20',
                    )}
                  >
                    <td className="px-3 py-3 font-mono text-xs text-zinc-400 whitespace-nowrap">
                      {formatDateTime(trade.datetime)}
                    </td>
                    <td className="px-3 py-3">
                      <span className="font-mono font-bold text-white">{trade.asset}</span>
                      {hasViolation && (
                        <Badge color="red" className="mt-1 text-[10px] uppercase tracking-wide">
                          ⚠ Violation
                        </Badge>
                      )}
                      {trade.setup && (
                        <p className="text-xs text-zinc-500 mt-0.5 truncate max-w-[120px]">{trade.setup.split('(')[0].trim()}</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <DirectionBadge direction={trade.direction} />
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn(
                        'inline-flex rounded-md px-2 py-0.5 text-xs font-bold font-mono',
                        confTone === 'full' ? 'bg-emerald-500/10 text-emerald-400' : confTone === 'partial' ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400',
                      )}>
                        {confLabel}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-mono text-white">
                      ${trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
                      <span className="text-red-400">${trade.stopLoss.toFixed(2)}</span>
                      <span className="mx-1 text-zinc-500">/</span>
                      <span className="text-emerald-400">${trade.takeProfit.toFixed(2)}</span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={cn(
                        'font-mono font-semibold',
                        trade.plannedRR >= 3 ? 'text-emerald-400' : trade.plannedRR >= 2 ? 'text-amber-400' : 'text-red-400',
                      )}>
                        1:{trade.plannedRR.toFixed(1)}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {trade.pnl != null ? (
                        <span className={cn('font-mono font-semibold', trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {formatCurrency(trade.pnl)}
                        </span>
                      ) : (
                        <span className="text-zinc-500 text-xs">{formatCurrency(-trade.riskAmount)} max</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {trade.rMultiple != null ? (
                        <span className={cn('font-mono font-semibold', trade.rMultiple >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                          {formatR(trade.rMultiple)}
                        </span>
                      ) : (
                        <span className="text-zinc-500">—</span>
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
                              className="rounded-lg p-1.5 text-zinc-500 hover:bg-indigo-500/10 hover:text-indigo-400"
                            >
                              <DoorOpen size={15} />
                            </button>
                            <button
                              onClick={() => onCancel(trade)}
                              title="Annuler l'ordre limite"
                              className="rounded-lg p-1.5 text-zinc-500 hover:bg-amber-500/10 hover:text-amber-400"
                            >
                              <XCircle size={15} />
                            </button>
                          </>
                        )}
                        {(trade.status === 'OPEN' || trade.status === 'PENDING') && (
                          <button
                            onClick={() => onClose(trade)}
                            title="Clôturer le trade"
                            className="rounded-lg p-1.5 text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-400"
                          >
                            <ExternalLink size={15} />
                          </button>
                        )}
                        <button
                          onClick={() => onDelete(trade.id)}
                          title="Supprimer"
                          className="rounded-lg p-1.5 text-zinc-500 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className="bg-zinc-800/80">
                      <td colSpan={11} className="px-5 py-5">
                        <div className="space-y-5">
                          {hasViolation && (
                            <div className="rounded-xl border-2 border-red-500/40 bg-red-500/15 p-4">
                              <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-red-300">
                                <AlertTriangle size={16} /> Violation du protocole
                              </p>
                              <ul className="mt-2 space-y-1">
                                {violations.map((v) => (
                                  <li key={v.label} className="text-sm text-red-200/90">• {v.label}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {/* Analyse protocole */}
                          {(review.strengths.length > 0 || review.issues.length > 0) && (
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                              {review.strengths.length > 0 && (
                                <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-emerald-400 mb-2">
                                    <CheckCircle2 size={13} /> Bonnes conduites
                                  </p>
                                  <ul className="space-y-1">
                                    {review.strengths.map((s) => (
                                      <li key={s} className="text-sm text-zinc-400">{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                              {review.issues.length > 0 && (
                                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4">
                                  <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-red-400 mb-2">
                                    <AlertTriangle size={13} /> Écarts protocole
                                  </p>
                                  <ul className="space-y-1">
                                    {review.issues.map((s) => (
                                      <li key={s} className="text-sm text-zinc-400">{s}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
                            <div>
                              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">Setup</p>
                              <p className="text-sm text-white">{trade.setup || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">Marché</p>
                              <p className="text-sm text-white">{marketLabel(trade.marketCondition)}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">Émotion</p>
                              {emotion > 0 ? (
                                <div className="flex items-center gap-1.5">
                                  <MoodIcon score={emotion} size={18} />
                                  <span className="text-sm font-semibold">{emotion}/5</span>
                                </div>
                              ) : (
                                <p className="text-sm text-zinc-500">—</p>
                              )}
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">Session</p>
                              <p className="text-sm text-white">{trade.sessionTime || '—'}</p>
                            </div>
                            <div>
                              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">Perte max au SL</p>
                              <p className="text-sm font-mono text-red-400">{formatCurrency(trade.riskAmount)} ({trade.riskPercent}%)</p>
                            </div>
                            {trade.atrAtEntry != null && trade.atrAtEntry > 0 && (
                              <div>
                                <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">ATR entrée (4H)</p>
                                <p className="text-sm font-mono text-zinc-300">${trade.atrAtEntry.toLocaleString()}</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">Ordre</p>
                              <p className="text-sm text-white">{trade.orderType}</p>
                            </div>
                            {trade.mae != null && (
                              <div>
                                <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">MAE</p>
                                <p className="font-mono text-sm text-red-400">{formatCurrency(trade.mae)}</p>
                              </div>
                            )}
                            {trade.mfe != null && (
                              <div>
                                <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">MFE</p>
                                <p className="font-mono text-sm text-emerald-400">{formatCurrency(trade.mfe)}</p>
                              </div>
                            )}
                          </div>

                          {trade.notes && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-zinc-500 mb-1">Notes & Invalidations</p>
                              <p className="text-sm text-zinc-400 whitespace-pre-wrap rounded-lg border border-white/10 bg-zinc-900/80 px-4 py-3">{trade.notes}</p>
                            </div>
                          )}

                          {trade.screenshot && (
                            <div>
                              <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">Capture TradingView</p>
                              <Image
                                src={trade.screenshot}
                                alt="Trade chart"
                                width={800}
                                height={400}
                                className="max-h-72 rounded-xl border border-white/10 object-contain"
                              />
                            </div>
                          )}

                          <div>
                            <p className="text-xs font-semibold uppercase text-zinc-500 mb-2">
                              Checklist confluence — {formatConfluenceScore(trade)}
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
                                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                        : 'bg-red-500/10 text-red-400 border-red-500/30',
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
