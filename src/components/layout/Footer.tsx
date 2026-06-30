import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">⛵</span>
              <span className="text-xl font-bold text-white">Ladoga Boat</span>
            </div>
            <p className="text-sm text-slate-400">
              Платформа для аренды катеров на Ладожском озере. Незабываемые водные приключения ждут вас.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-white mb-4">Навигация</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/boats" className="hover:text-white transition-colors">Каталог катеров</Link></li>
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
        </div>
        <div className="border-t border-slate-700 mt-8 pt-8 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} Ladoga Boat. Комиссия платформы 10%.
        </div>
      </div>
    </footer>
  )
}
