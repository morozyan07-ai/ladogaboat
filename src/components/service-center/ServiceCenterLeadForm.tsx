'use client'

import { useActionState } from 'react'
import { submitServiceCenterLead } from '@/app/actions/serviceCenter'
import Button from '@/components/ui/Button'

export default function ServiceCenterLeadForm() {
  const [state, action, pending] = useActionState(submitServiceCenterLead, undefined)

  if (state?.success) {
    return (
      <div className="text-center py-6">
        <div className="text-5xl mb-4">✅</div>
        <p className="text-lg font-medium text-slate-800">Заявка отправлена</p>
        <p className="text-slate-500 mt-2">Мы свяжемся с вами, когда центр откроется.</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <input
          name="name"
          type="text"
          required
          placeholder="Имя"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <input
          name="phone"
          type="tel"
          required
          placeholder="Телефон"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.phone && <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>}
      </div>
      <div>
        <input
          name="email"
          type="email"
          placeholder="Email (необязательно)"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <textarea
          name="message"
          rows={3}
          placeholder="Что вас интересует? (необязательно)"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {state?.message && (
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{state.message}</p>
      )}
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Отправить заявку
      </Button>
    </form>
  )
}
