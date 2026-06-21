import {
  AlertOctagon,
  AlertTriangle,
  Check,
  CheckCircle2,
  Circle,
  Clock,
  Flame,
  Frown,
  Loader,
  Meh,
  Minus,
  Smile,
  TrendingDown,
  TrendingUp,
  X,
  XCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type IconSize = number

export function MoodIcon({
  score,
  size = 18,
  className,
}: {
  score: number
  size?: IconSize
  className?: string
}) {
  const props = { size, className: cn('flex-shrink-0', className) }
  if (score <= 1) return <AlertOctagon {...props} className={cn(props.className, 'text-loss')} />
  if (score <= 2) return <Frown {...props} className={cn(props.className, 'text-loss')} />
  if (score <= 3) return <Meh {...props} className={cn(props.className, 'text-neutral')} />
  if (score <= 4) return <Smile {...props} className={cn(props.className, 'text-profit')} />
  return <Flame {...props} className={cn(props.className, 'text-profit')} />
}

export function getMoodLabel(score: number): string {
  if (score <= 1) return 'Critique'
  if (score <= 2) return 'Dégradé'
  if (score <= 3) return 'Neutre'
  if (score <= 4) return 'Bon'
  return 'Optimal'
}

export function DirectionIcon({
  direction,
  size = 16,
  className,
  showLabel = false,
}: {
  direction: string
  size?: IconSize
  className?: string
  showLabel?: boolean
}) {
  const isLong = direction === 'LONG'
  const Icon = isLong ? TrendingUp : TrendingDown
  const color = isLong ? 'text-profit' : 'text-loss'

  if (!showLabel) {
    return <Icon size={size} className={cn(color, className)} />
  }

  return (
    <span className={cn('inline-flex items-center gap-1.5 font-semibold', color, className)}>
      <Icon size={size} />
      {direction}
    </span>
  )
}

export function HealthStatusIcon({
  status,
  size = 14,
  className,
}: {
  status: 'ok' | 'warn' | 'bad'
  size?: IconSize
  className?: string
}) {
  if (status === 'ok') return <Check size={size} className={cn('text-white', className)} />
  if (status === 'warn') return <Minus size={size} className={cn('text-white', className)} />
  return <X size={size} className={cn('text-white', className)} />
}

export function ChecklistIcon({
  checked,
  size = 14,
  className,
}: {
  checked: boolean
  size?: IconSize
  className?: string
}) {
  return checked
    ? <CheckCircle2 size={size} className={cn('text-profit', className)} />
    : <XCircle size={size} className={cn('text-loss', className)} />
}

export function TradeStatusIcon({
  status,
  size = 14,
  className,
}: {
  status: string
  size?: IconSize
  className?: string
}) {
  switch (status) {
    case 'PENDING':
      return <Clock size={size} className={cn('text-neutral', className)} />
    case 'OPEN':
      return <Circle size={size} className={cn('fill-accent text-accent', className)} />
    case 'CLOSED':
      return <CheckCircle2 size={size} className={cn('text-profit', className)} />
    case 'CANCELLED':
      return <XCircle size={size} className={cn('text-text-muted', className)} />
    default:
      return <Loader size={size} className={cn('text-text-muted', className)} />
  }
}

export function AlertBannerIcon({ size = 16, className }: { size?: IconSize; className?: string }) {
  return <AlertTriangle size={size} className={cn('text-neutral flex-shrink-0', className)} />
}
