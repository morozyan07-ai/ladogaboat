import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'О нас — Ladoga Boat',
  description:
    'Ladoga Boat — платформа аренды катеров на Ладожском озере. Собрали все катера в одном месте вместо поиска по соцсетям.',
  alternates: { canonical: '/about' },
}

export default function AboutPage() {
  return (
    <div className="bg-white">
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[360px] flex items-end overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/winter.jpg"
          alt="Ладожское озеро — природа Карелии"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/85 via-slate-900/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12 w-full">
          <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight">
            Ладога ближе,<br />чем кажется
          </h1>
          <p className="mt-4 text-blue-100 text-lg max-w-2xl">
            Мы создали платформу, чтобы найти и арендовать катер на Ладоге
            было так же просто, как забронировать отель.
          </p>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-16">

        {/* Идея */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Как это началось</h2>
          <div className="prose prose-lg text-slate-600 space-y-4">
            <p>
              До Ladoga Boat поиск катера на Ладоге выглядел так:
              открываешь Instagram, ВКонтакте, листаешь группы, пишешь в личку десяткам людей,
              ждёшь ответа, договариваешься об оплате переводом на карту
              — и ещё не знаешь, приедет ли вообще.
            </p>
            <p>
              Мы сами так искали. И решили это починить.
            </p>
            <p>
              Ladoga Boat — место, где все проверенные судовладельцы Карелии
              и Ленинградской области собраны в одном каталоге.
              Онлайн-бронирование, оплата картой или СБП, подтверждение на почту —
              ничего лишнего.
            </p>
          </div>
        </section>

        {/* Миссия */}
        <section className="grid sm:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 mb-6">Наша миссия</h2>
            <div className="prose prose-lg text-slate-600 space-y-4">
              <p>
                Сделать путешествие по Ладоге простым и доступным для каждого.
              </p>
              <p>
                Ладога — не курорт. Здесь нет туристической инфраструктуры,
                которая сама ведёт тебя за руку. Но в этом и есть её ценность:
                дикая природа, тишина шхер, рассвет над гранитными скалами.
              </p>
              <p>
                Мы берём на себя организационную часть — поиск, бронирование, оплату —
                чтобы вы могли сосредоточиться на главном.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: '1', label: 'место для поиска катеров на Ладоге' },
              { num: '8%', label: 'комиссия сервиса — без скрытых сборов' },
              { num: '24/7', label: 'поддержка через Telegram и WhatsApp' },
              { num: '0', label: 'регистрация не нужна для бронирования' },
            ].map((s) => (
              <div key={s.label} className="bg-slate-50 rounded-2xl p-5">
                <div className="text-2xl font-bold text-blue-700 mb-1">{s.num}</div>
                <div className="text-sm text-slate-500 leading-snug">{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Как мы работаем */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-8">Как это работает</h2>
          <div className="space-y-6">
            {[
              {
                step: '01',
                title: 'Выбираете катер',
                desc: 'Каталог с реальными фото, характеристиками и ценами. Фильтрация по дате, вместимости, типу катера.',
              },
              {
                step: '02',
                title: 'Бронируете без регистрации',
                desc: 'Укажите имя, телефон и почту. Никаких аккаунтов — если вы приехали просто покататься.',
              },
              {
                step: '03',
                title: 'Оплачиваете онлайн',
                desc: 'Картой или СБП через ЮKassa. Деньги зачисляются судовладельцу за вычетом комиссии сервиса 8%.',
              },
              {
                step: '04',
                title: 'Получаете подтверждение',
                desc: 'Код бронирования на почту и СМС. Судовладелец получает уведомление и свяжется с вами для уточнения деталей.',
              },
            ].map((s) => (
              <div key={s.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-700 font-bold text-sm">{s.step}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 text-lg mb-1">{s.title}</h3>
                  <p className="text-slate-600">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Команда */}
        <section>
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Команда</h2>
          <div className="prose prose-lg text-slate-600 space-y-4">
            <p>
              Нас сделали люди, влюблённые в Карелию.
              Мы проводим здесь каждое лето — в шхерах, на островах, с удочкой
              и термосом. Мы знаем эти места и знаем, как важно попасть на воду
              без лишней суеты.
            </p>
            <p>
              Ladoga Boat зарегистрирован как ИП Морозов Владимир Владимирович,
              ИНН 110110795542. Мы работаем в соответствии с российским
              законодательством и платим налоги в Республике Карелия.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-br from-blue-700 to-teal-700 rounded-3xl p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
            Хотите разместить катер?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Зарегистрируйтесь как судовладелец — бесплатно и без бумажной волокиты.
            Мы помогаем с первым размещением.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/register?role=OWNER"
              className="inline-block bg-white text-blue-700 font-semibold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
              Разместить катер
            </Link>
            <Link
              href="/boats"
              className="inline-block border border-white/40 text-white font-semibold px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Смотреть катера
            </Link>
          </div>
        </section>

      </div>
    </div>
  )
}
