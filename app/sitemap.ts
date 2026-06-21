import type { MetadataRoute } from 'next'
import { canonicalPath, indexablePaths } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const priorities: Record<string, number> = {
    '/': 1,
    '/protocol': 0.9,
  }
  const changeFrequency: Record<string, 'daily' | 'weekly' | 'monthly'> = {
    '/': 'daily',
    '/protocol': 'monthly',
  }

  return indexablePaths.map((path) => ({
    url: canonicalPath(path),
    lastModified: new Date(),
    changeFrequency: changeFrequency[path] ?? 'weekly',
    priority: priorities[path] ?? 0.5,
  }))
}
