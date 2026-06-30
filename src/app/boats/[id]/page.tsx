import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import BookingForm from '@/components/booking/BookingForm'
import { SITE_URL } from '@/lib/seo'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const boat = await prisma.boat.findUnique({
    where: { id },
    select: { title: true, description: true, location: true, images: true, capacity: true, pricePerDay: true },
  })

  if (!boat) return {}

  const title = `${boat.title} — аренда катера, ${boat.location}`
  const description = `${boat.description.slice(0, 150)}... Вместимость до ${boat.capacity} чел., от ${Number(boat.pricePerDay).toLocaleString('ru-RU')} ₽/день. Бронирование онлайн.`
  const image = boat.images[0]

  return {
    title,
    description,
    alternates: { canonical: `/boats/${id}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/boats/${id}`,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function BoatDetailPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()

  let boat
  try {
    boat = await prisma.boat.findUnique({
      where: { id },
      include: {
        owner: { select: { name: true, phone: true } },
        reviews: {
          include: { guest: { select: { name: true } } },
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { reviews: true } },
      },
    })
  } catch {
    notFound()
  }

  if (!boat || boat.status === 'INACTIVE') notFound()

  const avgRating =
    boat.reviews.length > 0
      ? boat.reviews.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / boat.reviews.length
      : 0

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: boat.title,
    description: boat.description,
    image: boat.images,
    url: `${SITE_URL}/boats/${boat.id}`,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: Number(boat.pricePerDay),
      availability: 'https://schema.org/InStock',
      url: `${SITE_URL}/boats/${boat.id}`,
    },
    ...(boat.reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: boat.reviews.length,
      },
    }),
  }

  return (
    <div className="py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="max-w-7xl mx-auto">
        {/* Images */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 rounded-2xl overflow-hidden">
          {boat.images.length === 0 ? (
            <div className="col-span-2 h-64 bg-slate-200 flex items-center justify-center text-6xl">⛵</div>
          ) : (
            boat.images.slice(0, 4).map((img, i) => (
              <div key={i} className={`${i === 0 ? 'md:col-span-2 h-72' : 'h-48'} bg-slate-100 overflow-hidden`}>
                <img src={img} alt={`${boat!.title} фото ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details */}
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-semibold text-slate-800">{boat.title}</h1>
              {avgRating > 0 && (
                <span className="flex items-center gap-1 text-amber-500 font-semibold text-lg ml-4 shrink-0">
                  ★ {avgRating.toFixed(1)}
                  <span className="text-slate-400 font-normal text-sm">({boat._count.reviews})</span>
                </span>
              )}
            </div>
            <p className="text-slate-500 mb-1">📍 {boat.location}</p>
            <p className="text-slate-500 mb-6">👥 до {boat.capacity} человек</p>

            <div className="border-t border-slate-100 pt-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">О катере</h2>
              <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{boat.description}</p>
            </div>

            {boat.routes.length > 0 && (
              <div className="border-t border-slate-100 pt-6 mb-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-3">Маршруты</h2>
                <div className="flex flex-wrap gap-2">
                  {boat.routes.map((r) => (
                    <span key={r} className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      🗺️ {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-slate-100 pt-6 mb-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-2">Судовладелец</h2>
              <p className="text-slate-600">👤 {boat.owner.name}</p>
            </div>

            {/* Reviews */}
            <div className="border-t border-slate-100 pt-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-4">
                Отзывы {boat.reviews.length > 0 && `(${boat.reviews.length})`}
              </h2>
              {boat.reviews.length === 0 ? (
                <p className="text-slate-400">Отзывов пока нет. Будьте первым!</p>
              ) : (
                <div className="space-y-4">
                  {boat.reviews.map((review) => (
                    <div key={review.id} className="bg-slate-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-800">{review.guest.name}</span>
                        <span className="text-amber-500 font-semibold">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
                      </div>
                      <p className="text-slate-600 text-sm">{review.comment}</p>
                      <p className="text-slate-400 text-xs mt-2">
                        {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Booking */}
          <div>
            <div className="sticky top-24">
              <div className="text-2xl font-semibold text-slate-800 mb-1">
                {Number(boat.pricePerDay).toLocaleString('ru-RU')} ₽
                <span className="text-base font-normal text-slate-500"> / день</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">Оплата картой или через СБП</p>
              <BookingForm
                boatId={boat.id}
                pricePerDay={Number(boat.pricePerDay)}
                isLoggedIn={!!session}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
