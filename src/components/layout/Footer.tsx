import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-semibold text-white mb-4">Для судовладельцев</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register?role=OWNER" className="hover:text-white transition-colors">Разместить катер</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Войти в личный кабинет</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Документы</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/legal/oferta" className="hover:text-white transition-colors">Публичная оферта</Link></li>
              <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Обработка персональных данных</Link></li>
              <li><Link href="/support" className="hover:text-white transition-colors">Поддержка</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8">
          <div className="flex flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} Ladoga Boat</span>
            <span className="text-center">ИП Морозов Владимир Владимирович · ИНН 110110795542 · ОГРНИП 322623400017352</span>
            <span className="text-slate-600">Сайт создан на Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
