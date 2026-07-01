import type { Metadata } from 'next'
import ServiceCenterLeadForm from '@/components/service-center/ServiceCenterLeadForm'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Сервисный центр Ladoga Boat — сервис катеров в Сортавале',
  description:
    'Сервисный центр маломерного флота в Сортавале, Карелия: техническое обслуживание, ремонт, хранение, мойка и дооборудование катеров. Открывается на Ладожском озере.',
  alternates: { canonical: '/service-center' },
}

const SERVICE_BLOCKS = [
  {
    icon: '🔧',
    title: 'Техническое обслуживание и ремонт',
    items: [
      { name: 'Плановое ТО мотора', price: 'от 9 000 ₽' },
      { name: 'Консервация и расконсервация', price: 'от 8 000 ₽' },
      { name: 'Корпусный ремонт', price: 'от 15 000 ₽' },
    ],
  },
  {
    icon: '🏠',
    title: 'Хранение',
    items: [
      { name: 'Сезонное хранение (5 мес.)', price: 'от 15 000 ₽' },
      { name: 'Подготовка к зимовке', price: 'индивидуально' },
    ],
  },
  {
    icon: '✨',
    title: 'Мойка и детейлинг',
    items: [
      { name: 'Мойка и химчистка', price: 'от 8 000 ₽' },
      { name: 'Полировка корпуса', price: 'от 15 000 ₽' },
      { name: 'Антифаулинг (защита днища)', price: 'от 15 000 ₽' },
    ],
  },
  {
    icon: '🛰️',
    title: 'Дооборудование',
    items: [
      { name: 'Эхолот, навигация, тент', price: 'от 8 000 ₽' },
    ],
  },
  {
    icon: '🚚',
    title: 'Транспортировка',
    items: [
      { name: 'Доставка катера к сервису', price: 'индивидуально' },
      { name: 'Ремонт на воде', price: 'от 15 000 ₽' },
    ],
  },
]

export default function ServiceCenterPage() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: 'Сервисный центр Ladoga Boat',
    description: metadata.description,
    url: `${SITE_URL}/service-center`,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Сортавала',
      addressRegion: 'Республика Карелия',
      addressCountry: 'RU',
    },
  }

  return (
    <div className="py-12 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12">
          <span className="inline-block bg-blue-50 text-blue-700 text-sm font-medium px-4 py-1.5 rounded-full mb-4">
            Скоро открытие · Сортавала, Карелия
          </span>
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-800 mb-4">
            Сервисный центр Ladoga Boat
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Первый специализированный сервис маломерного флота на Ладоге — техническое обслуживание,
            ремонт, хранение и подготовка катеров к сезону. Ни одного похожего сервиса в радиусе 170 км.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl mb-2">📍</div>
            <p className="font-medium text-slate-800">Сортавала</p>
            <p className="text-slate-500 text-sm">Участок у воды на Ладожском озере</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-2xl p-6 text-center shadow-sm">
            <div className="text-3xl mb-2">🗺️</div>
            <p className="font-medium text-slate-800">0 конкурентов</p>
            <p className="text-slate-500 text-sm">В радиусе 170 км нет ни одного специализированного сервиса</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold text-slate-800 mb-6 text-center">Услуги и цены</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-4">
          {SERVICE_BLOCKS.map((block) => (
            <div key={block.title} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">{block.icon}</span>
                <h3 className="font-semibold text-slate-800">{block.title}</h3>
              </div>
              <ul className="space-y-2">
                {block.items.map((item) => (
                  <li key={item.name} className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">{item.name}</span>
                    <span className="text-slate-800 font-medium whitespace-nowrap ml-3">{item.price}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="text-slate-400 text-xs text-center mb-12">
          Цены ориентировочные и могут уточняться после открытия центра.
        </p>

        <div className="bg-white border border-slate-100 rounded-2xl shadow-sm p-8 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-slate-800 mb-2 text-center">Оставить заявку</h2>
          <p className="text-slate-500 text-sm mb-6 text-center">
            Сообщим, когда сервисный центр откроется, и ответим на вопросы
          </p>
          <ServiceCenterLeadForm />
        </div>
      </div>
    </div>
  )
}
