import type { Metadata } from 'next'
import './globals.css'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import CookieBanner from '@/components/CookieBanner'
import { CONTACTS } from '@/lib/contacts'
import { SEO_KEYWORDS, SITE_DESCRIPTION, SITE_NAME, SITE_TITLE, SITE_URL } from '@/lib/seo'

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
  sameAs: [CONTACTS.telegram, CONTACTS.whatsapp].filter(Boolean),
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" style={{ background: '#06080f' }}>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-dark.png" type="image/png" sizes="512x512" />
        <link rel="apple-touch-icon" href="/favicon-dark.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, backgroundImage: "url('/hero/winter.jpg')", backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.45, pointerEvents: 'none' }} />
        <div aria-hidden="true" style={{ position: 'fixed', inset: 0, zIndex: 0, background: 'linear-gradient(to bottom, rgba(6,8,15,0.25) 0%, rgba(6,8,15,0.42) 60%, rgba(6,8,15,0.65) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative', zIndex: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <CookieBanner />
        </div>
      </body>
    </html>
  )
}
