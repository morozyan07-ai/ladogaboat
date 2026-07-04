'use client'

import { useActionState } from 'react'
import { submitSupportRequest } from '@/app/actions/support'
import Button from '@/components/ui/Button'
import { CONTACTS } from '@/lib/contacts'

function SupportForm() {
  const [state, action, pending] = useActionState(submitSupportRequest, undefined)

  if (state?.success) {
    return (
      <div className="text-center py-8">
        <div className="text-5xl mb-4">✅</div>
        <p className="text-lg font-medium text-slate-800">Обращение отправлено</p>
        <p className="text-slate-500 mt-2">Мы ответим вам на указанную почту в ближайшее время.</p>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">ФИО</label>
        <input
          name="name"
          type="text"
          required
          placeholder="Иван Иванов"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
        <input
          name="email"
          type="email"
          required
          placeholder="you@example.com"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
        <input
          name="phone"
          type="tel"
          required
          placeholder="+7 900 000-00-00"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.phone && <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Тема обращения</label>
        <input
          name="subject"
          type="text"
          required
          placeholder="Например: проблема с бронированием"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.subject && <p className="text-red-500 text-xs mt-1">{state.errors.subject[0]}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Описание</label>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Расскажите подробнее о вашем вопросе"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.message && <p className="text-red-500 text-xs mt-1">{state.errors.message[0]}</p>}
      </div>
      {state?.message && (
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{state.message}</p>
      )}
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Отправить обращение
      </Button>
    </form>
  )
}

export default function SupportPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🛟</span>
          <h1 className="text-2xl font-semibold text-slate-800 mt-4">Техническая поддержка</h1>
          <p className="text-slate-500 mt-2">
            Опишите проблему — мы ответим на email. Также можно написать напрямую: {CONTACTS.email}
          </p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <SupportForm />
        </div>
      </div>
    </div>
  )
}
