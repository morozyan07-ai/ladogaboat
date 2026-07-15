'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { logout } from '@/app/actions/logout'

type Props = {
  role: string | null
}

export default function HeaderNav({ role }: Props) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')

  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const mobileLinkClass = 'nav-link-mobile'

  const navLinks = (
    <>
      {!isAuthPage && (
        <Link href="/ladoga" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
          Ладожское озеро
        </Link>
      )}
      {!isAuthPage && (
        <Link href="/about" onClick={() => setMenuOpen(false)} className={mobileLinkClass}>
          О нас
        </Link>
      )}
      {role ? (
        <>
          <Link
            href={role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest'}
            onClick={() => setMenuOpen(false)}
            className={mobileLinkClass}
          >
            Личный кабинет
          </Link>
          <form action={logout}>
            <button type="submit" className="block w-full text-left px-3 py-2 text-white/60 hover:text-red-300 font-medium transition-colors">
              Выйти
            </button>
          </form>
        </>
      ) : null}
    </>
  )

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        {!isAuthPage && (
          <Link href="/ladoga" className="nav-link-teal">
            Ладожское озеро
          </Link>
        )}
        {!isAuthPage && (
          <Link href="/about" className="nav-link-teal">
            О нас
          </Link>
        )}
        {role ? (
          <>
            <Link
              href={role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest'}
              className="text-white/90 hover:text-white font-medium transition-colors"
            >
              Личный кабинет
            </Link>
            <form action={logout}>
              <button type="submit" className="text-white/60 hover:text-red-300 font-medium transition-colors">
                Выйти
              </button>
            </form>
          </>
        ) : null}
      </nav>

      {/* Mobile hamburger */}
      <div ref={menuRef} className="md:hidden relative">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded-lg text-white/90 hover:bg-white/10 transition-colors"
          aria-label="Меню"
        >
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-slate-900/95 backdrop-blur-md border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
            {navLinks}
          </div>
        )}
      </div>
    </>
  )
}
