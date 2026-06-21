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
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/',          label: 'Dashboard',  icon: LayoutDashboard },
  { href: '/trades',    label: 'Trades',      icon: ListOrdered },
  { href: '/analytics', label: 'Analytics',  icon: BarChart3 },
  { href: '/journal',   label: 'Journal',    icon: BookOpen },
  { href: '/protocol',  label: 'Protocole',  icon: Shield },
  { href: '/settings',  label: 'Paramètres', icon: Settings },
]

function getSession() {
  const h = new Date().getUTCHours()
  if (h >= 13 && h < 16) return { label: 'Overlap LDN/NY', color: 'text-profit',  dot: 'bg-profit' }
  if (h >= 13 && h < 22) return { label: 'New York',        color: 'text-accent',  dot: 'bg-accent' }
  if (h >= 7  && h < 16) return { label: 'Londres',         color: 'text-profit',  dot: 'bg-profit' }
  if (h >= 0  && h < 9)  return { label: 'Asie',            color: 'text-neutral', dot: 'bg-neutral' }
  return { label: 'Hors session', color: 'text-text-secondary', dot: 'bg-border' }
}

function getTime() {
  return new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function Sidebar() {
  const pathname = usePathname()
  const [time, setTime]       = useState(getTime())
  const [session, setSession] = useState(getSession())
  const [capital, setCapital] = useState<number | null>(null)

  useEffect(() => {
    const t = setInterval(() => {
      setTime(getTime())
      setSession(getSession())
    }, 30_000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => d?.currentCapital && setCapital(d.currentCapital))
      .catch(() => {})
  }, [])

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[240px] flex-col border-r border-border bg-bg-surface">

      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
          <Zap size={18} className="text-white" />
        </div>
        <div>
          <p className="text-base font-bold text-text-primary tracking-tight">TradingLog</p>
          <p className="text-sm text-text-secondary">Swing 4H Protocol</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== '/' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-all duration-150',
                active
                  ? 'bg-accent/10 text-accent border border-accent/30'
                  : 'text-text-secondary hover:bg-bg-hover hover:text-text-primary border border-transparent',
              )}
            >
              <Icon
                size={18}
                className={cn('flex-shrink-0 transition-colors', active ? 'text-accent' : 'text-text-secondary group-hover:text-text-primary')}
              />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Capital */}
      {capital !== null && (
        <div className="mx-3 mb-2 rounded-lg border border-border bg-bg-card px-4 py-3">
          <p className="text-sm text-text-secondary mb-0.5">Capital</p>
          <p className="font-mono text-base font-bold text-text-primary">
            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(capital)}
          </p>
        </div>
      )}

      {/* Session + Horloge */}
      <div className="mx-3 mb-3 rounded-lg border border-border bg-bg-card px-4 py-3 space-y-1.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={cn('h-2 w-2 rounded-full animate-pulse', session.dot)} />
            <span className={cn('text-sm font-medium', session.color)}>{session.label}</span>
          </div>
          <div className="flex items-center gap-1.5 text-sm text-text-secondary">
            <Clock size={14} />
            {time}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-text-secondary">
          <TrendingUp size={14} className="text-profit flex-shrink-0" />
          <span className="italic">Discipline = Edge</span>
        </div>
      </div>
    </aside>
  )
}
