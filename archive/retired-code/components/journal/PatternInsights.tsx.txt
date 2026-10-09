'use client'

import { TrendingUp, TrendingDown, Minus, Brain } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/catalyst/badge'
import { cn } from '@/lib/utils'
import type { BehaviorPattern } from '@/lib/journal'

interface Props {
  patterns: BehaviorPattern[]
}

export function PatternInsights({ patterns }: Props) {
  const icon = (type: BehaviorPattern['type']) => {
    if (type === 'good') return <TrendingUp size={16} className="text-emerald-400" />
    if (type === 'bad') return <TrendingDown size={16} className="text-red-400" />
    return <Minus size={16} className="text-amber-400" />
  }

  const ringStyle = (type: BehaviorPattern['type']) => {
    if (type === 'good') return 'ring-emerald-500/25 bg-emerald-500/10'
    if (type === 'bad') return 'ring-red-500/25 bg-red-500/10'
    return 'ring-white/10 bg-zinc-900/80'
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-indigo-400" />
          <CardTitle className="text-base normal-case tracking-normal text-white">
            Patterns détectés (30 derniers jours)
          </CardTitle>
        </div>
        <span className="text-xs text-zinc-500">Basé sur tes trades + journal</span>
      </CardHeader>
      <div className="space-y-2">
        {patterns.map((p) => (
          <div key={p.id} className={cn('flex items-start gap-3 rounded-xl p-3.5 ring-1', ringStyle(p.type))}>
            <span className="mt-0.5 flex-shrink-0">{icon(p.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-white">{p.title}</p>
                {p.count != null && (
                  <Badge color="zinc" className="font-mono tabular-nums">
                    ×{p.count}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-zinc-400 mt-1 leading-relaxed">{p.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
