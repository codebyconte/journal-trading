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
        'rounded-xl p-5 shadow-xs ring-1 ring-zinc-950/5 dark:ring-white/10',
        variant === 'default' && 'bg-white dark:bg-zinc-900',
        variant === 'profit' && 'border-profit/30 bg-emerald-500/5 ring-emerald-500/20 dark:bg-emerald-500/10',
        variant === 'loss' && 'border-loss/30 bg-red-500/5 ring-red-500/20 dark:bg-red-500/10',
        variant === 'neutral' && 'border-neutral/30 bg-amber-500/5 ring-amber-500/20 dark:bg-amber-500/10',
        variant === 'accent' && 'border-accent/30 bg-indigo-500/5 ring-indigo-500/20 dark:bg-indigo-500/10',
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
    <h3 className={cn('text-sm font-semibold uppercase tracking-wide text-zinc-400 dark:text-zinc-300', className)}>
      {children}
    </h3>
  )
}
