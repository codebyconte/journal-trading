import type { MetadataRoute } from 'next'
import { getSiteUrl, indexablePaths } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: [...indexablePaths],
        disallow: ['/api/', '/settings', '/trades', '/journal', '/analytics'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
