import { cn } from '@/lib/utils'
import { DirectionIcon, TradeStatusIcon } from '@/components/ui/TradingIcons'
import { Badge as CatalystBadge } from '@/components/catalyst/badge'

type TradingBadgeColor = 'lime' | 'pink' | 'amber' | 'zinc' | 'indigo' | 'sky'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'profit' | 'loss' | 'neutral' | 'accent' | 'muted' | 'pending' | 'open' | 'closed' | 'cancelled'
  size?: 'sm' | 'md'
  className?: string
}

const variantToColor: Record<NonNullable<BadgeProps['variant']>, TradingBadgeColor> = {
  profit: 'lime',
  loss: 'pink',
  neutral: 'amber',
  accent: 'indigo',
  muted: 'zinc',
  pending: 'amber',
  open: 'sky',
  closed: 'zinc',
  cancelled: 'zinc',
}

export function Badge({ children, variant = 'muted', size = 'md', className }: BadgeProps) {
  return (
    <CatalystBadge
      color={variantToColor[variant]}
      className={cn(
        'font-mono tabular-nums',
        size === 'sm' ? 'text-xs/5' : 'text-sm/5',
        className,
      )}
    >
      {children}
    </CatalystBadge>
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
    PENDING: 'pending',
    OPEN: 'open',
    CLOSED: 'closed',
    CANCELLED: 'cancelled',
  }
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    OPEN: 'Ouvert',
    CLOSED: 'Clôturé',
    CANCELLED: 'Annulé',
  }
  return (
    <Badge variant={map[status] ?? 'muted'}>
      <TradeStatusIcon status={status} size={13} />
      {labels[status] ?? status}
    </Badge>
  )
}
