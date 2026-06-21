import { cn } from '@/lib/utils'
import { DirectionIcon, TradeStatusIcon } from '@/components/ui/TradingIcons'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'profit' | 'loss' | 'neutral' | 'accent' | 'muted' | 'pending' | 'open' | 'closed' | 'cancelled'
  size?: 'sm' | 'md'
  className?: string
}

export function Badge({ children, variant = 'muted', size = 'md', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md font-mono font-semibold',
        size === 'sm' ? 'px-2 py-0.5 text-sm' : 'px-2.5 py-1 text-sm',
        {
          'bg-profit-dim text-profit':      variant === 'profit',
          'bg-loss-dim text-loss':          variant === 'loss',
          'bg-neutral-dim text-neutral':    variant === 'neutral' || variant === 'pending',
          'bg-accent-dim text-accent':      variant === 'accent' || variant === 'open',
          'bg-border text-text-secondary':  variant === 'muted' || variant === 'closed',
          'bg-text-muted/10 text-text-muted': variant === 'cancelled',
        },
        className,
      )}
    >
      {children}
    </span>
  )
}

export function DirectionBadge({ direction }: { direction: string }) {
  return (
    <Badge variant={direction === 'LONG' ? 'profit' : 'loss'}>
      <DirectionIcon direction={direction} size={14} />
      {direction}
    </Badge>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeProps['variant']> = {
    PENDING:   'pending',
    OPEN:      'open',
    CLOSED:    'closed',
    CANCELLED: 'cancelled',
  }
  const labels: Record<string, string> = {
    PENDING:   'En attente',
    OPEN:      'Ouvert',
    CLOSED:    'Clôturé',
    CANCELLED: 'Annulé',
  }
  return (
    <Badge variant={map[status]}>
      <TradeStatusIcon status={status} size={13} />
      {labels[status] ?? status}
    </Badge>
  )
}
