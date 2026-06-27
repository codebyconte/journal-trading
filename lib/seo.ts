import type { Metadata } from 'next'

export const siteConfig = {
  name: 'TradingLog',
  tagline: 'Journal de Trading Swing 4H',
  description:
    'Journal de trading professionnel avec protocole Swing 4H, circuit-breaker, analytics et gestion du risque à 1%. BTC, ETH, SOL, SPX, QQQ.',
  locale: 'fr_FR',
  language: 'fr',
  twitterHandle: '@TradingLog',
} as const

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
  return url.replace(/\/$/, '')
}

export function canonicalPath(path = ''): string {
  const base = getSiteUrl()
  if (!path || path === '/') return base
  return `${base}${path.startsWith('/') ? path : `/${path}`}`
}

/** Pages indexables (contenu public / marketing) */
export const indexablePaths = ['/', '/protocol'] as const

/** Pages privées — données utilisateur, noindex */
export const privatePaths = ['/trades', '/journal', '/analytics', '/settings'] as const

export const defaultMetadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: `${siteConfig.name} — ${siteConfig.tagline}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  keywords: [
    'journal de trading',
    'trading journal',
    'swing trading',
    'protocole swing 4h',
    'gestion du risque trading',
    'journal crypto',
    'BTC trading journal',
    'circuit breaker trading',
    'analytics trading',
  ],
  authors: [{ name: siteConfig.name, url: getSiteUrl() }],
  creator: siteConfig.name,
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: siteConfig.locale,
    siteName: siteConfig.name,
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} — ${siteConfig.tagline}`,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: getSiteUrl(),
  },
}

export function pageMetadata(options: {
  title: string
  description: string
  path: string
  index?: boolean
  keywords?: string[]
}): Metadata {
  const { title, description, path, index = true, keywords } = options
  return {
    title,
    description,
    keywords: keywords ?? defaultMetadata.keywords,
    alternates: {
      canonical: canonicalPath(path),
    },
    openGraph: {
      title: `${title} · ${siteConfig.name}`,
      description,
      url: canonicalPath(path),
      type: 'website',
      locale: siteConfig.locale,
      siteName: siteConfig.name,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} · ${siteConfig.name}`,
      description,
    },
    robots: index
      ? { index: true, follow: true }
      : { index: false, follow: false, nocache: true },
  }
}

export function privatePageMetadata(title: string, description: string, path: string): Metadata {
  return pageMetadata({ title, description, path, index: false })
}

export function websiteJsonLd() {
  const url = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${url}/#website`,
        url,
        name: siteConfig.name,
        description: siteConfig.description,
        inLanguage: siteConfig.language,
        publisher: { '@id': `${url}/#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${url}/#organization`,
        name: siteConfig.name,
        url,
        description: siteConfig.description,
      },
      {
        '@type': 'SoftwareApplication',
        '@id': `${url}/#app`,
        name: siteConfig.name,
        applicationCategory: 'FinanceApplication',
        operatingSystem: 'Web',
        url,
        description: siteConfig.description,
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        featureList: [
          'Journal de trades Swing 4H',
          'Protocole 6 confluences',
          'Circuit-breaker automatique',
          'Analytics et equity curve',
          'Gestion du risque 1%',
        ],
      },
    ],
  }
}

export function protocolPageJsonLd() {
  const url = canonicalPath('/protocol')
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}/#webpage`,
        url,
        name: 'Protocole Swing 4H — Guide Complet',
        description:
          'Protocole de trading Swing 4H : MTF, market structure, Fibonacci, ATR, gestion post-trade, circuit-breaker et checklist 8 confluences.',
        inLanguage: siteConfig.language,
        isPartOf: { '@id': `${getSiteUrl()}/#website` },
        about: {
          '@type': 'Thing',
          name: 'Swing Trading 4H',
          description: 'Méthodologie de trading swing sur timeframe 4 heures',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Dashboard',
            item: getSiteUrl(),
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Protocole Swing 4H',
            item: url,
          },
        ],
      },
      {
        '@type': 'HowTo',
        name: 'Exécuter un trade selon le protocole Swing 4H',
        description: 'Processus en 6 étapes pour entrer un trade avec confluences complètes.',
        step: [
          { '@type': 'HowToStep', name: 'Règle Zéro', text: 'Vérifier état émotionnel ≥ 3/5 avant toute analyse.' },
          { '@type': 'HowToStep', name: 'MTF Alignment', text: 'Aligner Weekly, Daily et 4H dans la même direction.' },
          { '@type': 'HowToStep', name: 'Setup & confluences', text: 'Valider 8/8 confluences (EMA, RSI, volume, BBW, CryptoQuant, Arkham, Macro, Coinglass). 7/8 = taille réduite 0.5%.' },
          { '@type': 'HowToStep', name: 'Ordre Limite', text: 'Placer entrée, SL (ATR×1.5) et TP simultanément — R/R minimum 1:3 (objectifs 3R, 4R ou 5R).' },
          { '@type': 'HowToStep', name: 'Gestion post-trade', text: 'Breakeven à +1R, partial 50% @ 3R, trailing EMA 20 sur les 50% restants.' },
          { '@type': 'HowToStep', name: 'Journal & review', text: 'Enregistrer le trade et analyser les patterns hebdomadaires.' },
        ],
      },
    ],
  }
}
