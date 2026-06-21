import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sources Fiables | TradingLog',
  description:
    'Études scientifiques, universitaires et institutionnelles validant rigoureusement les indicateurs de trading et les métriques des marchés crypto — ETH Zürich, Imperial College, AQR, Glassnode, Fidelity et plus.',
  robots: { index: false },
}

export default function SourcesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
