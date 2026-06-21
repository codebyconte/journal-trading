import { privatePageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'

export const metadata: Metadata = privatePageMetadata(
  'Journal',
  'Journal de réflexion post-session — espace privé.',
  '/journal',
)

export default function JournalLayout({ children }: { children: React.ReactNode }) {
  return children
}
