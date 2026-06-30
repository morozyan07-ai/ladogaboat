'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import Button from '@/components/ui/Button'

export default function SearchForm() {
  const router = useRouter()
  const sp = useSearchParams()
  const [location, setLocation] = useState(sp.get('location') ?? '')
  const [startDate, setStartDate] = useState(sp.get('startDate') ?? '')
  const [endDate, setEndDate] = useState(sp.get('endDate') ?? '')
  const [capacity, setCapacity] = useState(sp.get('capacity') ?? '')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (location) params.set('location', location)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    if (capacity) params.set('capacity', capacity)
    router.push(`/boats?${params.toString()}`)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Место отправления</label>
          <input
            type="text"
            placeholder="Сортавала, Приозерск..."
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Дата начала</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wide">Дата окончания</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
        </div>
      </div>
      <div className="mt-4 flex justify-end">
        <Button type="submit" size="lg">🔍 Найти катера</Button>
      </div>
    </form>
  )
}
