import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  glow?: boolean
  variant?: 'default' | 'profit' | 'loss' | 'neutral' | 'accent'
}

export function Card({ children, className, glow, variant = 'default' }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-xl border bg-bg-card p-5',
        variant === 'default'  && 'border-border',
        variant === 'profit'   && 'border-profit/30 bg-profit-dim/40',
        variant === 'loss'     && 'border-loss/30   bg-loss-dim/40',
        variant === 'neutral'  && 'border-neutral/30 bg-neutral-dim/40',
        variant === 'accent'   && 'border-accent/30  bg-accent/8',
        glow && 'shadow-[0_0_24px_rgba(99,102,241,0.08)]',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mb-4 flex items-center justify-between gap-3', className)}>
      {children}
    </div>
  )
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <h3 className={cn('text-sm font-semibold uppercase tracking-wide text-text-secondary', className)}>
      {children}
    </h3>
  )
}
