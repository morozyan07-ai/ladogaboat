import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const pages: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1, changeFrequency: 'daily' },
    { path: '/boats', priority: 0.9, changeFrequency: 'hourly' },
    { path: '/auth/login', priority: 0.3, changeFrequency: 'monthly' },
    { path: '/auth/register', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/support', priority: 0.4, changeFrequency: 'monthly' },
    { path: '/legal/oferta', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/legal/privacy', priority: 0.2, changeFrequency: 'yearly' },
    { path: '/legal/consent', priority: 0.2, changeFrequency: 'yearly' },
  ]

  return pages.map(({ path, priority, changeFrequency }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  }))
}
