import Link from 'next/link'
import { Suspense } from 'react'
import prisma from '@/lib/prisma'
import BoatCard from '@/components/boats/BoatCard'
import SearchForm from '@/components/boats/SearchForm'
import WaterTaxiSection from '@/components/taxi/WaterTaxiSection'
import type { Boat } from '@/types'

async function getFeaturedBoats(): Promise<Boat[]> {
  try {
    const boats = await prisma.boat.findMany({
      where: { status: 'ACTIVE' },
      take: 6,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: { select: { name: true } },
        reviews: { select: { rating: true } },
        _count: { select: { reviews: true } },
      },
    })
    return boats.map((b) => {
      const { reviews, ...rest } = b
      return {
        ...rest,
        pricePerDay: Number(b.pricePerDay),
        avgRating:
          reviews.length > 0
            ? reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / reviews.length
            : 0,
      }
    })
  } catch {
    return []
  }
}

const routes = ['Валаам', 'Коневец', 'Шхеры', 'Приозерск', 'Сортавала', 'Питкяранта']

export default async function HomePage() {
  const boats = await getFeaturedBoats()

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 text-white py-20 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
            Аренда катеров<br />
            <span className="text-teal-300">на Ладожском озере</span>
          </h1>
          <p className="text-blue-100 text-lg sm:text-xl mb-10 max-w-2xl mx-auto">
            Откройте для себя острова Валаам и Коневец, карельские шхеры и живописные заливы.
            Более 50 катеров от проверенных судовладельцев.
          </p>
          <div className="max-w-4xl mx-auto">
            <Suspense fallback={<div className="h-24 bg-white/10 rounded-2xl animate-pulse" />}>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </section>

      {/* Popular routes */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Популярные маршруты</h2>
          <div className="flex flex-wrap gap-3">
            {routes.map((route) => (
              <Link
                key={route}
                href={`/boats?location=${encodeURIComponent(route)}`}
                className="px-4 py-2 bg-blue-50 text-blue-700 rounded-full hover:bg-blue-100 transition-colors font-medium text-sm"
              >
                📍 {route}
              </Link>
            ))}
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
            <h2 className="text-2xl font-bold text-slate-900">Водное такси</h2>
            <p className="text-slate-500 mt-1">
              Поставьте точки отправления и прибытия — мы рассчитаем маршрут, время и стоимость.
            </p>
          </div>
          <WaterTaxiSection />
        </div>
      </section>

      {/* Featured boats */}
      <section className="py-12 px-4 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-slate-900">Новые катера</h2>
            <Link href="/boats" className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Смотреть все →
            </Link>
          </div>
          {boats.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-4">⛵</div>
              <p className="text-lg">Катера ещё не добавлены</p>
              <Link href="/auth/register?role=OWNER" className="mt-4 inline-block text-blue-600 hover:underline">
                Стать судовладельцем →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boats.map((boat) => (
                <BoatCard key={boat.id} boat={boat} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-12">Как это работает</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: '🔍', title: 'Найдите катер', desc: 'Выберите дату, маршрут и подходящий катер из каталога' },
              { icon: '📋', title: 'Забронируйте', desc: 'Оформите бронирование онлайн. Платформа берёт 10% комиссию' },
              { icon: '⛵', title: 'Отправляйтесь', desc: 'Свяжитесь с судовладельцем и отправляйтесь в путь' },
            ].map(({ icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="text-5xl mb-4">{icon}</div>
                <h3 className="font-bold text-slate-900 text-lg mb-2">{title}</h3>
                <p className="text-slate-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA for owners */}
      <section className="py-16 px-4 bg-blue-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Вы судовладелец?</h2>
          <p className="text-blue-100 mb-8 text-lg">
            Разместите свой катер на платформе и получайте стабильный доход. Регистрация бесплатна.
          </p>
          <Link
            href="/auth/register?role=OWNER"
            className="inline-block bg-white text-blue-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            Разместить катер
          </Link>
        </div>
      </section>
    </>
  )
}
