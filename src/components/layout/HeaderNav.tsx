'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { logout } from '@/app/actions/logout'
import { CONTACTS } from '@/lib/contacts'

type Props = {
  role: string | null
}

export default function HeaderNav({ role }: Props) {
  const pathname = usePathname()
  const isAuthPage = pathname?.startsWith('/auth')

  const [menuOpen, setMenuOpen] = useState(false)
  const [contactsOpen, setContactsOpen] = useState(false)
  const contactsRef = useRef<HTMLDivElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contactsRef.current && !contactsRef.current.contains(e.target as Node)) {
        setContactsOpen(false)
      }
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const navLinks = (
    <>
      {!isAuthPage && (
        <Link href="/boats" onClick={() => setMenuOpen(false)}
          className="block px-3 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
          Каталог катеров
        </Link>
      )}
      {!isAuthPage && (
        <Link href="/service-center" onClick={() => setMenuOpen(false)}
          className="block px-3 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
          Сервисный центр
        </Link>
      )}
      <Link href="/support" onClick={() => setMenuOpen(false)}
        className="block px-3 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
        Контакты
      </Link>
      {role ? (
        <>
          <Link href={role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest'} onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
            Личный кабинет
          </Link>
          <form action={logout}>
            <button type="submit"
              className="block w-full text-left px-3 py-2 text-slate-500 hover:text-red-500 font-medium transition-colors">
              Выйти
            </button>
          </form>
        </>
      ) : (
        <>
          <Link href="/auth/login" onClick={() => setMenuOpen(false)}
            className="block px-3 py-2 text-slate-600 hover:text-blue-600 font-medium transition-colors">
            Войти
          </Link>
          <Link href="/auth/register" onClick={() => setMenuOpen(false)}
            className="block mx-3 my-2 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
            Регистрация
          </Link>
        </>
      )}
    </>
  )

  return (
    <>
      {/* Desktop nav */}
      <nav className="hidden md:flex items-center gap-6">
        {!isAuthPage && (
          <Link href="/boats" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
            Каталог катеров
          </Link>
        )}
        {!isAuthPage && (
          <Link href="/service-center" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
            Сервисный центр
          </Link>
        )}
        <div ref={contactsRef} className="relative" onMouseEnter={() => setContactsOpen(true)} onMouseLeave={() => setContactsOpen(false)}>
          <button type="button" onClick={() => setContactsOpen((v) => !v)}
            className="text-slate-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1">
            Контакты
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 4l4 4 4-4"/></svg>
          </button>
          {contactsOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-[100]">
              <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#26A5E4"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.247-2.042 9.617c-.153.682-.554.849-1.123.527l-3.098-2.283-1.495 1.438c-.165.165-.304.304-.624.304l.222-3.162 5.763-5.203c.25-.222-.054-.346-.389-.124L7.64 14.786l-3.055-.946c-.668-.208-.68-.668.14-.989l10.895-4.2c.557-.2 1.044.124.942.596z"/></svg>
                Telegram
              </a>
              <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp
              </a>
              <a href={CONTACTS.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="url(#ig-grad)"><defs><linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#F58529"/><stop offset="50%" stopColor="#DD2A7B"/><stop offset="100%" stopColor="#8134AF"/></linearGradient></defs><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                Instagram
              </a>
              <a href={`mailto:${CONTACTS.email}`}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {CONTACTS.email}
              </a>
              <div className="border-t border-slate-100 my-1" />
              <Link href="/support"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
                Техподдержка
              </Link>
            </div>
          )}
        </div>
        {role ? (
          <>
            <Link href={role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest'}
              className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
              Личный кабинет
            </Link>
            <form action={logout}>
              <button type="submit" className="text-slate-500 hover:text-red-500 font-medium transition-colors">
                Выйти
              </button>
            </form>
          </>
        ) : (
          <>
            <Link href="/auth/login" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
              Войти
            </Link>
            <Link href="/auth/register"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium">
              Регистрация
            </Link>
          </>
        )}
      </nav>

      {/* Mobile hamburger */}
      <div ref={menuRef} className="md:hidden relative">
        <button type="button" onClick={() => setMenuOpen((v) => !v)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
          aria-label="Меню">
          {menuOpen ? (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          ) : (
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
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
