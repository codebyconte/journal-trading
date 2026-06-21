import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Aligné sur le padding du panneau principal (sidebar-layout). */
export const PAGE_GUTTER_X = 'px-6 lg:px-10'
export const PAGE_BLEED = '-mx-6 -mt-6 lg:-mx-10 lg:-mt-10'

interface PageShellProps {
  children: ReactNode
  className?: string
  /** Pleine largeur du panneau avec en-têtes bord à bord (protocole, sources). */
  variant?: 'default' | 'document'
}

export function PageShell({ children, className, variant = 'default' }: PageShellProps) {
  if (variant === 'document') {
    return <div className={cn('animate-fade-in', PAGE_BLEED, className)}>{children}</div>
  }

  return <div className={cn('space-y-8 animate-fade-in', className)}>{children}</div>
}

export function PageSection({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn(PAGE_GUTTER_X, className)}>{children}</div>
}
