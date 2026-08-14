'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

type Props = {
  boatId: string
  pricePerDay: number
  isLoggedIn: boolean
}

const TIME_OPTIONS: string[] = []
for (let h = 8; h <= 23; h++) TIME_OPTIONS.push(String(h).padStart(2, '0') + ':00')

export default function BookingForm({ boatId, pricePerDay, isLoggedIn }: Props) {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const total = startDate ? pricePerDay : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate) { setError('Выберите дату'); return }
    if (!isLoggedIn) {
      if (!guestName.trim()) { setError('Введите ФИО'); return }
      if (!guestPhone.trim()) { setError('Введите номер телефона'); return }
      if (!guestEmail.trim()) { setError('Введите email'); return }
    }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, string> = { boatId, startDate, endDate: startDate }
      if (startTime) body.startTime = startTime
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
        router.push('/booking/confirm?code=' + data.bookingCode)
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
  const selectCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white'

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">Забронировать</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Дата</label>
          <input type="date" required value={startDate}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setStartDate(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Время отправления</label>
          <select value={startTime} onChange={(e) => setStartTime(e.target.value)} className={selectCls}>
            <option value="">Выберите время</option>
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
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

        {startDate && (
          <div className="bg-blue-50 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Аренда на день</span>
              <span>{pricePerDay.toLocaleString('ru-RU')} ₽</span>
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
