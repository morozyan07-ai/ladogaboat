'use client'

import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem('cookie_ok')) {
        setVisible(true)
      }
    } catch {
      // localStorage недоступен — не показываем
    }
  }, [])

  function accept() {
    try {
      localStorage.setItem('cookie_ok', '1')
    } catch {}
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-sm z-[200] animate-fade-in">
      <div className="bg-slate-900/95 backdrop-blur-sm border border-slate-700 rounded-2xl px-5 py-4 shadow-2xl flex items-start gap-4">
        <p className="text-slate-300 text-sm leading-relaxed flex-1">
          Мы используем файлы&nbsp;cookie для улучшения работы сайта и анализа трафика. Продолжая использовать&nbsp;сайт, вы&nbsp;соглашаетесь с&nbsp;их&nbsp;использованием.
        </p>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <button onClick={accept} aria-label="Закрыть" className="text-slate-400 hover:text-white transition-colors leading-none">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="4" x2="4" y2="12"/><line x1="4" y1="4" x2="12" y2="12"/>
            </svg>
          </button>
          <button onClick={accept} className="bg-teal-500 hover:bg-teal-400 active:bg-teal-600 text-white font-semibold text-sm px-4 py-2 rounded-xl transition-colors whitespace-nowrap">Хорошо</button>
        </div>
      </div>
    </div>
  )
}
