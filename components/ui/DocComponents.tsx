import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/catalyst/badge'
import { Subheading } from '@/components/catalyst/heading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/catalyst/table'

const CALLOUT = {
  info: { ring: 'ring-indigo-500/20', bg: 'bg-indigo-500/5', title: 'text-indigo-400' },
  warning: { ring: 'ring-amber-500/20', bg: 'bg-amber-500/5', title: 'text-amber-400' },
  danger: { ring: 'ring-red-500/20', bg: 'bg-red-500/5', title: 'text-red-400' },
  success: { ring: 'ring-emerald-500/20', bg: 'bg-emerald-500/5', title: 'text-emerald-400' },
  tip: { ring: 'ring-indigo-500/20', bg: 'bg-indigo-500/5', title: 'text-indigo-400' },
} as const

export function Callout({
  type = 'info',
  title,
  children,
  icon,
}: {
  type?: keyof typeof CALLOUT
  title?: string
  children: ReactNode
  icon?: ReactNode
}) {
  const v = CALLOUT[type]
  return (
    <div className={cn('flex gap-3 rounded-xl px-4 py-4 ring-1', v.ring, v.bg)}>
      {icon && <span className="mt-0.5 shrink-0 opacity-80">{icon}</span>}
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className={cn('text-sm/6 font-semibold', v.title)}>{title}</p>}
        <div className="text-sm/6 leading-relaxed text-zinc-300">{children}</div>
      </div>
    </div>
  )
}

export function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <Subheading level={2} className="mb-6 border-b border-white/10 pb-3 text-xl/8">
      {children}
    </Subheading>
  )
}

export function SubHeading({ icon, children }: { icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-4 mt-8 flex items-center gap-2.5">
      {icon && <span className="text-indigo-400">{icon}</span>}
      <h3 className="whitespace-nowrap text-base/7 font-semibold text-white">{children}</h3>
      <div className="ml-2 h-px flex-1 bg-white/10" />
    </div>
  )
}

export function DataTable({ headers, rows }: { headers: string[]; rows: (string | ReactNode)[][] }) {
  return (
    <Table className="[--gutter:--spacing(4)]">
      <TableHead>
        <TableRow>
          {headers.map((h) => (
            <TableHeader key={h}>{h}</TableHeader>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, i) => (
          <TableRow key={i}>
            {row.map((cell, j) => (
              <TableCell key={j} className="text-zinc-300">
                {cell}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export function Step({ num, title, children }: { num: string; title: string; children: ReactNode }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-sm font-bold text-indigo-400 ring-1 ring-indigo-500/30">
          {num}
        </div>
        <div className="mt-2 w-px flex-1 bg-white/10" />
      </div>
      <div className="flex-1 pb-6">
        <p className="mb-1.5 text-base/7 font-semibold text-white">{title}</p>
        <div className="space-y-1.5 text-sm/6 leading-relaxed text-zinc-400">{children}</div>
      </div>
    </div>
  )
}

export function BiasCard({ num, name, desc, fix }: { num: number; name: string; desc: string; fix: string }) {
  return (
    <div className="space-y-3 rounded-xl bg-zinc-900 p-5 ring-1 ring-white/10">
      <div className="flex items-start gap-3">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-red-500/15 text-sm font-bold text-red-400 ring-1 ring-red-500/30">
          {num}
        </span>
        <h4 className="text-base/7 font-semibold leading-tight text-white">{name}</h4>
      </div>
      <p className="pl-10 text-sm/6 leading-relaxed text-zinc-400">{desc}</p>
      <div className="ml-10 flex items-start gap-2.5 rounded-lg bg-emerald-500/5 px-3 py-2.5 ring-1 ring-emerald-500/20">
        <p className="text-sm/6 leading-relaxed text-emerald-400">{fix}</p>
      </div>
    </div>
  )
}

export function ConfluenceTag({
  label,
  color = 'accent',
}: {
  label: string
  color?: 'profit' | 'loss' | 'neutral' | 'accent'
}) {
  const map = { profit: 'lime', loss: 'pink', neutral: 'amber', accent: 'indigo' } as const
  return <Badge color={map[color]}>{label}</Badge>
}
