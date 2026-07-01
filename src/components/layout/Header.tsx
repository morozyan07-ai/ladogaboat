import Link from 'next/link'
import { getSession } from '@/lib/session'
import HeaderNav from '@/components/layout/HeaderNav'

export default async function Header() {
  const session = await getSession()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link href="/" className="flex items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-original.png"
              alt="Ladoga Boat"
              style={{ height: '64px', width: 'auto' }}
            />
          </Link>

          <HeaderNav role={session?.role ?? null} />
        </div>
      </div>
    </header>
  )
}
