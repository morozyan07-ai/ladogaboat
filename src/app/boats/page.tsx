import { Suspense } from 'react'
import type { Metadata } from 'next'
import { sql } from '@/lib/db'
import BoatCard from '@/components/boats/BoatCard'
import SearchForm from '@/components/boats/SearchForm'
import type { Boat, SearchParams } from '@/types'

export const metadata: Metadata = {
  title: 'Каталог катеров на Ладожском озере',
  description:
    'Каталог катеров для аренды на Ладожском озере: Карелия, Ленинградская область, Ладожские шхеры, остров Валаам. Фильтр по локации и вместимости, онлайн-бронирование.',
  alternates: { canonical: '/boats' },
}

async function searchBoats(params: SearchParams): Promise<Boat[]> {
  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('db_timeout')), 8000)
    )
    return await Promise.race([fetchBoats(params), timeout])
  } catch {
    return []
  }
}

async function fetchBoats(params: SearchParams): Promise<Boat[]> {
  try {
    const locations = params.location
      ? params.location.split(',').map(s => s.trim()).filter(Boolean)
      : []
    const capacity = params.capacity ? Number(params.capacity) : null

    let rows
    if (locations.length === 1 && capacity) {
      rows = await sql`
        SELECT b.*, u.name as "ownerName",
          COALESCE(AVG(r.rating), 0)::float as "avgRating",
          COUNT(r.id)::int as "reviewCount"
        FROM "Boat" b
        LEFT JOIN "User" u ON u.id = b."ownerId"
        LEFT JOIN "Review" r ON r."boatId" = b.id
        WHERE b.status = 'ACTIVE'
          AND LOWER(b.location) LIKE '%' || LOWER(${locations[0]}) || '%'
          AND b.capacity >= ${capacity}
        GROUP BY b.id, u.name ORDER BY b."createdAt" DESC`
    } else if (locations.length === 1) {
      rows = await sql`
        SELECT b.*, u.name as "ownerName",
          COALESCE(AVG(r.rating), 0)::float as "avgRating",
          COUNT(r.id)::int as "reviewCount"
        FROM "Boat" b
        LEFT JOIN "User" u ON u.id = b."ownerId"
        LEFT JOIN "Review" r ON r."boatId" = b.id
        WHERE b.status = 'ACTIVE'
          AND LOWER(b.location) LIKE '%' || LOWER(${locations[0]}) || '%'
        GROUP BY b.id, u.name ORDER BY b."createdAt" DESC`
    } else if (locations.length > 1 && capacity) {
      // Для нескольких локаций используем ILIKE ANY
      rows = await sql`
        SELECT b.*, u.name as "ownerName",
          COALESCE(AVG(r.rating), 0)::float as "avgRating",
          COUNT(r.id)::int as "reviewCount"
        FROM "Boat" b
        LEFT JOIN "User" u ON u.id = b."ownerId"
        LEFT JOIN "Review" r ON r."boatId" = b.id
        WHERE b.status = 'ACTIVE'
          AND b.location ILIKE ANY(${locations.map(l => `%${l}%`)})
          AND b.capacity >= ${capacity}
        GROUP BY b.id, u.name ORDER BY b."createdAt" DESC`
    } else if (locations.length > 1) {
      rows = await sql`
        SELECT b.*, u.name as "ownerName",
          COALESCE(AVG(r.rating), 0)::float as "avgRating",
          COUNT(r.id)::int as "reviewCount"
        FROM "Boat" b
        LEFT JOIN "User" u ON u.id = b."ownerId"
        LEFT JOIN "Review" r ON r."boatId" = b.id
        WHERE b.status = 'ACTIVE'
          AND b.location ILIKE ANY(${locations.map(l => `%${l}%`)})
        GROUP BY b.id, u.name ORDER BY b."createdAt" DESC`
    } else if (capacity) {
      rows = await sql`
        SELECT b.*, u.name as "ownerName",
          COALESCE(AVG(r.rating), 0)::float as "avgRating",
          COUNT(r.id)::int as "reviewCount"
        FROM "Boat" b
        LEFT JOIN "User" u ON u.id = b."ownerId"
        LEFT JOIN "Review" r ON r."boatId" = b.id
        WHERE b.status = 'ACTIVE' AND b.capacity >= ${capacity}
        GROUP BY b.id, u.name ORDER BY b."createdAt" DESC`
    } else {
      rows = await sql`
        SELECT b.*, u.name as "ownerName",
          COALESCE(AVG(r.rating), 0)::float as "avgRating",
          COUNT(r.id)::int as "reviewCount"
        FROM "Boat" b
        LEFT JOIN "User" u ON u.id = b."ownerId"
        LEFT JOIN "Review" r ON r."boatId" = b.id
        WHERE b.status = 'ACTIVE'
        GROUP BY b.id, u.name ORDER BY b."createdAt" DESC`
    }

    return rows.map((b: Record<string, unknown>) => ({
      ...b,
      pricePerDay: Number(b.pricePerDay),
      avgRating: Number(b.avgRating) || 0,
      owner: { name: b.ownerName },
      _count: { reviews: b.reviewCount ?? 0 },
      ownerName: undefined,
      avgRating2: undefined,
      reviewCount: undefined,
    })) as unknown as Boat[]
  } catch {
    return []
  }
}

type Props = { searchParams: Promise<SearchParams> }

export default async function BoatsPage({ searchParams }: Props) {
  const params = await searchParams
  const boats = await searchBoats(params)

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-800 mb-6">Каталог катеров</h1>
        <div className="mb-8">
          <Suspense fallback={null}>
            <SearchForm />
          </Suspense>
        </div>
        {params.location && (
          <p className="text-slate-600 mb-4">
            Поиск: <span className="font-medium text-slate-800">{params.location.split(',').join(', ')}</span>
            {params.startDate && <> · {new Date(params.startDate).toLocaleDateString('ru-RU')}</>}
            {params.time && <> в {params.time}</>}
          </p>
        )}
        {boats.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">⛵</div>
            <p className="text-lg font-medium text-slate-600">
              {params.location ? 'Катера не найдены' : 'Катера загружаются...'}
            </p>
            <p className="text-sm mt-2">
              {params.location
                ? 'Попробуйте изменить параметры поиска'
                : 'Первый запрос занимает несколько секунд — обновите страницу'}
            </p>
            {!params.location && (
              <a
                href="/boats"
                className="mt-4 inline-block bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Обновить
              </a>
            )}
          </div>
        ) : (
          <>
            <p className="text-slate-500 text-sm mb-6">Найдено: {boats.length} катеров</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {boats.map((boat) => (
                <BoatCard key={boat.id} boat={boat} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
