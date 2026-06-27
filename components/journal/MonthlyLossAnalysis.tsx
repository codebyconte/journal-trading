'use client'

import { AlertTriangle, TrendingDown, CheckCircle2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { MonthlyLossInsight } from '@/lib/journal'
import { MONTHLY_LOSS_PROMPTS } from '@/lib/journal'

interface Props {
  insights: MonthlyLossInsight[]
  lossCount: number
  monthlyReview: Partial<Record<string, string>>
  onUpdateReview: (index: number, value: string) => void
}

export function MonthlyLossAnalysis({ insights, lossCount, monthlyReview, onUpdateReview }: Props) {
  const answered = Object.values(monthlyReview).filter((v) => v?.trim()).length

  return (
    <Card variant="accent" className="lg:col-span-2">
      <CardHeader>
        <div>
          <CardTitle className="text-base normal-case tracking-normal text-white flex items-center gap-2">
            <TrendingDown size={18} className="text-red-400" />
            Analyse mensuelle des pertes — Ray Dalio
          </CardTitle>
          <span className="text-xs text-zinc-500">1×/mois · patterns systémiques · 30 derniers jours</span>
        </div>
        <span className={cn(
          'rounded-full px-2.5 py-1 text-xs font-bold',
          answered >= 2 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-zinc-500',
        )}>
          {answered}/{MONTHLY_LOSS_PROMPTS.length} synthèse
        </span>
      </CardHeader>

      <p className="text-sm text-zinc-400 mb-4">
        {lossCount} perte(s) fermée(s) sur 30 jours. Analyse-les <strong className="text-white">ensemble</strong>, pas trade par trade —
        cherche les causes profondes récurrentes.
      </p>

      <div className="mb-5 grid gap-2 sm:grid-cols-2">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className={cn(
              'rounded-xl border px-4 py-3 text-sm',
              ins.type === 'bad' && 'border-red-500/25 bg-red-500/5',
              ins.type === 'good' && 'border-emerald-500/25 bg-emerald-500/5',
              ins.type === 'neutral' && 'border-white/10 bg-zinc-900/80',
            )}
          >
            <div className="flex items-start gap-2">
              {ins.type === 'bad' ? (
                <AlertTriangle size={14} className="text-red-400 shrink-0 mt-0.5" />
              ) : ins.type === 'good' ? (
                <CheckCircle2 size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <TrendingDown size={14} className="text-zinc-500 shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold text-white">{ins.title}</p>
                <p className="text-xs text-zinc-400 mt-0.5">{ins.detail}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {MONTHLY_LOSS_PROMPTS.map(({ q, hint }, i) => {
          const answer = monthlyReview[String(i)] ?? ''
          return (
            <div key={i} className="rounded-xl border border-white/10 bg-zinc-900/80 p-4">
              <p className="text-sm font-semibold text-white">{q}</p>
              <p className="text-xs text-zinc-500 italic mt-0.5 mb-2">{hint}</p>
              <textarea
                value={answer}
                onChange={(e) => onUpdateReview(i, e.target.value)}
                placeholder="Ta synthèse…"
                rows={2}
                className="w-full resize-none rounded-lg border border-white/10 bg-zinc-900 px-3 py-2 text-sm text-white placeholder:text-zinc-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          )
        })}
      </div>
    </Card>
  )
}
