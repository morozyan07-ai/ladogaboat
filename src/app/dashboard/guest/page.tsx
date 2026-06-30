'use client'

import { useEffect, useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import type { Booking } from '@/types'

function ReviewModal({ booking, onClose, onSubmit }: {
  booking: Booking
  onClose: () => void
  onSubmit: (bookingId: string, rating: number, comment: string) => Promise<void>
}) {
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [pending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => { await onSubmit(booking.id, rating, comment); onClose() })
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <h3 className="text-lg font-bold text-slate-900 mb-4">Оставить отзыв</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Оценка</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className={`text-2xl transition-transform hover:scale-110 ${n <= rating ? 'text-amber-400' : 'text-slate-200'}`}
                >★</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Комментарий</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Поделитесь впечатлениями..."
              className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Отмена</button>
            <button type="submit" disabled={pending} className="flex-1 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
              {pending ? 'Отправка...' : 'Отправить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function GuestDashboardContent() {
  const searchParams = useSearchParams()
  const justBooked = searchParams.get('booked') === '1'
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewFor, setReviewFor] = useState<Booking | null>(null)

  useEffect(() => {
    fetch('/api/bookings')
      .then((r) => r.json())
      .then((data) => { setBookings(data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  async function submitReview(bookingId: string, rating: number, comment: string) {
    await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId, rating, comment }),
    })
    const updated = await fetch('/api/bookings').then((r) => r.json())
    setBookings(updated)
  }

  async function cancelBooking(id: string) {
    await fetch(`/api/bookings/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'CANCELLED' }) })
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status: 'CANCELLED' } : b))
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Мои бронирования</h1>
        {justBooked && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 mb-6 text-sm">
            ✅ Бронирование успешно оформлено! Судовладелец свяжется с вами.
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-lg font-medium text-slate-600">Бронирований пока нет</p>
            <Link href="/boats" className="mt-4 inline-block text-blue-600 hover:underline">
              Найти катер →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div key={b.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/boats/${b.boatId}`} className="font-semibold text-slate-900 hover:text-blue-600 transition-colors">
                      {b.boat?.title}
                    </Link>
                    <p className="text-sm text-slate-500 mt-1">
                      {new Date(b.startDate).toLocaleDateString('ru-RU')} — {new Date(b.endDate).toLocaleDateString('ru-RU')}
                    </p>
                    <p className="text-sm font-medium text-slate-900 mt-1">
                      {Number(b.totalPrice).toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="text-right space-y-2">
                    <StatusBadge status={b.status} />
                    <div className="flex flex-col gap-1.5">
                      {b.status === 'COMPLETED' && !b.review && (
                        <button onClick={() => setReviewFor(b)} className="text-xs text-blue-600 hover:underline">
                          Оставить отзыв
                        </button>
                      )}
                      {b.status === 'PENDING' && (
                        <button onClick={() => cancelBooking(b.id)} className="text-xs text-red-500 hover:underline">
                          Отменить
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                {b.review && (
                  <div className="mt-3 pt-3 border-t border-slate-100 text-sm text-slate-500">
                    Ваш отзыв: {'★'.repeat(b.review.rating)} — {b.review.comment}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {reviewFor && (
        <ReviewModal booking={reviewFor} onClose={() => setReviewFor(null)} onSubmit={submitReview} />
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Ожидает', cls: 'bg-yellow-100 text-yellow-700' },
    CONFIRMED: { label: 'Подтверждено', cls: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Отменено', cls: 'bg-red-100 text-red-700' },
    COMPLETED: { label: 'Завершено', cls: 'bg-blue-100 text-blue-700' },
  }
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' }
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${cls}`}>{label}</span>
}

export default function GuestDashboard() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Загрузка...</div>}>
      <GuestDashboardContent />
    </Suspense>
  )
}
