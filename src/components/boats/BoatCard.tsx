import Link from 'next/link'
import type { Boat } from '@/types'

type Props = { boat: Boat }

export default function BoatCard({ boat }: Props) {
  const avgRating = boat.avgRating ?? 0
  const reviewCount = boat._count?.reviews ?? 0

  return (
    <Link href={`/boats/${boat.id}`} className="group block bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-100">
      <div className="relative h-48 bg-slate-200 overflow-hidden">
        {boat.images[0] ? (
          <img
            src={boat.images[0]}
            alt={boat.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl text-slate-300">⛵</div>
        )}
        <div className="absolute top-3 right-3 bg-white rounded-lg px-2 py-1 text-sm font-semibold text-blue-700 shadow">
          {Number(boat.pricePerDay).toLocaleString('ru-RU')} ₽/день
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 text-lg mb-1 truncate">{boat.title}</h3>
        <p className="text-slate-500 text-sm mb-2 flex items-center gap-1">
          <span>📍</span> {boat.location}
        </p>
        <p className="text-slate-600 text-sm line-clamp-2 mb-3">{boat.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">👥 до {boat.capacity} чел.</span>
          <span className="flex items-center gap-1 text-amber-500 font-medium">
            ★ {avgRating > 0 ? avgRating.toFixed(1) : '—'}
            {reviewCount > 0 && <span className="text-slate-400 font-normal">({reviewCount})</span>}
          </span>
        </div>
      </div>
    </Link>
  )
}
