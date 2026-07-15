'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Button from '@/components/ui/Button'

// TODO: заполнить реальным списком точек отправления (адреса/названия причалов),
// когда они будут уточнены. Пока список пуст — поле работает, но без вариантов.
const DEPARTURE_LOCATIONS: string[] = []

const MAX_GUESTS_PER_BOAT = 11

function buildTimeOptions() {
  const options: string[] = []
  for (let hour = 8; hour <= 21; hour++) {
    options.push(`${String(hour).padStart(2, '0')}:00`)
  }
  return options
}
const TIME_OPTIONS = buildTimeOptions()

export default function SearchForm() {
  const router = useRouter()
  const sp = useSearchParams()

  const [locations, setLocations] = useState<string[]>(
    sp.get('location') ? sp.get('location')!.split(',').filter(Boolean) : []
  )
  const [tripDate, setTripDate] = useState(sp.get('startDate') ?? '')
  const [tripTime, setTripTime] = useState(sp.get('time') ?? '')
  const [capacity, setCapacity] = useState(sp.get('capacity') ?? '')
  const [locationOpen, setLocationOpen] = useState(false)
  const locationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (locationRef.current && !locationRef.current.contains(e.target as Node)) {
        setLocationOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const guestsCount = Number(capacity) || 0
  const tooManyGuests = guestsCount > MAX_GUESTS_PER_BOAT

  function toggleLocation(loc: string) {
    setLocations((prev) => (prev.includes(loc) ? prev.filter((l) => l !== loc) : [...prev, loc]))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (locations.length) params.set('location', locations.join(','))
    if (tripDate) params.set('startDate', tripDate)
    if (tripTime) params.set('time', tripTime)
    if (capacity) params.set('capacity', capacity)
    router.push(`/boats?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div ref={locationRef} className="relative">
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">
            Место отправления
          </label>
          <button
            type="button"
            onClick={() => setLocationOpen((v) => !v)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm text-left focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white truncate"
          >
            {locations.length > 0 ? locations.join(', ') : 'Уточняется'}
          </button>
          {locationOpen && (
            <div className="absolute z-20 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg p-2 max-h-56 overflow-auto">
              {DEPARTURE_LOCATIONS.length === 0 ? (
                <p className="text-xs text-slate-400 px-2 py-1.5">Список адресов скоро появится</p>
              ) : (
                DEPARTURE_LOCATIONS.map((loc) => (
                  <label
                    key={loc}
                    className="flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={locations.includes(loc)}
                      onChange={() => toggleLocation(loc)}
                      className="rounded border-slate-300"
                    />
                    {loc}
                  </label>
                ))
              )}
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Дата поездки</label>
          <input
            type="date"
            value={tripDate}
            onChange={(e) => setTripDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Время поездки</label>
          <select
            value={tripTime}
            onChange={(e) => setTripTime(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Любое время</option>
            {TIME_OPTIONS.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Гостей</label>
          <input
            type="number"
            placeholder="2"
            min="1"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {tooManyGuests && (
            <p className="text-amber-600 text-xs mt-1">
              Максимум {MAX_GUESTS_PER_BOAT} гостей на один катер — потребуется несколько катеров.
            </p>
          )}
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" size="lg">🔍 Найти катера</Button>
      </div>
    </form>
  )
}
