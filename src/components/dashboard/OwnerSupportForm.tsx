'use client'

import { useActionState } from 'react'
import { submitOwnerFeedback } from '@/app/actions/support'
import Button from '@/components/ui/Button'
import { CONTACTS } from '@/lib/contacts'

export default function OwnerSupportForm() {
  const [state, action, pending] = useActionState(submitOwnerFeedback, undefined)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
      <h2 className="text-xl font-semibold text-slate-800 mb-1">Обратная связь и техподдержка</h2>
      <p className="text-sm text-slate-500 mb-4">
        Напишите нам — ответим на вашу почту. Также можно написать напрямую: {CONTACTS.supportEmail}
      </p>
      {state?.success ? (
        <p className="text-green-700 text-sm bg-green-50 rounded-lg px-4 py-3">
          Обращение отправлено. Ответим на вашу почту в ближайшее время.
        </p>
      ) : (
        <form action={action} className="space-y-3">
          <input
            name="subject"
            type="text"
            placeholder="Тема (необязательно)"
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <textarea
            name="message"
            required
            rows={4}
            placeholder="Опишите вопрос или проблему..."
            className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
          {state?.errors?.message && <p className="text-red-500 text-xs">{state.errors.message[0]}</p>}
          {state?.message && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{state.message}</p>}
          <div className="flex justify-end">
            <Button type="submit" loading={pending}>Отправить</Button>
          </div>
        </form>
      )}
    </div>
  )
}
