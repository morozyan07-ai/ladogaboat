import Link from 'next/link'
import { getSession } from '@/lib/session'
import HeaderNav from '@/components/layout/HeaderNav'

function LogoSvg() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 205" width="126" height="65" role="img" aria-label="Ladoga Boat">
      {/* Mast */}
      <line x1="192" y1="42" x2="197" y2="15" stroke="#1a2e4a" strokeWidth="2.5" strokeLinecap="round"/>
      {/* Speedboat hull */}
      <path fill="#1a2e4a" d="M 78,107 Q 195,122 312,96 L 314,82 Q 284,60 248,55 Q 232,53 226,46 Q 217,38 202,38 Q 186,38 178,46 Q 172,53 158,56 L 115,64 L 78,76 Z"/>
      {/* Wave 1 */}
      <path fill="none" stroke="#3dbead" strokeWidth="5" strokeLinecap="round" d="M 52,120 Q 120,108 188,120 Q 256,132 324,120 Q 342,116 356,120"/>
      {/* Wave 2 */}
      <path fill="none" stroke="#3dbead" strokeWidth="3.5" strokeLinecap="round" opacity="0.65" d="M 42,135 Q 112,123 180,135 Q 248,147 316,135 Q 336,131 348,135"/>
      {/* LADOGA BOAT */}
      <text x="200" y="195" fontFamily="'Arial Black',Arial,sans-serif" fontWeight="900" fontSize="44" letterSpacing="3" textAnchor="middle">
        <tspan fill="#1a2e4a">LADOGA</tspan><tspan fill="#3dbead"> BOAT</tspan>
      </text>
    </svg>
  )
}

export default async function Header() {
  const session = await getSession()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-24">
          <Link href="/" className="flex items-center">
            <LogoSvg />
          </Link>

          <HeaderNav role={session?.role ?? null} />
        </div>
      </div>
    </header>
  )
}
