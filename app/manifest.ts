import type { MetadataRoute } from 'next'
import { siteConfig } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${siteConfig.name} — ${siteConfig.tagline}`,
    short_name: siteConfig.name,
    description: siteConfig.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0b0f',
    theme_color: '#0a0b0f',
    lang: siteConfig.language,
    orientation: 'any',
    categories: ['finance', 'productivity'],
    scope: '/',
  }
}
