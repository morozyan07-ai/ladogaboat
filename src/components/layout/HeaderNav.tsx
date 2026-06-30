'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { logout } from '@/app/actions/auth'
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
        <div ref={contactsRef} className="relative">
          <button type="button" onClick={() => setContactsOpen((v) => !v)}
            className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
            Контакты
          </button>
          {contactsOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
              <a href={CONTACTS.telegram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <span>✈️</span> Telegram
              </a>
              <a href={CONTACTS.whatsapp} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <span>💬</span> WhatsApp
              </a>
              <a href={CONTACTS.instagram} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <span>📷</span> Instagram
              </a>
              <a href={`mailto:${CONTACTS.email}`}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <span>✉️</span> {CONTACTS.email}
              </a>
              <div className="border-t border-slate-100 my-1" />
              <Link href="/support"
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700">
                <span>🛟</span> Техподдержка
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
