import type { Metadata } from 'next'

export const siteConfig = {
  name: 'TradingLog',
  tagline: 'Trading Research & Performance',
  description:
    'Espace privé de recherche, suivi de positions et mesure des performances.',
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
export const indexablePaths: string[] = []

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
    'journal multi-actifs',
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
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
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
  const { title, description, path, index = false, keywords } = options
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
      ? { index: false, follow: false }
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

export function protocolPageJsonLd(){return {"@context":"https://schema.org","@type":"WebPage",name:"Laboratoire de stratégies modifiables"};}
