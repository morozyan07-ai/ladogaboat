'use client'

import { useState, useTransition } from 'react'
import Button from '@/components/ui/Button'

type Announcement = { id: string; title: string; body: string; createdAt: string }

export default function AnnouncementForm({ initial }: { initial: Announcement[] }) {
  const [items, setItems] = useState<Announcement[]>(initial)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [error, setError] = useState('')
  const [result, setResult] = useState('')
  const [isPending, startTransition] = useTransition()

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (title.trim().length < 2) { setError('Укажите заголовок'); return }
    if (body.trim().length < 2) { setError('Укажите текст сообщения'); return }
    setError('')
    setResult('')
    startTransition(async () => {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim(), body: body.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Ошибка при отправке'); return }
      setItems((prev) => [data, ...prev])
      setResult(`Отправлено ${data.sentTo} из ${data.totalOwners} судовладельцев, также появилось в их кабинетах.`)
      setTitle('')
      setBody('')
    })
  }

  function remove(id: string) {
    startTransition(async () => {
      const res = await fetch('/api/announcements', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) setItems((prev) => prev.filter((a) => a.id !== id))
    })
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Новости для судовладельцев</h2>
      <p className="text-sm text-slate-500 mb-4">
        Сообщение сразу уйдёт на email всем судовладельцам и появится у них в кабинете.
      </p>
      <form onSubmit={submit} className="space-y-3 mb-5">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Заголовок"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={4}
          placeholder="Текст сообщения..."
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{error}</p>}
        {result && <p className="text-green-700 text-sm bg-green-50 rounded-lg px-4 py-3">{result}</p>}
        <div className="flex justify-end">
          <Button type="submit" loading={isPending}>Отправить всем</Button>
        </div>
      </form>
      {items.length > 0 && (
        <div className="divide-y divide-slate-100 border-t border-slate-100 pt-3">
          {items.map((a) => (
            <div key={a.id} className="py-3 flex items-start justify-between gap-4">
              <div>
                <p className="font-medium text-slate-800">{a.title}</p>
                <p className="text-sm text-slate-500 whitespace-pre-wrap">{a.body}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {new Date(a.createdAt).toLocaleString('ru-RU')}
                </p>
              </div>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="text-slate-400 hover:text-red-500 text-sm whitespace-nowrap"
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
