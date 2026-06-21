'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ReferenceLine, Cell, ComposedChart, Line,
} from 'recharts'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { DirectionIcon } from '@/components/ui/TradingIcons'
import { formatCurrency, formatR, cn } from '@/lib/utils'
import {
  generateInsights,
  truncateSetup,
  type AnalyticsSummary,
  type AnalyticsInsight,
} from '@/lib/analytics'
import {
  RefreshCw, Info, BarChart3,
  Target, Brain, Clock, Layers, AlertTriangle, CheckCircle2,
} from 'lucide-react'

interface AnalyticsData {
  summary: AnalyticsSummary
  riskViolations: number
  assetPerformance: { asset: string; trades: number; winRate: number; pnl: number; avgR: number }[]
  setupPerformance: { setup: string; trades: number; winRate: number; pnl: number }[]
  dayPerformance: { day: string; trades: number; winRate: number; pnl: number }[]
  rDistribution: { r: number; asset: string }[]
  maeAnalysis: { mae: number; mfe: number; pnl: number; r: number }[]
  emotionPerformance: { score: number; trades: number; winRate: number; pnl: number }[]
  confluencePerformance: { score: number; trades: number; winRate: number; pnl: number }[]
  sessionPerformance: { session: string; trades: number; winRate: number; pnl: number }[]
  monthlyPerformance: { month: string; trades: number; winRate: number; pnl: number }[]
  directionStats: {
    long: { trades: number; wins: number; pnl: number; avgR: number }
    short: { trades: number; wins: number; pnl: number; avgR: number }
  }
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
    <div className="rounded-xl border border-border bg-bg-elevated p-3 text-sm shadow-xl">
      {label && <p className="mb-2 font-semibold text-text-primary">{label}</p>}
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
    <div className="rounded-xl border border-border bg-bg-card p-4">
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">{label}</p>
        {icon && <span className="text-accent">{icon}</span>}
      </div>
      <p className={cn(
        'font-mono text-xl font-bold',
        trend === 'up' && 'text-profit',
        trend === 'down' && 'text-loss',
        trend === 'neutral' && 'text-text-primary',
        !trend && 'text-text-primary',
      )}>
        {value}
      </p>
      {sub && <p className="text-xs text-text-muted mt-1">{sub}</p>}
    </div>
  )
}

