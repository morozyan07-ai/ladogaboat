'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DeleteBoatButton({ boatId }: { boatId: string }) {
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    const res = await fetch(`/api/boats/${boatId}`, { method: 'DELETE' })
    if (res.ok) { router.refresh() }
    setLoading(false)
    setConfirming(false)
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-red-600">Удалить?</span>
        <button onClick={handleDelete} disabled={loading} className="text-xs text-red-600 hover:text-red-800 font-medium">
          {loading ? '...' : 'Да'}
        </button>
        <button onClick={() => setConfirming(false)} className="text-xs text-slate-500 hover:text-slate-700">Нет</button>
      </div>
    )
  }

  return (
    <button onClick={() => setConfirming(true)} className="text-xs text-red-500 hover:text-red-700 transition-colors">
      Удалить
    </button>
  )
}
