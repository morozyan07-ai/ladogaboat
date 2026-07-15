import Link from 'next/link'
import type { Metadata } from 'next'
import HeroSearch from '@/components/HeroSearch'

export const metadata: Metadata = {
  alternates: { canonical: '/' },
}

const SEP: React.CSSProperties = { borderTop: '0.5px solid rgba(255,255,255,0.06)' }

export default function HomePage() {
  return (
    <>
      {/* ─── Hero — ЛАДОГА текст-маска ─── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(8,16,26,0.5) 0%, transparent 70%)' }} />

        <div className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-14 flex flex-col min-h-screen py-8">
          {/* Подпись сверху */}
          <div className="pt-4 w-full">
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              color: 'rgba(74,160,175,0.65)', fontSize: '11px',
              letterSpacing: '0.14em', textTransform: 'uppercase', fontWeight: 500,
            }}>
              <span>Ладожское озеро</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Шхеры</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Карелия</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>Валаам</span>
            </div>
          </div>

          {/* Текст-маска */}
          <div className="flex-1 flex flex-col justify-center">
            <h1
              className="select-none"
              style={{
                fontFamily: 'var(--font-display), Arial Black, sans-serif',
                fontSize: 'clamp(80px, 22vw, 300px)',
                fontWeight: 900,
                lineHeight: 0.88,
                letterSpacing: '-0.04em',
                backgroundImage: "url('/hero/ladoga-summer.jpg'), linear-gradient(150deg, #d4b87a 0%, #6ab8cc 45%, #4a9eb8 70%, #c8a060 100%)",
                backgroundSize: '140% auto, cover',
                backgroundPosition: 'center 30%, center',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
              }}
            >
              ЛАДОГА
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: '13px', letterSpacing: '0.35em' }}
              className="uppercase ml-1 mt-5 font-medium">
              — аренда катеров
            </p>

            {/* Airbnb-стиль поиск */}
            <div className="mt-7">
              <HeroSearch />
            </div>
          </div>

          {/* Нижняя панель */}
          <div className="pb-10">
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', lineHeight: 1.7 }}
              className="max-w-xs">
              Шхеры, Валаам, дикие острова —<br />
              с проверенным капитаном или самостоятельно.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-1 mt-3"
              style={{ fontSize: '11px', color: 'rgba(255,255,255,0.18)' }}>
              <span>★★★★★ Проверенные капитаны</span>
              <span>· Оплата онлайн</span>
              <span>· Мгновенное подтверждение</span>
            </div>
          </div>
        </div>

        {/* Индикатор скролла */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-20 pointer-events-none">
          <div className="w-px h-10 bg-white animate-pulse" />
        </div>
      </section>

      {/* ─── Три шага ─── */}
      <section className="py-20 sm:py-28 px-6" style={SEP}>
        <div className="max-w-7xl mx-auto">
          <p style={{ color: 'rgba(74,160,175,0.6)', fontSize: '11px', letterSpacing: '0.18em' }}
            className="uppercase font-bold mb-4">
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
                  style={{ color: 'rgba(200,150,90,0.7)', fontFamily: 'var(--font-display), sans-serif' }}
                >
                  {n}
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.3)' }} className="leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Факты о Ладоге ─── */}
      <section className="py-20 px-6" style={SEP}>
        <div className="max-w-7xl mx-auto">
          <p style={{ color: 'rgba(74,160,175,0.6)', fontSize: '11px', letterSpacing: '0.18em' }}
            className="uppercase font-bold mb-4">
            Почему Ладога
          </p>
          <h2
            className="text-3xl sm:text-4xl font-bold text-white mb-12 max-w-lg"
            style={{ fontFamily: 'var(--font-display), sans-serif' }}
          >
            Крупнейшее озеро Европы — у вас за штурвалом
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
                  <span style={{ color: '#c8965a' }} className="font-semibold">{unit}</span>
                </div>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }} className="leading-snug">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA для судовладельцев ─── */}
      <section className="py-20 px-6" style={SEP}>
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-10">
            <div className="flex-1">
              <p style={{ color: 'rgba(74,160,175,0.6)', fontSize: '11px', letterSpacing: '0.18em' }}
                className="uppercase font-bold mb-4">
                Для судовладельцев
              </p>
              <h2
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-display), sans-serif' }}
              >
                Зарабатывайте на Ладоге
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '17px', lineHeight: 1.7 }} className="max-w-lg">
                Разместите катер бесплатно и получайте заявки от тысяч туристов.
                Онлайн-оплата, аналитика, поддержка 24/7.
              </p>
            </div>
            <Link
              href="/auth/register?role=OWNER"
              className="shrink-0 inline-flex items-center gap-3 font-bold px-8 py-4 rounded-xl text-base transition-colors"
              style={{ background: '#c8965a', color: '#06080f', fontFamily: 'var(--font-sans)' }}
            >
              Разместить катер →
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
