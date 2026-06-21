import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface SystemStateProps {
  icon: ReactNode
  title: string
  description: string
  children?: ReactNode
}

export function SystemState({ icon, title, description, children }: SystemStateProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-6 px-4 py-16 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-zinc-950/5 ring-1 ring-zinc-950/10 dark:bg-white/5 dark:ring-white/10">
        {icon}
      </div>
      <div className="max-w-md space-y-2">
        <h1 className="text-xl/8 font-semibold text-zinc-950 dark:text-white">{title}</h1>
        <p className="text-sm/6 text-zinc-400 dark:text-zinc-300">{description}</p>
      </div>
      {children && <div className="flex flex-wrap items-center justify-center gap-3">{children}</div>}
    </div>
  )
}

interface KpiItem {
  label: string
  value: string
  tone?: 'profit' | 'loss' | 'neutral' | 'accent' | 'default'
}

const toneClass: Record<NonNullable<KpiItem['tone']>, string> = {
  profit: 'text-emerald-400',
  loss: 'text-red-400',
  neutral: 'text-amber-400',
  accent: 'text-indigo-400',
  default: 'text-zinc-950 dark:text-white',
}

export function KpiGrid({ items }: { items: KpiItem[] }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl bg-zinc-950/10 ring-1 ring-zinc-950/10 dark:bg-white/10 dark:ring-white/10 sm:grid-cols-4 xl:grid-cols-8">
      {items.map(({ label, value, tone = 'default' }) => (
        <div
          key={label}
          className="bg-white px-4 py-3.5 dark:bg-zinc-900"
        >
          <p className="text-xs/5 font-medium uppercase tracking-wide text-zinc-400 dark:text-zinc-300">{label}</p>
          <p className={cn('mt-1 font-mono text-lg/7 font-semibold tabular-nums', toneClass[tone])}>{value}</p>
        </div>
      ))}
    </div>
  )
}

export function CalloutBanner({
  icon,
  title,
  children,
  tone = 'indigo',
}: {
  icon?: ReactNode
  title?: string
  children: ReactNode
  tone?: 'indigo' | 'amber' | 'emerald' | 'red'
}) {
  const tones = {
    indigo: 'bg-indigo-500/5 ring-indigo-500/20 text-indigo-300',
    amber: 'bg-amber-500/5 ring-amber-500/20 text-amber-300',
    emerald: 'bg-emerald-500/5 ring-emerald-500/20 text-emerald-300',
    red: 'bg-red-500/5 ring-red-500/20 text-red-300',
  }
  return (
    <div className={cn('flex gap-3 rounded-xl px-5 py-4 ring-1', tones[tone])}>
      {icon && <span className="mt-0.5 shrink-0 opacity-80">{icon}</span>}
      <div className="min-w-0 text-sm/6 text-zinc-300">
        {title && <p className="mb-1 font-semibold text-white">{title}</p>}
        {children}
      </div>
    </div>
  )
}
