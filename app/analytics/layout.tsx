import { privatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = privatePageMetadata(
  'Analytics',
  'Analytics de performance trading — espace privé.',
  '/analytics',
)

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return children
}