function InsightCard({ insight }: { insight: AnalyticsInsight }) {
  const icon = insight.type === 'good'
    ? <CheckCircle2 size={16} className="text-profit" />
    : insight.type === 'bad'
      ? <AlertTriangle size={16} className="text-loss" />
      : <Info size={16} className="text-neutral" />

  const border = insight.type === 'good'
    ? 'border-profit/25 bg-profit-dim/20'
    : insight.type === 'bad'
      ? 'border-loss/25 bg-loss-dim/20'
      : 'border-border bg-bg-surface'

  return (
    <div className={cn('flex items-start gap-3 rounded-xl border p-4', border)}>
      <span className="mt-0.5 flex-shrink-0">{icon}</span>
      <div>
        <p className="text-sm font-bold text-text-primary">{insight.title}</p>
        <p className="text-sm text-text-secondary mt-1 leading-relaxed">{insight.detail}</p>
      </div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/analytics')
      const json = await res.json()
      if (!res.ok || json.error) {
        setError(json.error ?? 'Erreur de chargement')
        setData(null)
      } else {
        setData(json)
      }
    } catch {
      setError('Impossible de charger les analytics')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const normalized = useMemo(() => {
    if (!data) return null
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
    if (!normalized) return []
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
    if (!normalized) return []
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
    if (!normalized) return []
    return normalized.setupPerformance.map((s) => ({
      ...s,
      shortSetup: truncateSetup(s.setup, 22),
    }))
  }, [normalized])

  const dayChartData = useMemo(() => {
    if (!normalized) return []
    return normalized.dayPerformance.filter((d) => d.trades > 0)
  }, [normalized])

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-text-muted">
          <RefreshCw size={20} className="animate-spin text-accent" />
          <span className="text-base">Analyse en cours...</span>
        </div>
      </div>
    )
  }

  if (error || !normalized) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <AlertTriangle size={32} className="text-loss" />
        <p className="text-text-secondary">{error ?? 'Aucune donnée disponible'}</p>
        <button
          onClick={load}
          className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white"
        >
          <RefreshCw size={14} /> Réessayer
        </button>
      </div>
    )
  }

  const { summary } = normalized
  const noData = summary.totalTrades === 0
  const pfDisplay = summary.profitFactor === Infinity
    ? '∞'
    : summary.profitFactor.toFixed(2)

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-7xl">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <BarChart3 size={26} className="text-accent" />
            Analytics
          </h1>
          <p className="text-base text-text-secondary mt-1">
            Ce qui fonctionne, ce qui ne fonctionne pas — et pourquoi
          </p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl border border-border bg-bg-card px-4 py-2.5 text-sm font-medium text-text-secondary hover:bg-bg-hover transition-all"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Actualiser
        </button>
      </div>

      {noData ? (
        <div className="flex items-start gap-4 rounded-xl border border-border bg-bg-card p-8">
          <Info size={24} className="text-accent flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-text-primary text-lg">Aucun trade clôturé</p>
            <p className="text-sm text-text-secondary mt-2 leading-relaxed">
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
              <h2 className="text-sm font-bold uppercase tracking-wide text-text-secondary mb-3 flex items-center gap-2">
                <Brain size={16} className="text-accent" />
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
              <Card key={dir} className={cn(dir === 'long' ? 'border-profit/25' : 'border-loss/25')}>
                <CardHeader>
                  <CardTitle className={cn('text-base normal-case tracking-normal', dir === 'long' ? 'text-profit' : 'text-loss')}>
                    <span className="inline-flex items-center gap-2">
                      <DirectionIcon direction={dir === 'long' ? 'LONG' : 'SHORT'} size={20} />
                      {dir === 'long' ? 'LONG' : 'SHORT'}
                    </span>
                  </CardTitle>
                </CardHeader>
                <div className="grid grid-cols-4 gap-2 text-center">
                  {[
                    { label: 'Trades', value: String(d.trades), color: 'text-text-primary' },
                    { label: 'Win Rate', value: `${wr.toFixed(1)}%`, color: wr >= 50 ? 'text-profit' : 'text-loss' },
                    { label: 'P&L', value: formatCurrency(d.pnl), color: d.pnl >= 0 ? 'text-profit' : 'text-loss' },
                    { label: 'Avg R', value: formatR(d.avgR), color: d.avgR >= 0 ? 'text-profit' : 'text-loss' },
                  ].map((s) => (
                    <div key={s.label} className="rounded-xl bg-bg-surface py-3 px-2">
                      <p className="text-xs text-text-muted">{s.label}</p>
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
              <Layers size={18} className="text-accent" />
              <CardTitle className="text-base normal-case tracking-normal text-text-primary">
                Performance par Confluence (protocole)
              </CardTitle>
            </div>
            <p className="text-xs text-text-muted">6/6 = protocole complet · Minimum requis : 4/6</p>
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
                    tickFormatter={(v) => `${v}/6`}
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
                  <tr className="border-b border-border">
                    {['Confluence', 'Trades', 'Win Rate', 'P&L'].map((h) => (
                      <th key={h} className="px-3 py-2 text-left text-xs font-bold uppercase tracking-wide text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {normalized.confluencePerformance.map((c) => (
                    <tr key={c.score} className={cn(c.score === 6 && 'bg-profit-dim/20')}>
                      <td className="px-3 py-2.5">
                        <span className={cn(
                          'rounded-md px-2 py-0.5 font-mono text-xs font-bold',
                          c.score === 6 ? 'bg-profit/20 text-profit' : c.score >= 4 ? 'bg-neutral-dim text-neutral' : 'bg-loss-dim text-loss',
                        )}>
                          {c.score}/6
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-text-secondary">{c.trades}</td>
                      <td className={cn('px-3 py-2.5 font-mono font-semibold', c.winRate >= 50 ? 'text-profit' : 'text-loss')}>
                        {c.winRate.toFixed(1)}%
                      </td>
                      <td className={cn('px-3 py-2.5 font-mono font-semibold', c.pnl >= 0 ? 'text-profit' : 'text-loss')}>
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
            <CardTitle className="text-base normal-case tracking-normal text-text-primary">
              Performance par Actif
            </CardTitle>
            <p className="text-xs text-text-muted">BTC, ETH, SOL, SPX, QQQ</p>
          </CardHeader>
          {normalized.assetPerformance.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {['Actif', 'Trades', 'Win Rate', 'P&L', 'Avg R'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-text-muted">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {normalized.assetPerformance.map((a) => (
                    <tr key={a.asset} className="hover:bg-bg-hover transition-colors">
                      <td className="px-4 py-3">
                        <span className="rounded-lg bg-bg-elevated px-2.5 py-1 font-mono text-sm font-bold text-text-primary">{a.asset}</span>
                      </td>
                      <td className="px-4 py-3 text-text-secondary">{a.trades}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <span className={cn('font-mono font-semibold min-w-[3rem]', a.winRate >= 50 ? 'text-profit' : 'text-loss')}>
                            {a.winRate.toFixed(1)}%
                          </span>
                          <div className="h-1.5 w-20 rounded-full bg-bg-elevated overflow-hidden">
                            <div
                              className={cn('h-full rounded-full', a.winRate >= 50 ? 'bg-profit' : 'bg-loss')}
                              style={{ width: `${Math.min(100, a.winRate)}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className={cn('px-4 py-3 font-mono font-semibold', a.pnl >= 0 ? 'text-profit' : 'text-loss')}>
                        {formatCurrency(a.pnl)}
                      </td>
                      <td className={cn('px-4 py-3 font-mono', a.avgR >= 0 ? 'text-profit' : 'text-loss')}>
                        {formatR(a.avgR)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-text-muted">Aucune donnée</p>
          )}
        </Card>
      )}

      {!noData && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Setup */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base normal-case tracking-normal text-text-primary">
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
                          <div className="rounded-xl border border-border bg-bg-elevated p-3 text-xs shadow-xl max-w-xs">
                            <p className="font-semibold text-text-primary mb-1">{d.setup}</p>
                            <p className="text-text-muted">{d.trades} trades · WR {d.winRate.toFixed(1)}%</p>
                            <p className={cn('font-mono font-bold mt-1', d.pnl >= 0 ? 'text-profit' : 'text-loss')}>
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
              <p className="py-8 text-center text-sm text-text-muted">Aucune donnée</p>
            )}
          </Card>

          {/* Jour de la semaine */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base normal-case tracking-normal text-text-primary">
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
              <p className="py-8 text-center text-sm text-text-muted">Pas assez de données par jour</p>
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
                <Brain size={16} className="text-accent" />
                <CardTitle className="text-base normal-case tracking-normal text-text-primary">
                  État Émotionnel vs Performance
                </CardTitle>
              </div>
              <p className="text-xs text-text-muted">Échelle 1-5 · Edgewonk : état ≤ 2 = −23% WR</p>
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
              <p className="py-8 text-center text-sm text-text-muted">Renseigne l&apos;état émotionnel dans le TradeForm</p>
            )}
          </Card>

          {/* Session */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-accent" />
                <CardTitle className="text-base normal-case tracking-normal text-text-primary">
                  Performance par Session
                </CardTitle>
              </div>
            </CardHeader>
            {normalized.sessionPerformance.length > 0 ? (
              <div className="space-y-2">
                {normalized.sessionPerformance.map((s) => (
                  <div key={s.session} className="flex items-center justify-between rounded-xl border border-border bg-bg-surface px-4 py-3">
                    <div>
                      <p className="text-sm font-bold text-text-primary">{s.session}</p>
                      <p className="text-xs text-text-muted">{s.trades} trades · WR {s.winRate.toFixed(0)}%</p>
                    </div>
                    <p className={cn('font-mono text-base font-bold', s.pnl >= 0 ? 'text-profit' : 'text-loss')}>
                      {formatCurrency(s.pnl)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-text-muted">Renseigne la session dans le TradeForm</p>
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
                <CardTitle className="text-base normal-case tracking-normal text-text-primary">
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
              <CardTitle className="text-base normal-case tracking-normal text-text-primary">
                Distribution R-Multiple
              </CardTitle>
              <p className="text-xs text-text-muted">Idéal : majorité à droite de 0, pic entre +1R et +3R</p>
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
              <p className="py-8 text-center text-sm text-text-muted">Aucune donnée</p>
            )}
          </Card>
        </div>
      )}

      {/* MAE/MFE */}
      {!noData && normalized.maeAnalysis.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base normal-case tracking-normal text-text-primary">
              Analyse MAE vs MFE
            </CardTitle>
            <p className="text-xs text-text-muted">
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
                      <div className="rounded-xl border border-border bg-bg-elevated p-3 text-xs shadow-xl">
                        <p className="text-text-muted">MAE: {formatCurrency(d.mae)}</p>
                        <p className="text-text-muted">MFE: {formatCurrency(d.mfe)}</p>
                        <p className={d.pnl >= 0 ? 'text-profit' : 'text-loss'}>P&L: {formatCurrency(d.pnl)}</p>
                        <p className={d.r >= 0 ? 'text-profit' : 'text-loss'}>R: {formatR(d.r)}</p>
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
        <div className="flex items-start gap-3 rounded-xl border border-loss/30 bg-loss-dim px-5 py-4">
          <AlertTriangle size={20} className="text-loss flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-loss">
              {normalized.riskViolations} trade(s) avec risque {'>'} 1%
            </p>
            <p className="text-sm text-text-secondary mt-1">
              Ces trades faussent tes statistiques et augmentent le risque de ruine. Reviens strictement à 1% par trade.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
