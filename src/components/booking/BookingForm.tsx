'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

type Props = {
  boatId: string
  pricePerDay: number
  isLoggedIn: boolean
}

export default function BookingForm({ boatId, pricePerDay, isLoggedIn }: Props) {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const days =
    startDate && endDate
      ? Math.max(0, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000))
      : 0
  const total = days * pricePerDay
  const commission = Math.round(total * 0.08)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate || !endDate || days <= 0) { setError('Выберите корректные даты'); return }
    if (!isLoggedIn) {
      if (!guestName.trim()) { setError('Введите ФИО'); return }
      if (!guestPhone.trim()) { setError('Введите номер телефона'); return }
      if (!guestEmail.trim()) { setError('Введите email'); return }
    }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, string> = { boatId, startDate, endDate }
      if (!isLoggedIn) {
        body.guestName = guestName.trim()
        body.guestPhone = guestPhone.trim()
        body.guestEmail = guestEmail.trim()
      }
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Ошибка при бронировании'); return }
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl
      } else if (!isLoggedIn && data.bookingCode) {
        router.push(`/booking/confirm?code=${data.bookingCode}`)
      } else {
        router.push('/dashboard/guest?booked=1')
      }
    } catch {
      setError('Ошибка сети, попробуйте снова')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Забронировать</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Дата начала</label>
          <input type="date" required value={startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Дата окончания</label>
          <input type="date" required value={endDate}
            min={startDate || new Date().toISOString().split('T')[0]}
            onChange={(e) => setEndDate(e.target.value)} className={inputCls} />
        </div>

        {!isLoggedIn && (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-slate-500">
              Регистрация не нужна. Укажите контакты — вышлем код бронирования.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ФИО</label>
              <input type="text" placeholder="Иванов Иван Иванович"
                value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
              <input type="tel" placeholder="+7 900 000 00 00"
                value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" placeholder="your@email.com"
                value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={inputCls} />
            </div>
          </div>
        )}

        {days > 0 && (
          <div className="bg-blue-50 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>{pricePerDay.toLocaleString('ru-RU')} ₽ x {days} дн.</span>
              <span>{total.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Комиссия платформы (8%)</span>
              <span>{commission.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-800 pt-2 border-t border-blue-100">
              <span>Итого</span>
              <span>{total.toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm">{error}</p>}

        <Button type="submit" className="w-full" size="lg" loading={loading}>
          Забронировать
        </Button>

        {!isLoggedIn && (
          <p className="text-xs text-slate-400 text-center">
            Являетесь судовладельцем?{' '}
            <a href="/auth/login" className="text-blue-600 hover:underline">Войти в личный кабинет</a>
          </p>
        )}
      </form>
    </div>
  )
}
