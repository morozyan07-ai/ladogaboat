'use client'
import dynamic from 'next/dynamic'
import type { ReactNode } from 'react'

// dynamic() в Client Component — правильный паттерн для ChunkLoadError isolation.
// Если чанк Header/CookieBanner упадёт (ERR_CONNECTION_CLOSED), Suspense
// boundary поймает ошибку → loading=null → React не крашит всё дерево →
// IntroOverlay.useEffect запустится → анимация стартует.
const Header = dynamic(() => import('@/components/layout/Header'), {
  loading: () => null,
})

const CookieBanner = dynamic(() => import('@/components/CookieBanner'), {
  loading: () => null,
})

export default function ClientShell({ children }: { children: ReactNode }) {
  return (
    <>
      <Header />
      <main className="flex-1">{children}</main>
      <CookieBanner />
    </>
  )
}
