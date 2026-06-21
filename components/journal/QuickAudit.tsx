'use client'

import { AlertOctagon, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/catalyst/badge'
import { QUICK_AUDIT_ITEMS, type AuditKey } from '@/lib/journal'

interface Props {
  audit: Partial<Record<AuditKey, boolean>>
  onChange: (key: AuditKey, value: boolean) => void
}

export function QuickAudit({ audit, onChange }: Props) {
  const violations = QUICK_AUDIT_ITEMS.filter((item) => audit[item.key]).length

  return (
    <div className="overflow-hidden rounded-xl ring-1 ring-zinc-950/10 dark:ring-white/10">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-950/10 bg-zinc-950/2.5 px-4 py-3.5 dark:border-white/10 dark:bg-white/2.5">
        <div className="flex items-center gap-2">
          <ShieldCheck data-slot="icon" className="size-5 text-indigo-400" aria-hidden="true" />
          <div>
            <p className="text-sm/6 font-semibold text-zinc-950 dark:text-white">Audit comportemental rapide</p>
            <p className="text-xs/5 text-zinc-500 dark:text-zinc-400">Coche ce qui s&apos;est produit aujourd&apos;hui — honnêteté requise</p>
          </div>
        </div>
        {violations > 0 && (
          <Badge color="pink">
            <AlertOctagon data-slot="icon" className="size-3" aria-hidden="true" />
            {violations} alerte{violations > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 bg-white p-4 dark:bg-zinc-900 md:grid-cols-2">
        {QUICK_AUDIT_ITEMS.map((item) => {
          const checked = !!audit[item.key]
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key, !checked)}
              className={cn(
                'flex items-start gap-3 rounded-lg px-3 py-2.5 text-left text-sm/6 transition-all ring-1',
                checked && item.severity === 'loss' && 'bg-red-500/5 text-red-400 ring-red-500/20',
                checked && item.severity === 'neutral' && 'bg-amber-500/5 text-amber-400 ring-amber-500/20',
                !checked && 'text-zinc-500 ring-zinc-950/10 hover:bg-zinc-950/2.5 dark:text-zinc-400 dark:ring-white/10 dark:hover:bg-white/5',
              )}
            >
              <span className={cn(
                'mt-0.5 flex size-4 shrink-0 items-center justify-center rounded border',
                checked ? 'border-current bg-current' : 'border-zinc-600',
              )}>
                {checked && <span className="size-1.5 rounded-sm bg-white" />}
              </span>
              <span className="leading-snug">{item.label}</span>
            </button>
          )
        })}
      </div>

      {violations === 0 && (
        <p className="border-t border-zinc-950/10 px-4 py-3 text-sm/6 text-emerald-400 dark:border-white/10">
          Aucune violation cochée — journée disciplinée sur le plan comportemental.
        </p>
      )}
    </div>
  )
}
