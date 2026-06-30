import { Suspense } from 'react'
import type { Metadata } from 'next'
import prisma from '@/lib/prisma'
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
    const where: Record<string, unknown> = { status: 'ACTIVE' }
    if (params.location) {
      const locations = params.location.split(',').filter(Boolean)
      if (locations.length) {
        where.OR = locations.map((loc) => ({ location: { contains: loc, mode: 'insensitive' } }))
      }
    }
    if (params.capacity) where.capacity = { gte: Number(params.capacity) }

    const boats = await prisma.boat.findMany({
      where,
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
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-lg font-medium text-slate-600">Катера не найдены</p>
            <p className="text-sm mt-2">Попробуйте изменить параметры поиска</p>
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
