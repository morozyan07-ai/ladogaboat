import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <p className="text-sm text-slate-400">
              Платформа для аренды катеров на Ладожском озере. Незабываемые водные приключения ждут вас.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Навигация</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/boats" className="hover:text-white transition-colors">Каталог катеров</Link></li>
              <li><Link href="/service-center" className="hover:text-white transition-colors">Сервисный центр</Link></li>
              <li><Link href="/auth/register" className="hover:text-white transition-colors">Зарегистрироваться</Link></li>
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Войти</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Для судовладельцев</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/register?role=OWNER" className="hover:text-white transition-colors">Разместить катер</Link></li>
              <li><Link href="/dashboard/owner" className="hover:text-white transition-colors">Управление бронированиями</Link></li>
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
          <p className="text-xs text-slate-500 text-center mb-4">
            ИП Морозов Владимир Владимирович · ИНН 110110795542 · ОГРНИП 322623400017352
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <span className="text-lg">⛵</span>
              <span>© {new Date().getFullYear()} Ladoga Boat</span>
            </div>
            <span className="text-slate-600">Сайт создан на Next.js</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
