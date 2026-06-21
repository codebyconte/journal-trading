'use client'

import { TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { cn } from '@/lib/utils'
import type { BehaviorPattern } from '@/lib/journal'

interface Props {
  patterns: BehaviorPattern[]
}

export function PatternInsights({ patterns }: Props) {
  const icon = (type: BehaviorPattern['type']) => {
    if (type === 'good') return <TrendingUp size={16} className="text-profit" />
    if (type === 'bad') return <TrendingDown size={16} className="text-loss" />
    return <Minus size={16} className="text-neutral" />
  }

  const border = (type: BehaviorPattern['type']) => {
    if (type === 'good') return 'border-profit/25 bg-profit-dim/20'
    if (type === 'bad') return 'border-loss/25 bg-loss-dim/20'
    return 'border-border bg-bg-surface'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-accent" />
          <CardTitle className="text-base normal-case tracking-normal text-text-primary">
            Patterns détectés (30 derniers jours)
          </CardTitle>
        </div>
        <span className="text-xs text-text-muted">Basé sur tes trades + journal</span>
      </CardHeader>
      <div className="space-y-2">
        {patterns.map((p) => (
          <div key={p.id} className={cn('flex items-start gap-3 rounded-xl border p-3.5', border(p.type))}>
            <span className="mt-0.5 flex-shrink-0">{icon(p.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-text-primary">{p.title}</p>
                {p.count != null && (
                  <span className="rounded-md bg-bg-card border border-border px-1.5 py-0.5 text-xs font-mono text-text-muted">
                    ×{p.count}
                  </span>
                )}
              </div>
              <p className="text-sm text-text-secondary mt-1 leading-relaxed">{p.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
