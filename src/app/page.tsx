import Link from 'next/link'
import { Suspense } from 'react'
import SearchForm from '@/components/boats/SearchForm'
import WaterTaxiSection from '@/components/taxi/WaterTaxiSection'
import HeroBackground from '@/components/layout/HeroBackground'

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative text-white py-20 px-4">
        <HeroBackground />
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold mb-6 leading-tight">
            Аренда катеров<br />
            <span className="text-teal-300">на Ладожском озере</span>
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Откройте для себя Ладожские шхеры, остров Валаам и живописные заливы.
            Более 50 катеров от проверенных судовладельцев.
          </p>
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<div className="h-24 bg-white/10 rounded-2xl animate-pulse" />}>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Water taxi calculator */}
      <section className="py-14 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-700 text-sm font-semibold px-3 py-1 rounded-full mb-3">
              🚤 Новое
            </div>
            <h2 className="text-2xl font-semibold text-slate-800">Водное такси</h2>
            <p className="text-slate-500 mt-1">
              Поставьте точки отправления и прибытия — мы рассчитаем маршрут, время и стоимость.
            </p>
          </div>
          <WaterTaxiSection />
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-semibold text-slate-800 text-center mb-12">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Найдите катер', desc: 'Выберите дату, время и подходящий катер из каталога' },
              { icon: '📋', title: 'Забронируйте', desc: 'Оформите бронирование онлайн и оплатите картой или через СБП' },
              { icon: '⛵', title: 'Отправляйтесь', desc: 'Свяжитесь с судовладельцем и отправляйтесь в путь' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="font-semibold text-slate-800 text-lg mb-2">{title}</h3>
                <p className="text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for owners */}
      <section className="py-16 px-4 bg-blue-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-semibold mb-4">Вы судовладелец?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Разместите свой катер на платформе и получайте стабильный доход. Регистрация бесплатна.
          </p>
          <Link
            href="/auth/register?role=OWNER"
            className="inline-block bg-white text-blue-700 font-semibold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            Разместить катер
          </Link>
        </div>
      </section>
    </>
  )
}
