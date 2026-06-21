'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  BookOpen,
  Settings,
  Shield,
  Zap,
  TrendingUp,
  Clock,
  Library,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/trades', label: 'Trades', icon: ListOrdered },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/journal', label: 'Journal', icon: BookOpen },
  { href: '/protocol', label: 'Protocole', icon: Shield },
  { href: '/sources', label: 'Sources Fiables', icon: Library },
  { href: '/settings', label: 'Paramètres', icon: Settings },
] as const

function getSession() {
  const h = new Date().getUTCHours()
  if (h >= 13 && h < 16) return { label: 'Overlap LDN/NY', color: 'text-profit', dot: 'bg-profit' }
  if (h >= 13 && h < 22) return { label: 'New York', color: 'text-accent', dot: 'bg-accent' }
  if (h >= 7 && h < 16) return { label: 'Londres', color: 'text-profit', dot: 'bg-profit' }
  if (h >= 0 && h < 9) return { label: 'Asie', color: 'text-neutral', dot: 'bg-neutral' }
  return { label: 'Hors session', color: 'text-text-secondary', dot: 'bg-border' }
}

interface SidebarProps {
  currentCapital?: number
}

export function Sidebar({ currentCapital }: SidebarProps) {
  const pathname = usePathname()
  const [time, setTime] = useState('')
  const [session, setSession] = useState(getSession())

  useEffect(() => {
    const tick = () => {
      setTime(
        new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' }).format(new Date()),
      )
      setSession(getSession())
    }
    tick()
    const t = setInterval(tick, 30_000)
    return () => clearInterval(t)
  }, [])

  return (
    <aside
      className="fixed left-0 top-0 z-40 flex h-full w-[240px] flex-col border-r border-border bg-bg-surface"
      aria-label="Navigation principale"
    >
      <div className="flex items-center gap-3 border-b border-border px-5 py-5">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <Zap size={18} className="text-white" aria-hidden="true" />
        </div>
        <div translate="no">
          <p className="text-base font-bold tracking-tight text-text-primary">TradingLog</p>
          <p className="text-sm text-text-secondary">Swing 4H Protocol</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Sections">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'group flex items-center gap-3 rounded-lg border px-3 py-3 text-base font-medium transition-colors duration-150',
                active
                  ? 'border-accent/30 bg-accent/10 text-accent'
                  : 'border-transparent text-text-secondary hover:bg-bg-hover hover:text-text-primary',
              )}
            >
              <Icon
                size={18}
                aria-hidden="true"
                className={cn(
                  'flex-shrink-0 transition-colors',
                  active ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary',
                )}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {currentCapital != null && (
        <div className="mx-3 mb-2 rounded-lg border border-border bg-bg-card px-4 py-3">
          <p className="mb-0.5 text-sm text-text-secondary">Capital</p>
          <p className="font-mono text-base font-bold tabular-nums text-text-primary">
            {new Intl.NumberFormat('fr-FR', {
              style: 'currency',
              currency: 'USD',
              maximumFractionDigits: 0,
            }).format(currentCapital)}
          </p>
        </div>
      )}

      <div className="mx-3 mb-3 space-y-1.5 rounded-lg border border-border bg-bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full motion-safe:animate-pulse', session.dot)} aria-hidden="true" />
            <span className={cn('text-sm font-medium', session.color)}>{session.label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <Clock size={14} aria-hidden="true" />
            <time dateTime={new Date().toISOString()}>{time || '—'}</time>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <TrendingUp size={14} className="flex-shrink-0 text-profit" aria-hidden="true" />
          <span className="italic">Discipline = Edge</span>
        </div>
      </div>
    </aside>
  )
}
