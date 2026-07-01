import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/session'
import HeaderNav from '@/components/layout/HeaderNav'

export default async function Header() {
  const session = await getSession()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link href="/" className="flex items-center">
            <Image
              src="/logo-original.png"
              alt="Ladoga Boat"
              width={130}
              height={76}
              unoptimized
              style={{ height: '64px', width: 'auto' }}
              priority
            />
          </Link>

          <HeaderNav role={session?.role ?? null} />
        </div>
      </div>
    </header>
  )
}
