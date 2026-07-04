import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Техническая поддержка',
  alternates: { canonical: '/support' },
}

export default function SupportLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
