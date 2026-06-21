'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ListOrdered,
  BarChart3,
  BookOpen,
  Settings,
  Shield,
  Library,
  Zap,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { Navbar, NavbarSection, NavbarSpacer } from '@/components/catalyst/navbar'
import {
  Sidebar,
  SidebarBody,
  SidebarFooter,
  SidebarHeader,
  SidebarHeading,
  SidebarItem,
  SidebarLabel,
  SidebarSection,
  SidebarSpacer,
} from '@/components/catalyst/sidebar'
import { SidebarLayout } from '@/components/catalyst/sidebar-layout'
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
  if (h >= 13 && h < 16) return { label: 'Overlap LDN/NY', color: 'text-emerald-400', dot: 'bg-emerald-400' }
  if (h >= 13 && h < 22) return { label: 'New York', color: 'text-indigo-400', dot: 'bg-indigo-400' }
  if (h >= 7 && h < 16) return { label: 'Londres', color: 'text-emerald-400', dot: 'bg-emerald-400' }
  if (h >= 0 && h < 9) return { label: 'Asie', color: 'text-amber-400', dot: 'bg-amber-400' }
  return { label: 'Hors session', color: 'text-zinc-400', dot: 'bg-zinc-600' }
}

interface ApplicationLayoutProps {
  children: React.ReactNode
  currentCapital?: number
}

export function ApplicationLayout({ children, currentCapital }: ApplicationLayoutProps) {
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

  const sidebarContent = (
    <Sidebar className="bg-zinc-950 ring-1 ring-white/10 lg:bg-zinc-950">
      <SidebarHeader>
        <SidebarItem href="/">
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500">
            <Zap data-slot="icon" className="size-4 fill-white text-white" aria-hidden="true" />
          </span>
          <SidebarLabel>
            <span className="block font-bold" translate="no">TradingLog</span>
            <span className="block text-xs font-normal text-zinc-400">Swing 4H Protocol</span>
          </SidebarLabel>
        </SidebarItem>
      </SidebarHeader>

      <SidebarBody>
        <SidebarSection>
          {navItems.map(({ href, label, icon: Icon }) => (
            <SidebarItem
              key={href}
              href={href}
              current={pathname === href || (href !== '/' && pathname.startsWith(href))}
            >
              <Icon data-slot="icon" className="size-5" strokeWidth={1.75} aria-hidden="true" />
              <SidebarLabel>{label}</SidebarLabel>
            </SidebarItem>
          ))}
        </SidebarSection>

        {currentCapital != null && (
          <SidebarSection className="max-lg:hidden">
            <SidebarHeading>Capital</SidebarHeading>
            <div className="rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
              <p className="font-mono text-base font-bold tabular-nums text-white">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(currentCapital)}
              </p>
            </div>
          </SidebarSection>
        )}

        <SidebarSpacer />

        <SidebarSection>
          <div className="rounded-lg bg-white/5 px-3 py-2.5 ring-1 ring-white/10">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className={cn('size-2 rounded-full motion-safe:animate-pulse', session.dot)} aria-hidden="true" />
                <span className={cn('text-xs font-medium', session.color)}>{session.label}</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-zinc-400">
                <Clock data-slot="icon" className="size-3.5" aria-hidden="true" />
                <time dateTime={new Date().toISOString()}>{time || '—'}</time>
              </div>
            </div>
          </div>
        </SidebarSection>
      </SidebarBody>

      <SidebarFooter className="max-lg:hidden">
        <div className="flex items-center gap-2 px-2 text-xs text-zinc-400">
          <TrendingUp data-slot="icon" className="size-3.5 text-emerald-400" aria-hidden="true" />
          <span className="italic">Discipline = Edge</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )

  return (
    <SidebarLayout
      navbar={
        <Navbar>
          <div className="flex items-center gap-2 py-2 lg:hidden">
            <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-500">
              <Zap data-slot="icon" className="size-4 fill-white text-white" aria-hidden="true" />
            </span>
            <span className="font-bold text-zinc-950 dark:text-white" translate="no">TradingLog</span>
          </div>
          <NavbarSpacer />
          <NavbarSection>
            {currentCapital != null && (
              <span className="font-mono text-sm font-semibold tabular-nums text-zinc-950 dark:text-white">
                {new Intl.NumberFormat('fr-FR', {
                  style: 'currency',
                  currency: 'USD',
                  maximumFractionDigits: 0,
                }).format(currentCapital)}
              </span>
            )}
          </NavbarSection>
        </Navbar>
      }
      sidebar={sidebarContent}
    >
      {children}
    </SidebarLayout>
  )
}
