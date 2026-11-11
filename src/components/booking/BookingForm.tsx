'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import { priceUnitLabel, isPerPersonBasis } from '@/lib/price'

type Props = {
  boatId: string
  pricePerDay: number
  priceUnit?: string
  priceBasis?: string
  capacity?: number
  isLoggedIn: boolean
}

const TIME_OPTIONS: string[] = []
for (let h = 8; h <= 23; h++) TIME_OPTIONS.push(String(h).padStart(2, '0') + ':00')

export default function BookingForm({ boatId, pricePerDay, priceUnit, priceBasis, capacity, isLoggedIn }: Props) {
  const router = useRouter()
  const [startDate, setStartDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [guestName, setGuestName] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestCount, setGuestCount] = useState(1)
  const [durationHours, setDurationHours] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookedTimes, setBookedTimes] = useState<string[]>([])
  const [fullyBooked, setFullyBooked] = useState(false)

  const perPerson = isPerPersonBasis(priceBasis)
  const hourly = priceUnit === 'HOUR'
  const maxGuests = capacity ?? 99
  const maxDurationHours = startTime ? Math.min(12, 24 - Number(startTime.slice(0, 2))) : 12
  const total = pricePerDay * (perPerson ? guestCount : 1) * (hourly ? durationHours : 1)

  useEffect(() => {
    if (!startDate) { setBookedTimes([]); setFullyBooked(false); return }
    let cancelled = false
    fetch(`/api/boats/${boatId}/availability?date=${startDate}&durationHours=${durationHours}`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setBookedTimes(Array.isArray(data.bookedTimes) ? data.bookedTimes : [])
        setFullyBooked(Boolean(data.fullyBooked))
      })
      .catch(() => { if (!cancelled) { setBookedTimes([]); setFullyBooked(false) } })
    return () => { cancelled = true }
  }, [startDate, boatId, durationHours])

  useEffect(() => {
    if (startTime && bookedTimes.includes(startTime)) setStartTime('')
  }, [bookedTimes, startTime])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!startDate) { setError('Выберите дату'); return }
    if (hourly && !startTime) { setError('Выберите время отправления'); return }
    if (hourly && (durationHours < 1 || durationHours > maxDurationHours)) { setError('Выберите доступную длительность'); return }
    if (fullyBooked) { setError('Эта дата уже забронирована, выберите другую'); return }
    if (startTime && bookedTimes.includes(startTime)) { setError('Это время уже занято, выберите другое'); return }
    if (perPerson && (!guestCount || guestCount < 1)) { setError('Укажите количество человек'); return }
    if (!isLoggedIn) {
      if (!guestName.trim()) { setError('Введите ФИО'); return }
      if (!guestPhone.trim()) { setError('Введите номер телефона'); return }
      if (!guestEmail.trim()) { setError('Введите email'); return }
    }
    setLoading(true)
    setError('')
    try {
      const body: Record<string, string | number> = { boatId, startDate, endDate: startDate }
      if (startTime) body.startTime = startTime
      if (hourly) body.durationHours = durationHours
      if (perPerson) body.guestCount = guestCount
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
          <select required={hourly} value={startTime} onChange={(e) => {
            const value = e.target.value
            setStartTime(value)
            if (value) setDurationHours((hours) => Math.min(hours, Math.min(12, 24 - Number(value.slice(0, 2)))))
          }} className={selectCls}>
            <option value="">Выберите время</option>
            {TIME_OPTIONS.map(t => (
              <option key={t} value={t} disabled={bookedTimes.includes(t)}>
                {t}{bookedTimes.includes(t) ? ' — занято' : ''}
              </option>
            ))}
          </select>
        </div>
        {hourly && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Длительность</label>
            <select value={durationHours} onChange={(e) => setDurationHours(Number(e.target.value))} className={selectCls}>
              {Array.from({ length: maxDurationHours }, (_, i) => i + 1).map((hours) => (
                <option key={hours} value={hours}>{hours} {hours === 1 ? 'час' : hours < 5 ? 'часа' : 'часов'}</option>
              ))}
            </select>
          </div>
        )}
        {startDate && fullyBooked && (
          <p className="text-amber-600 text-sm bg-amber-50 rounded-lg px-3 py-2">
            На эту дату катер уже забронирован целиком — выберите другой день.
          </p>
        )}

        {perPerson && (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Количество человек</label>
            <input type="number" required min={1} max={maxGuests} value={guestCount}
              onChange={(e) => setGuestCount(Math.min(maxGuests, Math.max(1, Number(e.target.value) || 1)))}
              className={inputCls} />
            <p className="text-xs text-slate-400 mt-1">Цена указана за человека{hourly ? ' в час' : ''} — укажите точный состав группы.</p>
          </div>
        )}

        {!isLoggedIn && (
          <div className="space-y-3 pt-1">
            <p className="text-xs text-slate-500">
              Регистрация не нужна. Укажите контакты — вышлем код бронирования.
            </p>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ФИО</label>
              <input type="text" required placeholder="Иванов Иван Иванович"
                value={guestName} onChange={(e) => setGuestName(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
              <input type="tel" required placeholder="+7 900 000 00 00"
                value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input type="email" required placeholder="your@email.com"
                value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} className={inputCls} />
            </div>
          </div>
        )}

        <div className="bg-blue-50 rounded-xl p-4 space-y-1 text-sm">
          <div className="flex justify-between text-slate-600">
            <span>{hourly ? `Тариф × ${durationHours} ч${perPerson ? ` × ${guestCount} чел.` : ''}` : perPerson ? `Цена за человека × ${guestCount}` : `Аренда на ${priceUnitLabel(priceUnit)}`}</span>
            <span>{pricePerDay.toLocaleString('ru-RU')} ₽{hourly ? ' / ч' : perPerson ? ' / чел.' : ''}</span>
          </div>
          <div className="flex justify-between font-semibold text-slate-800 pt-2 border-t border-blue-100">
            <span>Итого за аренду</span>
            <span>{total.toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>

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
