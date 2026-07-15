import Link from 'next/link'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import SearchForm from '@/components/boats/SearchForm'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return (
    <>
      {/* ─── Hero — ЛАДОГА текст-маска ─── */}
      <section className="relative min-h-screen bg-[#06080f] flex flex-col overflow-hidden">
        {/* Фоновый градиент */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#08101a] via-[#06080f] to-[#080610] pointer-events-none" />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-14 flex flex-col min-h-screen py-8">
          {/* Подпись сверху */}
          <div className="pt-4">
            <p className="text-[#4aa0af]/60 text-xs tracking-[0.22em] uppercase font-medium">
              Ладожское озеро&nbsp;·&nbsp;Шхеры&nbsp;·&nbsp;Карелия&nbsp;·&nbsp;Валаам
            </p>
          </div>

          {/* Текст-маска */}
          <div className="flex-1 flex flex-col justify-center">
            <h1
              className="bg-clip-text text-transparent select-none"
              style={{
                fontFamily: 'var(--font-display), Arial Black, sans-serif',
                fontSize: 'clamp(80px, 22vw, 300px)',
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: '-0.04em',
                backgroundImage: 'url(/hero/winter.jpg)',
                backgroundSize: '130% auto',
                backgroundPosition: 'center 40%',
                filter: 'none',
              }}
            >
              ЛАДОГА
            </h1>
            <p className="text-white/20 text-sm tracking-[0.35em] uppercase ml-1 mt-6 font-medium">
              — аренда катеров
            </p>
          </div>

          {/* Нижняя панель */}
          <div className="pb-10 flex flex-col sm:flex-row gap-6 items-start sm:items-end justify-between">
            <div>
              <p className="text-white/35 text-sm leading-relaxed max-w-xs">
                Шхеры, Валаам, дикие острова —<br />
                с проверенным капитаном или самостоятельно.
              </p>
              <div className="flex flex-wrap gap-x-5 gap-y-1 mt-4 text-xs text-white/20">
                <span>★★★★★ Проверенные капитаны</span>
                <span>· Оплата онлайн</span>
                <span>· Мгновенное подтверждение</span>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <Link
                href="/boats"
                className="bg-[#c8965a] text-[#06080f] font-bold px-8 py-4 rounded-xl text-sm tracking-wide hover:bg-[#d4a568] transition-colors"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                ЗАБРОНИРОВАТЬ
              </Link>
              <Link
                href="/boats"
                className="border border-white/15 text-white/50 hover:text-white hover:border-white/30 px-8 py-4 rounded-xl text-sm transition-colors"
                style={{ fontFamily: 'var(--font-sans)' }}
              >
                Каталог →
              </Link>
            </div>
          </div>
        </div>

        {/* Индикатор скролла */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20 pointer-events-none">
          <div className="w-px h-10 bg-white animate-pulse" />
        </div>
      </section>

      {/* ─── Форма поиска ─── */}
      <section className="bg-[#080c14] py-12 px-6 border-y border-white/[0.04]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#4aa0af]/60 text-xs tracking-[0.18em] uppercase mb-5">Найти катер</p>
          <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6">
            <Suspense fallback={<div className="h-14 bg-slate-50 rounded-xl animate-pulse" />}>
              <SearchForm />
            </Suspense>
          </div>
        </div>
      </section>

      {/* ─── Три шага ─── */}
      <section className="py-20 sm:py-28 px-6 bg-[#06080f]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#4aa0af]/60 text-xs font-bold uppercase tracking-widest mb-4">
            Просто и понятно
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-16 max-w-md"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            Три шага до Ладоги
          </h2>
          <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
            {[
              { n: '01', title: 'Найдите катер', desc: 'Выберите дату, время и подходящий катер из каталога. Фильтры по вместимости и маршруту.' },
              { n: '02', title: 'Забронируйте', desc: 'Оформите онлайн — оплата картой или через СБП. Подтверждение придёт мгновенно.' },
              { n: '03', title: 'Отправляйтесь', desc: 'Свяжитесь с капитаном и отправляйтесь. Поддержка работает 24/7.' },
            ].map(({ n, title, desc }) => (
              <div key={n}>
                <div
                  className="text-7xl font-black leading-none mb-5"
                  style={{ color: 'rgba(200,150,90,0.12)', fontFamily: 'var(--font-display), sans-serif' }}
                >
                  {n}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p className="text-white/30 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Факты о Ладоге ─── */}
      <section className="py-20 px-6 bg-[#080c14]">
        <div className="max-w-7xl mx-auto">
          <p className="text-[#4aa0af]/60 text-xs font-bold uppercase tracking-widest mb-4">
            Почему Ладога
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-12 max-w-lg"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            Крупнейшее озеро Европы — у вас за рулём
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { stat: '17 891', unit: 'км²', label: 'площадь воды — больше Израиля' },
              { stat: '660', unit: '+', label: 'островов, включая Валаам' },
              { stat: '230', unit: 'м', label: 'максимальная глубина' },
              { stat: '4–5', unit: 'м', label: 'прозрачность воды в шхерах' },
            ].map(({ stat, unit, label }) => (
              <div
                key={stat}
                className="rounded-2xl p-6"
                style={{ background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-baseline gap-1 mb-2">
                  <span
                    className="text-3xl font-bold text-white"
                    style={{ fontFamily: 'var(--font-display), sans-serif' }}
                  >
                    {stat}
                  </span>
                  <span className="text-[#c8965a] font-semibold">{unit}</span>
                </div>
                <p className="text-white/30 text-sm leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA для судовладельцев ─── */}
      <section
        className="py-20 px-6"
        style={{ background: '#06080f', borderTop: '0.5px solid rgba(255,255,255,0.04)' }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
            <div className="flex-1">
              <p className="text-[#4aa0af]/60 text-xs font-bold uppercase tracking-widest mb-4">
                Для судовладельцев
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                Зарабатывайте на Ладоге
              </h2>
              <p className="text-white/30 text-lg max-w-lg leading-relaxed">
                Разместите катер бесплатно и получайте заявки от тысяч туристов.
                Онлайн-оплата, аналитика, поддержка 24/7.
              </p>
            </div>
            <Link
              href="/auth/register?role=OWNER"
              className="shrink-0 inline-flex items-center gap-3 font-bold px-8 py-4 rounded-xl text-base transition-colors"
              style={{
                background: '#c8965a',
                color: '#06080f',
                fontFamily: 'var(--font-sans)',
              }}
            >
              Разместить катер →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
