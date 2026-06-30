'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

type Props = {
  bookingId: string
}

export default function RefundDecisionButtons({ bookingId }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState('')

  function decide(decision: 'APPROVED' | 'REJECTED') {
    setError('')
    startTransition(async () => {
      const res = await fetch(`/api/bookings/${bookingId}/refund`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error ?? 'Ошибка')
        return
      }
      router.refresh()
    })
  }

  return (
    <div className="flex flex-col items-end gap-1.5 mt-1.5">
      <div className="flex gap-2">
        <button
          disabled={pending}
          onClick={() => decide('APPROVED')}
          className="text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 hover:bg-green-200 disabled:opacity-50"
        >
          Одобрить возврат
        </button>
        <button
          disabled={pending}
          onClick={() => decide('REJECTED')}
          className="text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 hover:bg-red-200 disabled:opacity-50"
        >
          Отклонить
        </button>
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}
