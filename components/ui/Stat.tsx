import { Badge } from '@/components/catalyst/badge'
import { Divider } from '@/components/catalyst/divider'
import { cn } from '@/lib/utils'

export function Stat({
  title,
  value,
  change,
  sub,
  className,
}: {
  title: string
  value: string
  change?: string
  sub?: string
  className?: string
}) {
  const trend = change?.startsWith('+') ? 'lime' : change?.startsWith('-') ? 'pink' : 'zinc'

  return (
    <div className={className}>
      <Divider />
      <div className="mt-6 text-lg/6 font-medium sm:text-sm/6 text-zinc-500 dark:text-zinc-400">{title}</div>
      <div className={cn('mt-3 text-3xl/8 font-semibold tabular-nums sm:text-2xl/8 text-zinc-950 dark:text-white')}>
        {value}
      </div>
      {(change || sub) && (
        <div className="mt-3 text-sm/6 sm:text-xs/6">
          {change && <Badge color={trend}>{change}</Badge>}
          {sub && <span className="text-zinc-500 dark:text-zinc-400">{change ? ' · ' : ''}{sub}</span>}
        </div>
      )}
    </div>
  )
}
