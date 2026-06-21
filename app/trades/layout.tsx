import { privatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = privatePageMetadata(
  'Trades',
  'Gestion des trades Swing 4H — espace privé du journal.',
  '/trades',
)

export default function TradesLayout({ children }: { children: React.ReactNode }) {
  return children
}
