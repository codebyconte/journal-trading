'use client'

import { AlertOctagon, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { QUICK_AUDIT_ITEMS, type AuditKey } from '@/lib/journal'

interface Props {
  audit: Partial<Record<AuditKey, boolean>>
  onChange: (key: AuditKey, value: boolean) => void
}

export function QuickAudit({ audit, onChange }: Props) {
  const violations = QUICK_AUDIT_ITEMS.filter((item) => audit[item.key]).length

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-bg-surface px-4 py-3.5">
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-accent" />
          <div>
            <p className="text-sm font-bold text-text-primary">Audit comportemental rapide</p>
            <p className="text-xs text-text-muted">Coche ce qui s&apos;est produit aujourd&apos;hui — honnêteté requise</p>
          </div>
        </div>
        {violations > 0 && (
          <span className="flex items-center gap-1 rounded-full bg-loss-dim px-2.5 py-1 text-xs font-bold text-loss">
            <AlertOctagon size={12} />
            {violations} alerte{violations > 1 ? 's' : ''}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-2">
        {QUICK_AUDIT_ITEMS.map((item) => {
          const checked = !!audit[item.key]
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onChange(item.key, !checked)}
              className={cn(
                'flex items-start gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-all',
                checked && item.severity === 'loss' && 'border-loss/40 bg-loss-dim text-loss',
                checked && item.severity === 'neutral' && 'border-neutral/40 bg-neutral-dim text-neutral',
                !checked && 'border-border bg-bg-card text-text-secondary hover:border-border-strong hover:bg-bg-hover',
              )}
            >
              <span className={cn(
                'mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border',
                checked ? 'border-current bg-current' : 'border-border-strong',
              )}>
                {checked && <span className="h-1.5 w-1.5 rounded-sm bg-white" />}
              </span>
              <span className="leading-snug">{item.label}</span>
            </button>
          )
        })}
      </div>

      {violations === 0 && (
        <p className="border-t border-border px-4 py-3 text-sm text-profit">
          Aucune violation cochée — journée disciplinée sur le plan comportemental.
        </p>
      )}
    </div>
  )
}
