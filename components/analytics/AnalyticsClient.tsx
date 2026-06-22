'use client'

import { useMemo, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ReferenceLine, Cell, ComposedChart, Line,
} from 'recharts'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { PageShell } from '@/components/ui/PageShell'
import { Button } from '@/components/catalyst/button'
import { DirectionIcon } from '@/components/ui/TradingIcons'
import { formatCurrency, formatR, cn } from '@/lib/utils'
import {
  generateInsights,
  truncateSetup,
  CONFLUENCE_MAX,
  type AnalyticsInsight,
} from '@/lib/analytics'
import type { AnalyticsData } from '@/lib/data/analytics'
import {
  RefreshCw, Info, BarChart3,
  Target, Brain, Clock, Layers, AlertTriangle, CheckCircle2,
} from 'lucide-react'

interface AnalyticsClientProps {
  data: AnalyticsData
}

const CHART = {
  grid: '#2E3444',
  axis: '#94A3B8',
  axisMuted: '#5A6478',
  profit: '#34D399',
  loss: '#F87171',
  accent: '#6366f1',
}

function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string; dataKey: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-xl bg-zinc-900 p-3 text-sm shadow-xl ring-1 ring-white/10">
      {label && <p className="mb-2 font-semibold text-white">{label}</p>}
      {payload.map((p) => (
        <p key={p.dataKey} style={{ color: p.color }} className="font-mono text-xs">
          {p.name}:{' '}
          {p.dataKey === 'winRate'
            ? `${p.value.toFixed(1)}%`
            : p.dataKey === 'count' || p.dataKey === 'trades'
              ? p.value
              : typeof p.value === 'number' && Math.abs(p.value) < 20 && !String(p.name).includes('P')
                ? formatR(p.value)
                : formatCurrency(p.value)}
        </p>
      ))}
    </div>
  )
}

function KpiCard({
  label, value, sub, trend, icon,
}: {
  label: string
  value: string
  sub?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}) {
  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl bg-white p-4 shadow-xs ring-1 ring-zinc-950/5 transition-all dark:bg-zinc-900 dark:ring-white/10',
      trend === 'up' && 'ring-emerald-500/20',
      trend === 'down' && 'ring-red-500/20',
      trend === 'neutral' && 'ring-amber-500/20',
    )}>
      <div className="mb-2 flex items-start justify-between gap-2">
        <p className="text-xs/5 font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</p>
        {icon && (
          <span className={cn(
            'opacity-70',
            trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : trend === 'neutral' ? 'text-amber-400' : 'text-zinc-500',
          )}>
            {icon}
          </span>
        )}
      </div>
      <p className={cn(
        'font-mono text-2xl font-bold tabular-nums',
        trend === 'up' && 'text-emerald-400',
        trend === 'down' && 'text-red-400',
        trend === 'neutral' && 'text-amber-400',
        !trend && 'text-white',
      )}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-sm text-zinc-400">{sub}</p>}
    </div>
  )
}

function InsightCard({ insight }: { insight: AnalyticsInsight }) {
  const icon = insight.type === 'good'
    ? <CheckCircle2 size={16} className="text-emerald-400" />
    : insight.type === 'bad'
      ? <AlertTriangle size={16} className="text-red-400" />
      : <Info size={16} className="text-amber-400" />

  const ringStyle = insight.type === 'good'
    ? 'ring-emerald-500/25 bg-emerald-500/10'
    : insight.type === 'bad'
      ? 'ring-red-500/25 bg-red-500/10'
      : 'ring-white/10 bg-zinc-900/80'

  return (
    <div className={cn('flex items-start gap-3 rounded-xl p-4 ring-1', ringStyle)}>
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-bold text-white">{insight.title}</p>
        <p className="text-sm text-zinc-300 mt-1 leading-relaxed">{insight.detail}</p>
      </div>
    </div>
  )
}

