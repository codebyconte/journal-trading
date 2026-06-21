'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  TrendingUp, Target, Activity, Award,
  AlertTriangle, Zap, RefreshCw, ShieldAlert, ShieldCheck,
  ShieldOff, CheckCircle2, XCircle, Clock, ChevronRight,
  ArrowUpRight, ArrowDownRight, Plus, BarChart3, BookOpen,
} from 'lucide-react'
import { EquityCurve } from '@/components/dashboard/EquityCurve'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import type { DashboardStats, Trade } from '@/lib/types'
import { formatCurrency, formatPercent, formatR, safeNum, cn } from '@/lib/utils'
import { DirectionIcon, HealthStatusIcon } from '@/components/ui/TradingIcons'
import { formatProfitFactor, type CircuitBreakerState } from '@/lib/stats'
import { getConfluenceScore } from '@/lib/analytics'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getSession() {
  const h = new Date().getUTCHours()
  if (h >= 13 && h < 16) return { label: 'Overlap LDN/NY', color: 'text-profit', dot: 'bg-profit' }
  if (h >= 13 && h < 22) return { label: 'New York', color: 'text-accent', dot: 'bg-accent' }
  if (h >= 7 && h < 16) return { label: 'Londres', color: 'text-profit', dot: 'bg-profit' }
  if (h >= 0 && h < 9) return { label: 'Asie', color: 'text-neutral', dot: 'bg-neutral' }
  return { label: 'Hors session', color: 'text-text-muted', dot: 'bg-border' }
}

function getDayFr() {
  return new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
}

function safeProfitFactor(value: number | null | undefined): number {
  if (value == null || isNaN(value)) return 0
  if (value === Infinity) return Infinity
  if (!isFinite(value)) return 0
  return value
}

