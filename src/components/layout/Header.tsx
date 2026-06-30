import Link from 'next/link'
import { getSession } from '@/lib/session'
import HeaderNav from '@/components/layout/HeaderNav'

function LogoSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 680 270" width="140" height="56" role="img" aria-label="Ladoga Boat">
      <style>{`.dk{fill:#1b2e4b}.wv{fill:none;stroke:#3dbfad;stroke-linecap:round}`}</style>
      <path className="dk" d="M206 143 C214 127 238 112 264 107 L272 105 C278 104 285 107 288 113 L438 116 C452 116 462 126 464 138 L460 145 C458 148 454 150 450 150 L214 150 C208 150 204 147 206 143Z"/>
      <path className="dk" d="M302 113 L317 94 C320 90 327 88 334 88 L362 88 C369 88 374 92 376 97 L386 113Z"/>
      <line x1="337" y1="88" x2="333" y2="62" stroke="#1b2e4b" strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx="333" cy="60" r="3.5" className="dk"/>
      <path className="wv" strokeWidth="7" d="M182 163 Q228 151 274 163 Q320 175 366 163 Q412 151 458 163 Q480 168 500 163"/>
      <path className="wv" strokeWidth="5" opacity="0.55" d="M172 180 Q220 168 268 180 Q316 192 364 180 Q412 168 460 180 Q484 185 504 180"/>
      <text y="242" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="52" letterSpacing="5" textAnchor="middle" x="340">
        <tspan fill="#1b2e4b">LADOGA</tspan><tspan fill="#3dbfad"> BOAT</tspan>
      </text>
    </svg>
  )
}

export default async function Header() {
  const session = await getSession()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <LogoSvg />
          </Link>

          <HeaderNav role={session?.role ?? null} />

          <div className="md:hidden">
            <Link href="/auth/login" className="text-blue-600 font-medium">
              Войти
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