export function AnalyticsClient({ data }: AnalyticsClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const refresh = () => startTransition(() => router.refresh())

  const normalized = useMemo(() => {
    return {
      summary: data.summary ?? {
        totalTrades: 0, winCount: 0, lossCount: 0, winRate: 0, profitFactor: 0,
        expectancy: 0, avgR: 0, totalPnl: 0, avgWin: 0, avgLoss: 0,
        grossProfit: 0, grossLoss: 0,
      },
      riskViolations: data.riskViolations ?? 0,
      assetPerformance: data.assetPerformance ?? [],
      setupPerformance: data.setupPerformance ?? [],
      dayPerformance: data.dayPerformance ?? [],
      rDistribution: data.rDistribution ?? [],
      maeAnalysis: data.maeAnalysis ?? [],
      emotionPerformance: data.emotionPerformance ?? [],
      confluencePerformance: data.confluencePerformance ?? [],
      sessionPerformance: data.sessionPerformance ?? [],
      monthlyPerformance: data.monthlyPerformance ?? [],
      directionStats: data.directionStats ?? {
        long: { trades: 0, wins: 0, pnl: 0, avgR: 0 },
        short: { trades: 0, wins: 0, pnl: 0, avgR: 0 },
      },
    }
  }, [data])

  const insights = useMemo(() => {
    return generateInsights({
      summary: normalized.summary,
      confluencePerformance: normalized.confluencePerformance,
      emotionPerformance: normalized.emotionPerformance,
      setupPerformance: normalized.setupPerformance,
      assetPerformance: normalized.assetPerformance,
      riskViolations: normalized.riskViolations,
    })
  }, [normalized])

  const rHistogram = useMemo(() => {
    const bucketSize = 0.5
    const rBuckets: Record<string, number> = {}
    for (const { r } of normalized.rDistribution) {
      const bucket = (Math.floor(r / bucketSize) * bucketSize).toFixed(1)
      rBuckets[bucket] = (rBuckets[bucket] ?? 0) + 1
    }
    return Object.entries(rBuckets)
      .map(([r, count]) => ({ r: parseFloat(r), count, label: `${r}R` }))
      .sort((a, b) => a.r - b.r)
  }, [normalized])

  const setupChartData = useMemo(() => {
    return normalized.setupPerformance.map((s) => ({
      ...s,
      shortSetup: truncateSetup(s.setup, 22),
    }))
  }, [normalized])

  const dayChartData = useMemo(() => {
    return normalized.dayPerformance.filter((d) => d.trades > 0)
  }, [normalized])

  const { summary } = normalized
  const noData = summary.totalTrades === 0
  const pfDisplay = summary.profitFactor === Infinity
    ? '∞'
    : summary.profitFactor.toFixed(2)

  return (
    <PageShell>
      <PageHeader
        title="Analytics"
        description="Ce qui fonctionne, ce qui ne fonctionne pas — et pourquoi"
        icon={<BarChart3 data-slot="icon" className="size-7 text-indigo-400" aria-hidden="true" />}
        actions={
          <Button outline onClick={refresh} disabled={isPending} aria-label="Actualiser les analytics">
            <RefreshCw data-slot="icon" className={isPending ? 'animate-spin' : ''} aria-hidden="true" />
            Actualiser
          </Button>
        }
      />

      {noData ? (
        <div className="flex items-start gap-4 rounded-xl border border-white/10 bg-zinc-900 p-8">
          <Info size={24} className="text-indigo-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-white text-lg">Aucun trade clôturé</p>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              Les analytics apparaîtront dès que tu auras fermé tes premiers trades.
              Chaque trade clôturé alimente : performance par actif, setup, confluence, émotion et session.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
            <KpiCard label="Trades" value={String(summary.totalTrades)} sub={`${summary.winCount}W · ${summary.lossCount}L`} icon={<Target size={16} />} />
            <KpiCard label="Win Rate" value={`${summary.winRate.toFixed(1)}%`} trend={summary.winRate >= 45 ? 'up' : 'down'} />
            <KpiCard label="Profit Factor" value={pfDisplay} trend={summary.profitFactor >= 1.5 ? 'up' : summary.profitFactor < 1 ? 'down' : 'neutral'} />
            <KpiCard label="Expectancy" value={formatCurrency(summary.expectancy)} sub="/ trade" trend={summary.expectancy >= 0 ? 'up' : 'down'} />
            <KpiCard label="P&L Total" value={formatCurrency(summary.totalPnl)} trend={summary.totalPnl >= 0 ? 'up' : 'down'} />
            <KpiCard label="Avg R" value={formatR(summary.avgR)} trend={summary.avgR >= 0 ? 'up' : 'down'} />
            <KpiCard label="Gain moyen" value={formatCurrency(summary.avgWin)} trend="up" />
            <KpiCard label="Perte moyenne" value={formatCurrency(summary.avgLoss)} trend="down" />
          </div>

          {/* Insights auto */}
          {insights.length > 0 && (
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wide text-zinc-400 mb-3 flex items-center gap-2">
                <Brain size={16} className="text-indigo-400" />
                Insights automatiques
              </h2>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {insights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* LONG vs SHORT */}
      {!noData && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {(['long', 'short'] as const).map((dir) => {
            const d = normalized.directionStats[dir]
            const wr = d.trades > 0 ? (d.wins / d.trades) * 100 : 0
            return (
              <Card key={dir} className={cn(dir === 'long' ? 'border-emerald-500/25' : 'border-red-500/25')}>
                <CardHeader>
                  <CardTitle className={cn('text-base normal-case tracking-normal', dir === 'long' ? 'text-emerald-400' : 'text-red-400')}>
                    <span className="inline-flex items-center gap-2">
                      <DirectionIcon direction={dir === 'long' ? 'LONG' : 'SHORT'} size={20} />
                      {dir === 'long' ? 'LONG' : 'SHORT'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Trades', value: String(d.trades), color: 'text-white' },
                    { label: 'Win Rate', value: `${wr.toFixed(1)}%`, color: wr >= 50 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'P&L', value: formatCurrency(d.pnl), color: d.pnl >= 0 ? 'text-emerald-400' : 'text-red-400' },
                    { label: 'Avg R', value: formatR(d.avgR), color: d.avgR >= 0 ? 'text-emerald-400' : 'text-red-400' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-zinc-900/80 py-3 px-2">
                      <p className="text-xs text-zinc-500">{s.label}</p>
                      <p className={cn('font-mono text-base font-bold mt-1', s.color)}>{s.value}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Confluence — critique protocole */}
      {!noData && normalized.confluencePerformance.length > 0 && (
        <Card variant="accent">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-indigo-400" />
              <CardTitle className="text-base normal-case tracking-normal text-white">
                Performance par Confluence (protocole)
              </CardTitle>
            </div>
            <p className="text-xs text-zinc-500">7/7 = protocole complet · 6/7 = taille réduite à 0.5%</p>
          </CardHeader>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={normalized.confluencePerformance} margin={{ top: 8, right: 8, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                  <XAxis
                    dataKey="score"
                    tick={{ fill: CHART.axis, fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}/7`}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: CHART.axisMuted, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `$${v}`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: CHART.axisMuted, fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[0, 100]}
                  />
                  <Tooltip content={<ChartTooltip />} />
                  <ReferenceLine yAxisId="left" y={0} stroke={CHART.grid} />
                  <Bar yAxisId="left" dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                    {normalized.confluencePerformance.map((entry) => (
                      <Cell key={entry.score} fill={entry.pnl >= 0 ? CHART.profit : CHART.loss} />
                    ))}
                  </Bar>
                  <Line yAxisId="right" type="monotone" dataKey="winRate" name="Win Rate" stroke={CHART.accent} strokeWidth={2} dot={{ r: 4, fill: CHART.accent }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Confluence', 'Trades', 'Win Rate', 'P&L'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {normalized.confluencePerformance.map((c) => (
                    <tr key={c.score} className={cn(c.score === CONFLUENCE_MAX && 'bg-emerald-500/10')}>
                      <td className="px-3 py-2.5">
                        <span className={cn(
                          'rounded-md px-2 py-0.5 font-mono text-xs font-bold',
                          c.score === CONFLUENCE_MAX ? 'bg-profit/20 text-emerald-400' : c.score >= CONFLUENCE_MAX - 2 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400',
                        )}>
                          {c.score}/{CONFLUENCE_MAX}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-zinc-400">{c.trades}</td>
                      <td className={cn('px-3 py-2.5 font-mono font-semibold', c.winRate >= 50 ? 'text-emerald-400' : 'text-red-400')}>
                        {c.winRate.toFixed(1)}%
                      </td>
                      <td className={cn('px-3 py-2.5 font-mono font-semibold', c.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {formatCurrency(c.pnl)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      )}

      {/* Performance par actif */}
      {!noData && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base normal-case tracking-normal text-white">
              Performance par Actif
            </CardTitle>
            <p className="text-xs text-zinc-500">BTC, ETH, SOL, SPX, QQQ</p>
          </CardHeader>
          {normalized.assetPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10">
                    {['Actif', 'Trades', 'Win Rate', 'P&L', 'Avg R'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-zinc-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {normalized.assetPerformance.map((a) => (
                    <tr key={a.asset} className="hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-zinc-800 px-2.5 py-1 font-mono text-sm font-bold text-white">{a.asset}</span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{a.trades}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={cn('font-mono font-semibold min-w-[3rem]', a.winRate >= 50 ? 'text-emerald-400' : 'text-red-400')}>
                            {a.winRate.toFixed(1)}%
                          </span>
                          <div className="h-1.5 w-20 rounded-full bg-zinc-800 overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', a.winRate >= 50 ? 'bg-profit' : 'bg-loss')}
                              style={{ width: `${Math.min(100, a.winRate)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={cn('px-4 py-3 font-mono font-semibold', a.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {formatCurrency(a.pnl)}
                      </td>
                      <td className={cn('px-4 py-3 font-mono', a.avgR >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                        {formatR(a.avgR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-zinc-500">Aucune donnée</p>
          )}
        </Card>
      )}

      {!noData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base normal-case tracking-normal text-white">
                Performance par Setup
              </CardTitle>
            </CardHeader>
            {setupChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={setupChartData} layout="vertical" margin={{ left: 8, right: 16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} horizontal={false} />
                    <XAxis type="number" tick={{ fill: CHART.axisMuted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <YAxis type="category" dataKey="shortSetup" tick={{ fill: CHART.axis, fontSize: 10 }} tickLine={false} axisLine={false} width={130} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null
                        const d = payload[0]?.payload as typeof setupChartData[0]
                        return (
                          <div className="rounded-xl bg-zinc-900 p-3 text-xs shadow-xl ring-1 ring-white/10 max-w-xs">
                            <p className="font-semibold text-white mb-1">{d.setup}</p>
                            <p className="text-zinc-500">{d.trades} trades · WR {d.winRate.toFixed(1)}%</p>
                            <p className={cn('font-mono font-bold mt-1', d.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                              {formatCurrency(d.pnl)}
                            </p>
                          </div>
                        )
                      }}
                    />
                    <ReferenceLine x={0} stroke={CHART.grid} />
                    <Bar dataKey="pnl" name="P&L" radius={[0, 4, 4, 0]}>
                      {setupChartData.map((entry) => (
                        <Cell key={entry.setup} fill={entry.pnl >= 0 ? CHART.profit : CHART.loss} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-500">Aucune donnée</p>
            )}
          </Card>

          {/* Jour de la semaine */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base normal-case tracking-normal text-white">
                Performance par Jour
              </CardTitle>
            </CardHeader>
            {dayChartData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dayChartData} margin={{ top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="day" tick={{ fill: CHART.axis, fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: CHART.axisMuted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={0} stroke={CHART.grid} />
                    <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                      {dayChartData.map((entry) => (
                        <Cell key={entry.day} fill={entry.pnl >= 0 ? CHART.profit : CHART.loss} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-500">Pas assez de données par jour</p>
            )}
          </Card>
        </div>
      )}

      {!noData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Émotion */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain size={16} className="text-indigo-400" />
                <CardTitle className="text-base normal-case tracking-normal text-white">
                  État Émotionnel vs Performance
                </CardTitle>
              </div>
              <p className="text-xs text-zinc-500">Échelle 1-5 · Edgewonk : état ≤ 2 = −23% WR</p>
            </CardHeader>
            {normalized.emotionPerformance.length > 0 ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={normalized.emotionPerformance} margin={{ top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="score" tick={{ fill: CHART.axis, fontSize: 11 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}/5`} />
                    <YAxis yAxisId="left" tick={{ fill: CHART.axisMuted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: CHART.axisMuted, fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine yAxisId="left" y={0} stroke={CHART.grid} />
                    <Bar yAxisId="left" dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                      {normalized.emotionPerformance.map((entry) => (
                        <Cell key={entry.score} fill={entry.score <= 2 ? CHART.loss : entry.pnl >= 0 ? CHART.profit : CHART.loss} />
                      ))}
                    </Bar>
                    <Line yAxisId="right" type="monotone" dataKey="winRate" name="Win Rate" stroke={CHART.accent} strokeWidth={2} dot={{ r: 4 }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-500">Renseigne l&apos;état émotionnel dans le TradeForm</p>
            )}
          </Card>

          {/* Session */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-400" />
                <CardTitle className="text-base normal-case tracking-normal text-white">
                  Performance par Session
                </CardTitle>
              </div>
            </CardHeader>
            {normalized.sessionPerformance.length > 0 ? (
              <div className="space-y-2">
                {normalized.sessionPerformance.map((s) => (
                  <div key={s.session} className="flex items-center justify-between rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-white">{s.session}</p>
                      <p className="text-xs text-zinc-500">{s.trades} trades · WR {s.winRate.toFixed(0)}%</p>
                    </div>
                    <p className={cn('font-mono text-base font-bold', s.pnl >= 0 ? 'text-emerald-400' : 'text-red-400')}>
                      {formatCurrency(s.pnl)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-500">Renseigne la session dans le TradeForm</p>
            )}
          </Card>
        </div>
      )}

      {/* Mensuel + R distribution */}
      {!noData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {normalized.monthlyPerformance.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base normal-case tracking-normal text-white">
                  Performance Mensuelle
                </CardTitle>
              </CardHeader>
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={normalized.monthlyPerformance} margin={{ top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="month" tick={{ fill: CHART.axis, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: CHART.axisMuted, fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip content={<ChartTooltip />} />
                    <ReferenceLine y={0} stroke={CHART.grid} />
                    <Bar dataKey="pnl" name="P&L" radius={[4, 4, 0, 0]}>
                      {normalized.monthlyPerformance.map((entry) => (
                        <Cell key={entry.month} fill={entry.pnl >= 0 ? CHART.profit : CHART.loss} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base normal-case tracking-normal text-white">
                Distribution R-Multiple
              </CardTitle>
              <p className="text-xs text-zinc-500">Idéal : majorité à droite de 0, pic entre +1R et +3R</p>
            </CardHeader>
            {rHistogram.length > 0 ? (
              <div className="h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rHistogram} margin={{ top: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: CHART.axis, fontSize: 10 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fill: CHART.axisMuted, fontSize: 10 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip content={<ChartTooltip />} />
                    <Bar dataKey="count" name="Trades" radius={[4, 4, 0, 0]}>
                      {rHistogram.map((entry) => (
                        <Cell key={entry.r} fill={entry.r >= 0 ? CHART.profit : CHART.loss} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-zinc-500">Aucune donnée</p>
            )}
          </Card>
        </div>
      )}

      {/* MAE/MFE */}
      {!noData && normalized.maeAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base normal-case tracking-normal text-white">
              Analyse MAE vs MFE
            </CardTitle>
            <p className="text-xs text-zinc-500">
              MAE = excursion adverse max · MFE = excursion favorable max · Vert = gagnant · Rouge = perdant
            </p>
          </CardHeader>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART.grid} />
                <XAxis
                  type="number"
                  dataKey="mae"
                  name="MAE"
                  tick={{ fill: CHART.axisMuted, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <YAxis
                  type="number"
                  dataKey="mfe"
                  name="MFE"
                  tick={{ fill: CHART.axisMuted, fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) => `$${v}`}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0]?.payload as typeof normalized.maeAnalysis[0]
                    return (
                      <div className="rounded-xl bg-zinc-900 p-3 text-xs shadow-xl ring-1 ring-white/10">
                        <p className="text-zinc-500">MAE: {formatCurrency(d.mae)}</p>
                        <p className="text-zinc-500">MFE: {formatCurrency(d.mfe)}</p>
                        <p className={d.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}>P&L: {formatCurrency(d.pnl)}</p>
                        <p className={d.r >= 0 ? 'text-emerald-400' : 'text-red-400'}>R: {formatR(d.r)}</p>
                      </div>
                    )
                  }}
                />
                <Scatter data={normalized.maeAnalysis}>
                  {normalized.maeAnalysis.map((entry, i) => (
                    <Cell key={i} fill={entry.pnl >= 0 ? CHART.profit : CHART.loss} opacity={0.75} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Protocole compliance footer */}
      {!noData && normalized.riskViolations > 0 && (
        <div className="flex items-start gap-3 rounded-xl border border-red-500/30 bg-red-500/10 px-5 py-4">
          <AlertTriangle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-400">
              {normalized.riskViolations} trade(s) avec risque {'>'} 1%
            </p>
            <p className="text-sm text-zinc-300 mt-1">
              Ces trades faussent tes statistiques et augmentent le risque de ruine. Reviens strictement à 1% par trade.
            </p>
          </div>
        </div>
      )}
    </PageShell>
  )
}