// ─── Composants ──────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, trend, icon, target, progress,
}: {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  target?: string
  progress?: number
}) {
  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-bg-card p-4 transition-all duration-200 hover:border-border-strong',
      trend === 'up' && 'border-profit/20',
      trend === 'down' && 'border-loss/20',
      trend === 'neutral' && 'border-neutral/20',
      !trend && 'border-border',
    )}>
      <div className="flex items-start justify-between mb-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary">{label}</p>
        {icon && (
          <span className={cn(
            'opacity-70',
            trend === 'up' ? 'text-profit' : trend === 'down' ? 'text-loss' : trend === 'neutral' ? 'text-neutral' : 'text-text-muted',
          )}>
            {icon}
          </span>
        )}
      </div>
      <p className={cn(
        'font-mono text-2xl font-bold tabular-nums',
        trend === 'up' && 'text-profit',
        trend === 'down' && 'text-loss',
        trend === 'neutral' && 'text-neutral',
        !trend && 'text-text-primary',
      )}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-sm text-text-secondary">{sub}</p>}
      {target && <p className="mt-1 text-xs text-text-muted">Cible : {target}</p>}
      {progress !== undefined && (
        <div className="mt-3 h-1 w-full rounded-full bg-bg-elevated overflow-hidden">
          <div
            className={cn('h-full rounded-full', trend === 'up' ? 'bg-profit' : trend === 'down' ? 'bg-loss' : 'bg-neutral')}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}

function CircuitBreakerCard({ cb }: { cb: CircuitBreakerState }) {
  const status = cb.active ? 'red' : cb.warning ? 'yellow' : 'green'

  return (
    <Card className="overflow-hidden">
      <div className={cn(
        'flex items-center gap-3 border-b px-5 py-4',
        status === 'red' && 'border-loss/20 bg-loss-dim',
        status === 'yellow' && 'border-neutral/20 bg-neutral-dim',
        status === 'green' && 'border-profit/20 bg-profit-dim',
      )}>
        {status === 'green' && <ShieldCheck size={20} className="text-profit" />}
        {status === 'yellow' && <ShieldAlert size={20} className="text-neutral" />}
        {status === 'red' && <ShieldOff size={20} className="text-loss" />}
        <div>
          <p className={cn(
            'text-sm font-bold',
            status === 'green' && 'text-profit',
            status === 'yellow' && 'text-neutral',
            status === 'red' && 'text-loss',
          )}>
            {status === 'green' ? 'Prêt à trader' : status === 'yellow' ? 'Vigilance renforcée' : 'Circuit-Breaker Actif'}
          </p>
          <p className="text-sm text-text-muted">
            {status === 'green' ? 'Aucun seuil déclenché' : status === 'yellow' ? 'Seuils d\'alerte approchant' : 'Trading interdit — règles protocole'}
          </p>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {cb.breaches.map((b, i) => (
          <div key={i} className="flex items-start gap-2.5 rounded-lg border border-loss/30 bg-loss-dim px-3 py-2.5">
            <XCircle size={15} className="text-loss flex-shrink-0 mt-0.5" />
            <p className="text-sm text-loss font-medium">{b}</p>
          </div>
        ))}
        {cb.warnings.map((w, i) => (
          <div key={i} className="flex items-start gap-2.5 rounded-lg border border-neutral/30 bg-neutral-dim px-3 py-2.5">
            <AlertTriangle size={15} className="text-neutral flex-shrink-0 mt-0.5" />
            <p className="text-sm text-neutral">{w}</p>
          </div>
        ))}
        {status === 'green' && (
          <div className="flex items-center gap-2 rounded-lg border border-profit/20 bg-profit-dim px-3 py-2.5">
            <CheckCircle2 size={15} className="text-profit" />
            <p className="text-sm text-profit">Conditions normales — protocole Swing 4H actif.</p>
          </div>
        )}

        <div className="space-y-3 pt-1">
          {[
            { label: 'Pertes consécutives', value: cb.consecutive, max: 3, suffix: `${cb.consecutive} / 3 max` },
            { label: 'P&L 7 jours', value: Math.abs(Math.min(0, cb.pnl7d)), max: 5, suffix: `${cb.pnl7d >= 0 ? '+' : ''}${cb.pnl7d.toFixed(1)}% · ${formatCurrency(cb.pnl7dUsd)}` },
            { label: 'P&L 30 jours', value: Math.abs(Math.min(0, cb.pnl30d)), max: 10, suffix: `${cb.pnl30d >= 0 ? '+' : ''}${cb.pnl30d.toFixed(1)}% · ${formatCurrency(cb.pnl30dUsd)}` },
          ].map((gauge) => {
            const pct = (gauge.value / gauge.max) * 100
            const barColor = pct >= 100 ? 'bg-loss' : pct >= 60 ? 'bg-neutral' : 'bg-profit'
            return (
              <div key={gauge.label}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-muted">{gauge.label}</span>
                  <span className={cn('font-mono font-semibold text-xs', pct >= 100 ? 'text-loss' : pct >= 60 ? 'text-neutral' : 'text-profit')}>
                    {gauge.suffix}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
                  <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${Math.min(100, pct)}%` }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

interface DashboardClientProps {
  stats: DashboardStats
  recentTrades: Trade[]
}

export function DashboardClient({ stats, recentTrades }: DashboardClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [utcTime, setUtcTime] = useState('')

  const refresh = () => {
    startTransition(() => {
      router.refresh()
    })
  }

  useEffect(() => {
    const tick = () => {
      setUtcTime(new Date().toISOString().slice(11, 16) + ' UTC')
    }
    tick()
    const t = setInterval(tick, 30_000)
    return () => clearInterval(t)
  }, [])

  const cb = stats.circuitBreaker ?? null

  const s = {
    currentCapital: safeNum(stats.currentCapital, 100000),
    initialCapital: safeNum(stats.initialCapital, 100000),
    totalPnl: safeNum(stats.totalPnl),
    totalPnlPercent: safeNum(stats.totalPnlPercent),
    winRate: safeNum(stats.winRate),
    profitFactor: safeProfitFactor(stats.profitFactor),
    avgRR: safeNum(stats.avgRR),
    avgWin: safeNum(stats.avgWin),
    avgLoss: safeNum(stats.avgLoss),
    expectancy: safeNum(stats.expectancy),
    expectancyR: safeNum(stats.expectancyR),
    maxDrawdown: safeNum(stats.maxDrawdown),
    maxDrawdownPercent: safeNum(stats.maxDrawdownPercent),
    currentStreak: safeNum(stats.currentStreak),
    closedTrades: safeNum(stats.closedTrades),
    openTrades: safeNum(stats.openTrades),
    pendingTrades: safeNum(stats.pendingTrades),
    winCount: safeNum(stats.winCount),
    lossCount: safeNum(stats.lossCount),
    bestTrade: safeNum(stats.bestTrade),
    worstTrade: safeNum(stats.worstTrade),
    openRiskUsd: safeNum(stats.openRiskUsd),
    protocolRate: safeNum(stats.protocolComplianceRate, 100),
  }

  const isProfit = s.totalPnl >= 0
  const session = getSession()
  const cbStatus = cb?.active ? 'red' : cb?.warning ? 'yellow' : 'green'
  const streakPos = s.currentStreak > 0
  const pfDisplay = formatProfitFactor(s.profitFactor)
  const hasTrades = s.closedTrades > 0
  const activePositions = s.openTrades + s.pendingTrades

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl">

      {/* Status Bar */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BarChart3 size={26} className="text-accent" />
            Dashboard
          </h1>
          <p className="text-base text-text-secondary capitalize mt-0.5">{getDayFr()}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm font-mono text-text-muted">
            <Clock size={14} />
            {utcTime}
          </div>
          <div className={cn('flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm font-medium', session.color)}>
            <span className={cn('h-2 w-2 rounded-full animate-pulse', session.dot)} />
            {session.label}
          </div>
          {cb && (
            <div className={cn(
              'flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold',
              cbStatus === 'green' && 'border-profit/30 bg-profit-dim text-profit',
              cbStatus === 'yellow' && 'border-neutral/30 bg-neutral-dim text-neutral',
              cbStatus === 'red' && 'border-loss/30 bg-loss-dim text-loss',
            )}>
              {cbStatus === 'green' && <><ShieldCheck size={14} /> Prêt</>}
              {cbStatus === 'yellow' && <><ShieldAlert size={14} /> Vigilance</>}
              {cbStatus === 'red' && <><ShieldOff size={14} /> Suspendu</>}
            </div>
          )}
          <button
            type="button"
            onClick={refresh}
            disabled={isPending}
            aria-label="Actualiser le dashboard"
            className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-3 py-2 text-sm text-text-secondary hover:bg-bg-hover disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <RefreshCw size={14} className={isPending ? 'animate-spin' : ''} aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Positions actives */}
      {activePositions > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/25 bg-accent/5 px-5 py-3">
          <div className="flex items-center gap-3">
            <Activity size={18} className="text-accent" />
            <p className="text-sm text-text-primary">
              <span className="font-bold">{activePositions}</span> position(s) active(s) · Risque engagé :{' '}
              <span className="font-mono font-bold text-loss">{formatCurrency(s.openRiskUsd)}</span>
            </p>
          </div>
          <Link href="/trades" className="text-sm font-semibold text-accent hover:underline flex items-center gap-1">
            Gérer <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Capital Banner */}
      <div className={cn(
        'rounded-2xl border p-6 bg-gradient-to-br from-bg-elevated via-bg-card to-bg-card',
        isProfit ? 'border-profit/20' : s.closedTrades === 0 ? 'border-border' : 'border-loss/20',
      )}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-text-muted mb-1">Capital Total</p>
            <p className="font-mono text-5xl font-bold text-text-primary tabular-nums">
              {formatCurrency(s.currentCapital)}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {hasTrades ? (
                <>
                  <div className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-mono font-bold',
                    isProfit ? 'bg-profit-dim text-profit' : 'bg-loss-dim text-loss',
                  )}>
                    {isProfit ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {isProfit ? '+' : ''}{formatCurrency(s.totalPnl)}
                  </div>
                  <span className={cn('font-mono text-sm font-semibold', isProfit ? 'text-profit' : 'text-loss')}>
                    ({formatPercent(s.totalPnlPercent)})
                  </span>
                  <span className="text-sm text-text-muted">depuis {formatCurrency(s.initialCapital)}</span>
                </>
              ) : (
                <span className="text-sm text-text-muted">Aucun trade clôturé — capital initial intact</span>
              )}
            </div>
            {hasTrades && (
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="text-text-muted">Max Drawdown : {s.maxDrawdownPercent.toFixed(1)}%</span>
                  <span className={cn('font-mono text-xs', s.maxDrawdownPercent > 10 ? 'text-loss' : 'text-profit')}>
                    Seuil protocole : 10%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', s.maxDrawdownPercent > 10 ? 'bg-loss' : s.maxDrawdownPercent > 5 ? 'bg-neutral' : 'bg-profit')}
                    style={{ width: `${Math.min(100, (s.maxDrawdownPercent / 10) * 100)}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 lg:grid-cols-1 lg:gap-3">
            {[
              { label: 'Capital Initial', value: formatCurrency(s.initialCapital) },
              {
                label: 'Streak actuel',
                value: s.currentStreak === 0 ? '—' : streakPos ? `+${s.currentStreak}W` : `${Math.abs(s.currentStreak)}L`,
                color: streakPos ? 'text-profit' : s.currentStreak < 0 ? 'text-loss' : 'text-text-muted',
              },
              {
                label: 'Ratio Gain/Perte',
                value: s.avgLoss > 0 ? (s.avgWin / s.avgLoss).toFixed(2) : '—',
                color: s.avgLoss > 0 && s.avgWin > s.avgLoss ? 'text-profit' : 'text-text-secondary',
              },
              {
                label: 'Protocole 6/6',
                value: hasTrades ? `${s.protocolRate.toFixed(0)}%` : '—',
                color: s.protocolRate >= 70 ? 'text-profit' : 'text-neutral',
              },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-border bg-bg-surface px-4 py-3">
                <p className="text-xs text-text-muted">{item.label}</p>
                <p className={cn('font-mono text-sm font-bold mt-0.5', item.color ?? 'text-text-secondary')}>{item.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Empty state CTA */}
      {!hasTrades && (
        <Card className="py-10 text-center">
          <Target size={40} className="mx-auto text-accent mb-4 opacity-80" />
          <p className="text-lg font-bold text-text-primary">Commence ton journal</p>
          <p className="text-sm text-text-secondary mt-2 max-w-md mx-auto">
            Enregistre ton premier trade avec le protocole complet. Toutes les métriques se calculeront automatiquement.
          </p>
          <div className="flex justify-center gap-3 mt-6">
            <Link href="/trades" className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-accent/90">
              <Plus size={16} /> Nouveau Trade
            </Link>
            <Link href="/protocol" className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-semibold text-text-secondary hover:bg-bg-hover">
              <BookOpen size={16} /> Protocole
            </Link>
          </div>
        </Card>
      )}

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <KpiCard label="Win Rate" value={hasTrades ? `${s.winRate.toFixed(1)}%` : '—'} sub={hasTrades ? `${s.winCount}W / ${s.lossCount}L` : undefined} trend={!hasTrades ? undefined : s.winRate >= 50 ? 'up' : s.winRate >= 40 ? 'neutral' : 'down'} icon={<Target size={14} />} target="≥ 50%" progress={hasTrades ? Math.min(100, (s.winRate / 60) * 100) : 0} />
        <KpiCard label="Profit Factor" value={hasTrades ? pfDisplay : '—'} trend={!hasTrades ? undefined : s.profitFactor >= 1.5 ? 'up' : s.profitFactor >= 1 ? 'neutral' : 'down'} icon={<Activity size={14} />} target="≥ 1.5" progress={hasTrades && isFinite(s.profitFactor) ? Math.min(100, (s.profitFactor / 2) * 100) : 0} />
        <KpiCard label="R/R Moyen" value={hasTrades ? formatR(s.avgRR) : '—'} trend={!hasTrades ? undefined : s.avgRR >= 1.5 ? 'up' : s.avgRR >= 0 ? 'neutral' : 'down'} icon={<Zap size={14} />} target="≥ +1.5R" progress={hasTrades ? Math.min(100, ((s.avgRR + 1) / 4) * 100) : 0} />
        <KpiCard label="Expectancy $" value={hasTrades ? formatCurrency(s.expectancy) : '—'} sub="par trade" trend={!hasTrades ? undefined : s.expectancy > 0 ? 'up' : 'down'} icon={<TrendingUp size={14} />} />
        <KpiCard label="Expectancy R" value={hasTrades ? formatR(s.expectancyR) : '—'} sub="par trade" trend={!hasTrades ? undefined : s.expectancyR > 0 ? 'up' : 'down'} icon={<Award size={14} />} />
        <KpiCard label="Gain Moy." value={hasTrades ? formatCurrency(s.avgWin) : '—'} trend="up" icon={<ArrowUpRight size={14} />} />
        <KpiCard label="Perte Moy." value={hasTrades ? formatCurrency(s.avgLoss) : '—'} trend="down" icon={<ArrowDownRight size={14} />} />
        <KpiCard label="Trades" value={String(s.closedTrades)} sub={`${s.openTrades} ouverts · ${s.pendingTrades} attente`} icon={<BarChart3 size={14} />} />
      </div>

      {/* Equity Curve */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base normal-case tracking-normal text-text-primary">Equity Curve</CardTitle>
          <span className="text-xs text-text-muted font-mono">{s.closedTrades} trades · Ref {formatCurrency(s.initialCapital)}</span>
        </CardHeader>
        <div className="h-64">
          {hasTrades ? (
            <EquityCurve data={stats.equityCurve ?? []} initialCapital={s.initialCapital} />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-muted">
              La courbe apparaîtra après tes premiers trades clôturés
            </div>
          )}
        </div>
      </Card>

      {/* Circuit-Breaker + Recent */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        {cb && <CircuitBreakerCard cb={cb} />}

        <Card>
          <CardHeader>
            <CardTitle className="text-base normal-case tracking-normal text-text-primary">Derniers Trades</CardTitle>
            <Link href="/trades" className="flex items-center gap-1 text-sm text-accent hover:underline">
              Tous <ChevronRight size={12} />
            </Link>
          </CardHeader>
          <div className="divide-y divide-border">
            {recentTrades.length === 0 && (
              <p className="py-8 text-center text-sm text-text-muted">Aucun trade clôturé</p>
            )}
            {recentTrades.map((trade) => {
              const won = (trade.pnl ?? 0) >= 0
              const score = getConfluenceScore(trade)
              return (
                <div key={trade.id} className="flex items-center justify-between px-4 py-3 hover:bg-bg-hover transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl', won ? 'bg-profit-dim' : 'bg-loss-dim')}>
                      <DirectionIcon direction={trade.direction} size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">{trade.asset}</p>
                      <p className="text-xs text-text-muted">
                        {new Date(trade.closedAt ?? trade.datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        {' · '}{score}/6 conf.
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('font-mono text-sm font-bold', won ? 'text-profit' : 'text-loss')}>
                      {trade.pnl != null ? formatCurrency(trade.pnl) : '—'}
                    </p>
                    <p className={cn('font-mono text-xs', won ? 'text-profit' : 'text-loss')}>
                      {trade.rMultiple != null ? formatR(trade.rMultiple) : '—'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* Health Check */}
      {hasTrades && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base normal-case tracking-normal text-text-primary">Health Check — Protocole Swing 4H</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              { label: 'Profit Factor', value: pfDisplay, target: '≥ 1.5', pct: isFinite(s.profitFactor) ? Math.min(100, (s.profitFactor / 2) * 100) : 100, ok: s.profitFactor >= 1.5, warn: s.profitFactor >= 1, note: 'Gains bruts / Pertes brutes' },
              { label: 'Win Rate', value: `${s.winRate.toFixed(1)}%`, target: '≥ 50%', pct: Math.min(100, (s.winRate / 60) * 100), ok: s.winRate >= 50, warn: s.winRate >= 40, note: `${s.winCount}W sur ${s.closedTrades}` },
              { label: 'R/R Réalisé', value: formatR(s.avgRR), target: '≥ +1.5R', pct: Math.min(100, ((s.avgRR + 1) / 4) * 100), ok: s.avgRR >= 1.5, warn: s.avgRR >= 0, note: 'Moyenne des R-multiples' },
              { label: 'Max Drawdown', value: `-${s.maxDrawdownPercent.toFixed(1)}%`, target: '≤ 10%', pct: Math.min(100, (s.maxDrawdownPercent / 10) * 100), ok: s.maxDrawdownPercent <= 10, warn: s.maxDrawdownPercent <= 15, note: formatCurrency(-s.maxDrawdown), inv: true },
            ].map((c) => {
              const status = c.inv
                ? (c.ok ? 'ok' : c.warn ? 'warn' : 'bad')
                : (c.ok ? 'ok' : c.warn ? 'warn' : 'bad')
              return (
                <div key={c.label} className={cn(
                  'rounded-xl border p-4',
                  status === 'ok' && 'border-profit/20 bg-profit-dim/30',
                  status === 'warn' && 'border-neutral/20 bg-neutral-dim/30',
                  status === 'bad' && 'border-loss/20 bg-loss-dim/30',
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-text-muted">{c.label}</p>
                    <HealthStatusIcon status={status} size={16} />
                  </div>
                  <p className="font-mono text-xl font-bold text-text-primary">{c.value}</p>
                  <p className="text-xs text-text-muted mt-0.5">Cible : {c.target}</p>
                  <div className="mt-3 h-1 w-full rounded-full bg-bg-elevated overflow-hidden">
                    <div className={cn('h-full rounded-full', status === 'ok' ? 'bg-profit' : status === 'warn' ? 'bg-neutral' : 'bg-loss')} style={{ width: `${c.pct}%` }} />
                  </div>
                  <p className="text-xs text-text-muted mt-1.5">{c.note}</p>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Advanced metrics */}
      {hasTrades && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[
            { label: 'Expectancy', value: `${formatCurrency(s.expectancy)} · ${formatR(s.expectancyR)}`, note: s.expectancy > 0 ? 'Edge positif confirmé' : 'Edge négatif — revoir le process', trend: s.expectancy > 0 ? 'up' : 'down' },
            { label: 'Meilleur trade', value: formatCurrency(s.bestTrade), note: 'P&L maximal sur un trade', trend: 'up' },
            { label: 'Pire trade', value: formatCurrency(s.worstTrade), note: 'Vérifier protocole & émotion', trend: 'down' },
          ].map((m) => (
            <div key={m.label} className="rounded-xl border border-border bg-bg-card p-4">
              <p className="text-sm text-text-muted mb-1">{m.label}</p>
              <p className={cn('font-mono text-xl font-bold', m.trend === 'up' ? 'text-profit' : 'text-loss')}>{m.value}</p>
              <p className="text-xs text-text-muted mt-1.5">{m.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
