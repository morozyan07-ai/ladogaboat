export const dynamic = 'force-dynamic'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'
import BookingForm from '@/components/booking/BookingForm'
import { SITE_URL } from '@/lib/seo'

type Props = { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const rows = await sql`
    SELECT title, description, location, images, capacity, "pricePerDay"
    FROM "Boat" WHERE id = ${id} LIMIT 1`
  if (!rows.length) return {}

  const boat = rows[0] as Record<string, unknown>
  const title = `${boat.title} — аренда катера, ${boat.location}`
  const description = `${String(boat.description).slice(0, 150)}... Вместимость до ${boat.capacity} чел., от ${Number(boat.pricePerDay).toLocaleString('ru-RU')} ₽/день. Бронирование онлайн.`
  const image = (boat.images as string[])[0]

  return {
    title,
    description,
    alternates: { canonical: `/boats/${id}` },
    openGraph: {
      title, description, url: `${SITE_URL}/boats/${id}`,
      images: image ? [image] : undefined,
    },
    twitter: {
      card: 'summary_large_image', title, description,
      images: image ? [image] : undefined,
    },
  }
}

export default async function BoatDetailPage({ params }: Props) {
  const { id } = await params
  const session = await getSession()

  let boat: Record<string, unknown> | undefined
  let reviews: Record<string, unknown>[] = []
  try {
    const boatRows = await sql`
      SELECT b.*, u.name as "ownerName", u.phone as "ownerPhone", COUNT(r.id)::int as "reviewCount"
      FROM "Boat" b
      JOIN "User" u ON u.id = b."ownerId"
      LEFT JOIN "Review" r ON r."boatId" = b.id
      WHERE b.id = ${id}
      GROUP BY b.id, u.name, u.phone`
    if (!boatRows.length) notFound()
    boat = boatRows[0] as Record<string, unknown>

    reviews = await sql`
      SELECT r.*, g.name as "guestName"
      FROM "Review" r
      LEFT JOIN "User" g ON g.id = r."guestId"
      WHERE r."boatId" = ${id}
      ORDER BY r."createdAt" DESC` as Record<string, unknown>[]
  } catch {
    notFound()
  }

  if (!boat || boat.status === 'INACTIVE') notFound()

  const avgRating = reviews.length > 0
    ? reviews.reduce((s, r) => s + Number(r.rating), 0) / reviews.length
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
    ...(reviews.length > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating.toFixed(1),
        reviewCount: reviews.length,
      },
    }),
  }

  return (
    <div className="py-8 px-4">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8 rounded-2xl overflow-hidden">
          {!(boat.images as string[]).length ? (
            <div className="col-span-2 h-64 bg-white/10 flex items-center justify-center text-6xl">⛵</div>
          ) : (
            (boat.images as string[]).slice(0, 4).map((img, i) => (
              <div key={i} className={`${i === 0 ? 'md:col-span-2 h-72' : 'h-48'} bg-white/10 overflow-hidden`}>
                <img src={img} alt={`${boat!.title} фото ${i + 1}`} className="w-full h-full object-cover" />
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-3xl font-semibold text-white">{boat.title as string}</h1>
              {avgRating > 0 && (
                <span className="flex items-center gap-1 text-amber-400 font-semibold text-lg ml-4 shrink-0">
                  ★ {avgRating.toFixed(1)}
                  <span className="text-slate-300 font-normal text-sm">({boat.reviewCount as number})</span>
                </span>
              )}
            </div>
            <p className="text-slate-200 mb-1">📍 {boat.location as string}</p>
            <p className="text-slate-200 mb-6">👥 до {boat.capacity as number} человек</p>

            <div className="border-t border-white/10 pt-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-3">О катере</h2>
              <p className="text-slate-200 leading-relaxed whitespace-pre-wrap">{boat.description as string}</p>
            </div>

            {(boat.routes as string[]).length > 0 && (
              <div className="border-t border-white/10 pt-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-3">Маршруты</h2>
                <div className="flex flex-wrap gap-2">
                  {(boat.routes as string[]).map((r) => (
                    <span key={r} className="px-3 py-1.5 bg-teal-400/20 text-teal-200 rounded-full text-sm font-medium">
                      🗺️ {r}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="border-t border-white/10 pt-6 mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">Судовладелец</h2>
              <p className="text-slate-200">👤 {boat.ownerName as string}</p>
            </div>

            <div className="border-t border-white/10 pt-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Отзывы {reviews.length > 0 && `(${reviews.length})`}
              </h2>
              {reviews.length === 0 ? (
                <p className="text-slate-300">Отзывов пока нет. Будьте первым!</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id as string} className="bg-white/10 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-white">{(review.guestName as string) ?? 'Гость'}</span>
                        <span className="text-amber-400 font-semibold">
                          {'★'.repeat(review.rating as number)}{'☆'.repeat(5 - (review.rating as number))}
                        </span>
                      </div>
                      <p className="text-slate-200 text-sm">{review.comment as string}</p>
                      <p className="text-slate-300 text-xs mt-2">
                        {new Date(review.createdAt as string).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="sticky top-24">
              <div className="text-2xl font-semibold text-white mb-1">
                {Number(boat.pricePerDay).toLocaleString('ru-RU')} ₽
                <span className="text-base font-normal text-slate-300"> / день</span>
              </div>
              <p className="text-slate-300 text-sm mb-4">Оплата картой или через СБП</p>
              <BookingForm
                boatId={boat.id as string}
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
