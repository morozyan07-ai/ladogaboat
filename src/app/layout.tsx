import type { Metadata } from 'next'
import './globals.css'
import dynamic from 'next/dynamic'
import Footer from '@/components/layout/Footer'
import { CONTACTS } from '@/lib/contacts'
import { SEO_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/seo'

// Dynamic imports изолируют ChunkLoadError — если чанк Header/CookieBanner
// не загрузится из CF, React не крашит весь дерево → анимация работает
const Header = dynamic(() => import('@/components/layout/Header'))
const CookieBanner = dynamic(() => import('@/components/CookieBanner'), { ssr: false })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s — ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  keywords: SEO_KEYWORDS,
  openGraph: {
    type: 'website',
    locale: 'ru_RU',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/logo-original.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    images: ['/logo-original.png'],
  },
  verification: {
    yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION,
    google: process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION,
  },
}

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: SITE_NAME,
  description: SITE_DESCRIPTION,
  url: SITE_URL,
  email: CONTACTS.email,
  areaServed: [
    { '@type': 'Place', name: 'Ладожское озеро' },
    { '@type': 'AdministrativeArea', name: 'Республика Карелия' },
    { '@type': 'AdministrativeArea', name: 'Ленинградская область' },
  ],
  address: { '@type': 'PostalAddress', addressCountry: 'RU' },
  sameAs: [CONTACTS.telegram, CONTACTS.whatsapp, CONTACTS.instagram].filter(Boolean),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" style={{ background: '#06080f' }}>
      <head>
        <link rel="icon" href="/favicon-light.png" media="(prefers-color-scheme: light)" type="image/png" sizes="512x512" />
        <link rel="icon" href="/favicon-dark.png" media="(prefers-color-scheme: dark)" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/favicon-light.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  )
}

