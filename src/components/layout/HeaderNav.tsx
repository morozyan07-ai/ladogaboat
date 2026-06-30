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

  const [contactsOpen, setContactsOpen] = useState(false)
  const contactsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (contactsRef.current && !contactsRef.current.contains(e.target as Node)) {
        setContactsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
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
        <button
          type="button"
          onClick={() => setContactsOpen((v) => !v)}
          className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
        >
          Контакты
        </button>
        {contactsOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-2 z-50">
            <a
              href={CONTACTS.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700"
            >
              <span className="text-lg">✈️</span> Telegram
            </a>
            <a
              href={CONTACTS.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700"
            >
              <span className="text-lg">💬</span> WhatsApp
            </a>
            <a
              href={CONTACTS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700"
            >
              <span className="text-lg">📷</span> Instagram
            </a>
            <a
              href={`mailto:${CONTACTS.email}`}
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700"
            >
              <span className="text-lg">✉️</span> {CONTACTS.email}
            </a>
            <div className="border-t border-slate-100 my-1" />
            <Link
              href="/support"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-slate-50 text-slate-700"
            >
              <span className="text-lg">🛟</span> Техническая поддержка
            </Link>
            <div className="border-t border-slate-100 my-1" />
            <p className="px-3 py-2 text-xs text-slate-400 leading-relaxed">
              Индивидуальный предприниматель Морозов Владимир Владимирович
              <br />
              ИНН 110110795542 · ОГРНИП 322623400017352
            </p>
          </div>
        )}
      </div>

      {role ? (
        <>
          <Link
            href={role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest'}
            className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
          >
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
          <Link
            href="/auth/register"
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Регистрация
          </Link>
        </>
      )}
    </nav>
  )
}
