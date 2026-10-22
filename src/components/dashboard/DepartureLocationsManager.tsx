'use client'

import { useState, useTransition } from 'react'
import Button from '@/components/ui/Button'

type Location = { id: string; name: string }

export default function DepartureLocationsManager({ initial }: { initial: Location[] }) {
  const [locations, setLocations] = useState<Location[]>(initial)
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  function addLocation(e: React.FormEvent) {
    e.preventDefault()
    const value = name.trim()
    if (value.length < 2) { setError('Минимум 2 символа'); return }
    setError('')
    startTransition(async () => {
      const res = await fetch('/api/departure-locations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: value }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Ошибка при добавлении'); return }
      setLocations((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
      setName('')
    })
  }

  function removeLocation(id: string) {
    startTransition(async () => {
      const res = await fetch('/api/departure-locations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) setLocations((prev) => prev.filter((l) => l.id !== id))
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Причалы отправления</h2>
      <p className="text-sm text-slate-500 mb-4">
        Этот список доступен судовладельцам при добавлении/редактировании катера — поле «Место базирования».
      </p>
      <form onSubmit={addLocation} className="flex gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Например: Причал Сортавала, ул. Карельская, 2"
          className="flex-1 border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <Button type="submit" loading={isPending}>Добавить</Button>
      </form>
      {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3 mb-4">{error}</p>}
      {locations.length === 0 ? (
        <p className="text-slate-400 text-sm">Причалов пока нет</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {locations.map((loc) => (
            <div key={loc.id} className="flex items-center justify-between py-2.5">
              <span className="text-sm text-slate-700">{loc.name}</span>
              <button
                type="button"
                onClick={() => removeLocation(loc.id)}
                className="text-slate-400 hover:text-red-500 text-sm"
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
