import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'TradingLog — Swing 4H',
  description: 'Journal de trading professionnel · Protocole Swing 4H · BTC · ETH · SOL · SPX · QQQ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-bg-base">
        <Sidebar />
        <main className="ml-[240px] min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
