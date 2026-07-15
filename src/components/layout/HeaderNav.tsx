'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { logout } from '@/app/actions/logout'

type Props = {
  role: string | null
  scrolled?: boolean
}

export default function HeaderNav({ role, scrolled = false }: Props) {
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

  const linkClass = scrolled
    ? 'block px-3 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors'
    : 'block px-3 py-2 text-white/90 hover:text-white font-medium transition-colors'

  const navLinks = (
    <>
      {!isAuthPage && (
        <Link href="/boats" onClick={() => setMenuOpen(false)} className={linkClass}>
          Каталог катеров
        </Link>
      )}
      {!isAuthPage && (
        <Link href="/ladoga" onClick={() => setMenuOpen(false)} className={linkClass}>
          Ладога
        </Link>
      )}
      {!isAuthPage && (
        <Link href="/about" onClick={() => setMenuOpen(false)} className={linkClass}>
          О нас
        </Link>
      )}
      {role ? (
        <>
          <Link
            href={role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest'}
            onClick={() => setMenuOpen(false)}
            className={linkClass}
          >
            Личный кабинет
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className={`block w-full text-left px-3 py-2 font-medium transition-colors ${
                scrolled ? 'text-slate-500 hover:text-red-500' : 'text-white/70 hover:text-red-300'
              }`}
            >
              Выйти
            </button>
          </form>
        </>
      ) : null}
    </>
  )

  const desktopLinkClass = scrolled
    ? 'text-slate-600 hover:text-blue-600 font-medium transition-colors'
    : 'text-white/90 hover:text-white font-medium transition-colors'

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        {!isAuthPage && (
          <Link href="/boats" className={desktopLinkClass}>
            Каталог катеров
          </Link>
        )}
        {!isAuthPage && (
          <Link href="/ladoga" className={desktopLinkClass}>
            Ладога
          </Link>
        )}
        {!isAuthPage && (
          <Link href="/about" className={desktopLinkClass}>
            О нас
          </Link>
        )}
        {role ? (
          <>
            <Link
              href={role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest'}
              className={desktopLinkClass}
            >
              Личный кабинет
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className={`font-medium transition-colors ${
                  scrolled ? 'text-slate-500 hover:text-red-500' : 'text-white/70 hover:text-red-300'
                }`}
              >
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
          className={`p-2 rounded-lg transition-colors ${
            scrolled
              ? 'text-slate-600 hover:bg-slate-100'
              : 'text-white/90 hover:bg-white/20'
          }`}
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
          <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50">
            {navLinks}
          </div>
        )}
      </div>
    </>
  )
}
