import { privatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = privatePageMetadata(
  'Paramètres',
  'Configuration capital et risque — espace privé.',
  '/settings',
)

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children
}
