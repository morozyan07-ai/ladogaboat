'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'

export default function NewBoatPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState('')
  const [routeInput, setRouteInput] = useState('')
  const [routes, setRoutes] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const [images, setImages] = useState<string[]>([])

  function addRoute() {
    const val = routeInput.trim()
    if (val && !routes.includes(val)) setRoutes([...routes, val])
    setRouteInput('')
  }

  function addImage() {
    const val = imageInput.trim()
    if (val && !images.includes(val)) setImages([...images, val])
    setImageInput('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const data = {
      title: fd.get('title'),
      description: fd.get('description'),
      capacity: Number(fd.get('capacity')),
      pricePerDay: Number(fd.get('pricePerDay')),
      location: fd.get('location'),
      routes,
      images,
    }
    startTransition(async () => {
      const res = await fetch('/api/boats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        setError(err.error ?? 'Ошибка при создании')
        return
      }
      router.push('/dashboard/owner')
    })
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-800 mb-8">Добавить катер</h1>
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Field label="Название катера">
              <input name="title" required placeholder="«Северный ветер»" className={inputCls} />
            </Field>
            <Field label="Описание">
              <textarea name="description" required rows={4} placeholder="Опишите катер, его характеристики, оснащение..." className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Вместимость (чел.)">
                <input name="capacity" type="number" required min="1" max="50" placeholder="6" className={inputCls} />
              </Field>
              <Field label="Цена за день (₽)">
                <input name="pricePerDay" type="number" required min="1" placeholder="5000" className={inputCls} />
              </Field>
            </div>
            <Field label="Место отправления">
              <input name="location" required placeholder="Сортавала" className={inputCls} />
            </Field>
            <Field label="Маршруты">
              <div className="flex gap-2 mb-2">
                <input
                  value={routeInput}
                  onChange={(e) => setRouteInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addRoute() } }}
                  placeholder="Валаам, Коневец..."
                  className={inputCls}
                />
                <Button type="button" variant="secondary" onClick={addRoute}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {routes.map((r) => (
                  <span key={r} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm flex items-center gap-1">
                    {r} <button type="button" onClick={() => setRoutes(routes.filter((x) => x !== r))} className="text-blue-400 hover:text-red-500">×</button>
                  </span>
                ))}
              </div>
            </Field>
            <Field label="Фотографии (URL)">
              <div className="flex gap-2 mb-2">
                <input
                  value={imageInput}
                  onChange={(e) => setImageInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addImage() } }}
                  placeholder="https://..."
                  className={inputCls}
                />
                <Button type="button" variant="secondary" onClick={addImage}>+</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImages(images.filter((_, j) => j !== i))}
                      className="absolute top-0.5 right-0.5 bg-white rounded-full text-red-500 text-xs w-5 h-5 flex items-center justify-center shadow"
                    >×</button>
                  </div>
                ))}
              </div>
            </Field>
            {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>Отмена</Button>
              <Button type="submit" loading={isPending} className="flex-1">Опубликовать катер</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      {children}
    </div>
  )
}
