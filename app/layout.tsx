import type { Viewport } from 'next'
import { inter, jetbrainsMono } from '@/lib/fonts'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { SiteJsonLd } from '@/components/seo/JsonLd'
import { getSettings } from '@/lib/data/settings'
import { defaultMetadata } from '@/lib/seo'

export const metadata = defaultMetadata

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0a0b0f',
  colorScheme: 'dark',
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let currentCapital: number | undefined
  try {
    const settings = await getSettings()
    currentCapital = settings.currentCapital
  } catch {
    currentCapital = undefined
  }

  return (
    <html lang="fr" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="touch-manipulation bg-bg-base font-sans antialiased">
        <SiteJsonLd />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Aller au contenu principal
        </a>
        <Sidebar currentCapital={currentCapital} />
        <main id="main-content" tabIndex={-1} className="ml-[240px] min-h-screen outline-none">
          {children}
        </main>
      </body>
    </html>
  )
}
