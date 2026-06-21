import { DashboardClient } from '@/components/dashboard/DashboardClient'
import { getDashboardStats, getRecentClosedTrades } from '@/lib/data/dashboard'
import { pageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Dashboard — Journal de Trading Swing 4H',
  description:
    'Tableau de bord trading : equity curve, win rate, profit factor, circuit-breaker et KPIs protocole Swing 4H. Suivi capital BTC, ETH, SOL, SPX, QQQ.',
  path: '/',
  keywords: [
    'dashboard trading',
    'equity curve',
    'win rate trading',
    'profit factor',
    'journal trading crypto',
  ],
})

export default async function DashboardPage() {
  const [stats, recentTrades] = await Promise.all([
    getDashboardStats(),
    getRecentClosedTrades(8),
  ])

  return <DashboardClient stats={stats} recentTrades={recentTrades} />
}
