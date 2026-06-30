import type { MetadataRoute } from 'next'
import { SITE_NAME } from '@/lib/seo'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${SITE_NAME} — аренда катеров на Ладожском озере`,
    short_name: SITE_NAME,
    description: 'Аренда катеров на Ладожском озере, остров Валаам, Ладожские шхеры.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1d4ed8',
    icons: [{ src: '/logo.svg', sizes: 'any', type: 'image/svg+xml' }],
  }
}
