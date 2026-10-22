'use client'

import { useActionState } from 'react'
import { saveProfile } from '@/app/actions/profile'
import Button from '@/components/ui/Button'

type Props = {
  initial: {
    name: string
    email: string
    phone?: string | null
  }
}

const inputCls =
  'w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function ProfileForm({ initial }: Props) {
  const [state, action, pending] = useActionState(saveProfile, undefined)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800">Данные личного кабинета</h2>
        <p className="text-sm text-slate-500 mt-1">
          Имя, email (используется для входа) и телефон для связи. Ошиблись при регистрации — поправьте здесь.
        </p>
      </div>
      <form action={action} className="p-6 space-y-4">
        {state?.success && (
          <p className="text-green-700 text-sm bg-green-50 rounded-lg px-4 py-3">Данные сохранены.</p>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Имя</label>
            <input name="name" required defaultValue={initial.name} className={inputCls} />
            {state?.errors?.name && <p className="text-red-500 text-xs mt-1">{state.errors.name[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Телефон</label>
            <input name="phone" defaultValue={initial.phone ?? ''} placeholder="+7 900 000 00 00" className={inputCls} />
            {state?.errors?.phone && <p className="text-red-500 text-xs mt-1">{state.errors.phone[0]}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email (логин для входа)</label>
          <input name="email" type="email" required defaultValue={initial.email} className={inputCls} />
          {state?.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>}
        </div>
        {state?.message && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{state.message}</p>}
        <div className="flex justify-end pt-2">
          <Button type="submit" loading={pending}>Сохранить</Button>
        </div>
      </form>
    </div>
  )
}
