'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: ReactNode
  highlight?: boolean
  className?: string
  target?: string
  progress?: number
  note?: string
}

export function StatsCard({
  label,
  value,
  subValue,
  trend,
  icon,
  highlight,
  className,
  target,
  progress,
  note,
}: StatsCardProps) {
  const trendColor =
    trend === 'up'      ? 'text-profit'          :
    trend === 'down'    ? 'text-loss'             :
    trend === 'neutral' ? 'text-neutral'          :
                          'text-text-primary'

  const barColor =
    trend === 'up'      ? 'bg-profit'  :
    trend === 'down'    ? 'bg-loss'    :
    trend === 'neutral' ? 'bg-neutral' :
                          'bg-accent'

  return (
    <div className={cn(
      'group relative overflow-hidden rounded-xl border bg-bg-card p-4 transition-all duration-200',
      'hover:border-border-strong hover:-translate-y-0.5',
      highlight && 'border-accent/30 bg-accent/5',
      trend === 'up'      && !highlight && 'border-profit/30',
      trend === 'down'    && !highlight && 'border-loss/30',
      trend === 'neutral' && !highlight && 'border-neutral/30',
      !trend && !highlight && 'border-border',
      className,
    )}>

      <div className="flex items-start justify-between mb-2.5">
        <p className="text-sm font-semibold uppercase tracking-wide text-text-secondary leading-none">{label}</p>
        {icon && (
          <span className={cn(
            'opacity-70 group-hover:opacity-100 transition-opacity',
            trend ? trendColor : 'text-text-secondary',
          )}>
            {icon}
          </span>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className={cn('font-mono text-2xl font-bold tabular-nums leading-none', trendColor)}>
          {value}
        </span>
        {subValue && (
          <span className={cn('font-mono text-sm font-medium tabular-nums', trend ? trendColor : 'text-text-secondary')}>
            {subValue}
          </span>
        )}
      </div>

      {note && <p className="mt-1.5 text-sm text-text-secondary">{note}</p>}
      {target && <p className="mt-1 text-sm text-text-muted">Cible : {target}</p>}

      {progress !== undefined && (
        <div className="mt-3 h-1.5 w-full rounded-full bg-bg-elevated overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all duration-500', barColor)}
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}

    </div>
  )
}
