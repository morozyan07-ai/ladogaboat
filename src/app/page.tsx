import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import SearchForm from '@/components/boats/SearchForm'
import IntroOverlay from '@/components/IntroOverlay'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const SEP = { borderTop: '0.5px solid rgba(255,255,255,0.07)' }

export default function HomePage() {
  return (
    <>
      <IntroOverlay />

      {/* ─── Hero ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="relative z-10 w-full py-20 sm:py-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-14">
            <div className="max-w-xl lg:max-w-2xl">

              <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 bg-teal-400/10 border border-teal-400/20 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span className="text-teal-300 text-xs font-semibold uppercase tracking-widest">
                  Ладожские шхеры · Карелия
                </span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
                Аренда катеров<br />
                <span className="text-teal-300">на Ладоге</span>
              </h1>

              <p className="text-slate-300 text-xl mb-10 max-w-md leading-relaxed">
                Шхеры, Валаам, дикие острова — с проверенным капитаном или самостоятельно.
              </p>

              <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-5 sm:p-6">
                <Suspense fallback={<div className="h-16 bg-slate-50 rounded-xl animate-pulse" />}>
                  <SearchForm />
                </Suspense>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-7">
                <div className="flex items-center gap-1.5">
                  <span className="text-yellow-400 text-sm">★★★★★</span>
                  <span className="text-slate-300 text-sm">Проверенные капитаны</span>
                </div>
                <span className="hidden sm:block w-px h-3.5 bg-slate-600" />
                <span className="text-slate-400 text-sm">Оплата онлайн</span>
                <span className="hidden sm:block w-px h-3.5 bg-slate-600" />
                <span className="text-slate-400 text-sm">Мгновенное подтверждение</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Три шага ─── */}
      <section className="py-20 sm:py-28 px-6" style={SEP}>
        <div className="max-w-7xl mx-auto">
          <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
            Просто и понятно
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-16 max-w-md">
            Три шага до Ладоги
          </h2>
          <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
            {[
              { n: '01', title: 'Найдите катер', desc: 'Выберите дату, время и подходящий катер из каталога. Фильтры по вместимости и маршруту.' },
              { n: '02', title: 'Забронируйте', desc: 'Оформите онлайн — оплата картой или через СБП. Подтверждение придёт мгновенно.' },
              { n: '03', title: 'Отправляйтесь', desc: 'Свяжитесь с капитаном и отправляйтесь. Поддержка работает 24/7.' },
            ].map(({ n, title, desc }) => (
              <div key={n}>
                <div className="text-7xl font-black text-teal-500/20 mb-5 leading-none">{n}</div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Факты ─── */}
      <section className="py-20 px-6" style={SEP}>
        <div className="max-w-7xl mx-auto">
          <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
            Почему Ладога
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-12 max-w-lg">
            Крупнейшее озеро Европы — у вас за рулём
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { stat: '17 891', unit: 'км²', label: 'площадь воды — больше Израиля' },
              { stat: '660', unit: '+', label: 'островов, включая Валаам' },
              { stat: '230', unit: 'м', label: 'максимальная глубина' },
              { stat: '4–5', unit: 'м', label: 'прозрачность воды в шхерах' },
            ].map(({ stat, unit, label }) => (
              <div key={stat} className="rounded-none" style={{ borderTop: '1px solid rgba(200,150,90,0.25)', paddingTop: '20px' }}>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-3xl font-bold text-white">{stat}</span>
                  <span className="text-teal-400 font-semibold">{unit}</span>
                </div>
                <p className="text-slate-400 text-sm leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Судовладельцы ─── */}
      <section className="py-20 px-6" style={SEP}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
            <div className="flex-1">
              <p className="text-teal-400 text-xs font-bold uppercase tracking-widest mb-4">
                Для судовладельцев
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                Зарабатывайте на Ладоге
              </h2>
              <p className="text-slate-300 text-lg max-w-lg leading-relaxed">
                Разместите катер бесплатно и получайте заявки от тысяч туристов.
                Онлайн‑оплата, аналитика, поддержка 24/7.
              </p>
            </div>
            <Link
              href="/auth/register?role=OWNER"
              className="shrink-0 inline-flex items-center gap-3 bg-teal-400 text-slate-900 font-bold px-8 py-4 rounded-xl hover:bg-teal-300 transition-colors text-lg"
            >
              Разместить катер
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
