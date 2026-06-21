import { ProtocolJsonLd } from '@/components/seo/JsonLd'
import { pageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = pageMetadata({
  title: 'Protocole Swing 4H — Guide Complet',
  description:
    'Protocole de trading Swing 4H : analyse MTF, market structure, Fibonacci, ATR, 6 confluences, gestion post-trade, circuit-breaker et psychologie. Méthode professionnelle BTC, ETH, indices.',
  path: '/protocol',
  keywords: [
    'protocole swing trading',
    'trading 4h',
    'market structure trading',
    'confluence trading',
    'gestion post-trade',
    'circuit breaker trading',
    'fibonacci trading',
    'ATR stop loss',
  ],
})

export default function ProtocolLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ProtocolJsonLd />
      {children}
    </>
  )
}
