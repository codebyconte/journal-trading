import type { Viewport } from 'next'
import { inter, jetbrainsMono } from '@/lib/fonts'
import './globals.css'
import { ApplicationLayout } from '@/components/layout/ApplicationLayout'
import { SiteJsonLd } from '@/components/seo/JsonLd'
import { getSettings } from '@/lib/data/settings'
import { defaultMetadata } from '@/lib/seo'

export const metadata = defaultMetadata

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#09090b',
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
    <html
      lang="fr"
      className={`dark ${inter.variable} ${jetbrainsMono.variable} text-zinc-950 antialiased lg:bg-zinc-950 dark:bg-zinc-950 dark:text-white`}
    >
      <body className="touch-manipulation">
        <SiteJsonLd />
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-indigo-600 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
        >
          Aller au contenu principal
        </a>
        <div id="main-content" tabIndex={-1}>
          <ApplicationLayout currentCapital={currentCapital}>{children}</ApplicationLayout>
        </div>
      </body>
    </html>
  )
}
