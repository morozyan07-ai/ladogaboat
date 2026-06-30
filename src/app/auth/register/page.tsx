'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { register } from '@/app/actions/auth'
import Button from '@/components/ui/Button'

function RegisterForm() {
  const searchParams = useSearchParams()
  const defaultRole = searchParams.get('role') === 'OWNER' ? 'OWNER' : 'GUEST'
  const [state, action, pending] = useActionState(register, undefined)

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Имя</label>
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
        <label className="block text-sm font-medium text-slate-700 mb-1">Пароль</label>
        <input
          name="password"
          type="password"
          required
          placeholder="Минимум 6 символов"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">Я регистрируюсь как</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { value: 'GUEST', label: '🧳 Гость', desc: 'Хочу арендовать катер' },
            { value: 'OWNER', label: '⛵ Судовладелец', desc: 'Хочу сдать катер' },
          ].map(({ value, label, desc }) => (
            <label key={value} className="relative cursor-pointer">
              <input type="radio" name="role" value={value} defaultChecked={defaultRole === value} className="sr-only peer" />
              <div className="border-2 border-slate-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 rounded-xl p-3 text-center transition-colors">
                <div className="font-medium text-slate-800 text-sm">{label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{desc}</div>
              </div>
            </label>
          ))}
        </div>
        {state?.errors?.role && <p className="text-red-500 text-xs mt-1">{state.errors.role[0]}</p>}
      </div>
      {state?.message && (
        <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{state.message}</p>
      )}
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Создать аккаунт
      </Button>
    </form>
  )
}

export default function RegisterPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">⛵</span>
          <h1 className="text-2xl font-semibold text-slate-800 mt-4">Создать аккаунт</h1>
          <p className="text-slate-500 mt-2">Присоединитесь к Ladoga Boat</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <Suspense fallback={<div className="h-64 animate-pulse bg-slate-100 rounded-xl" />}>
            <RegisterForm />
          </Suspense>
          <p className="text-center text-sm text-slate-500 mt-6">
            Уже есть аккаунт?{' '}
            <Link href="/auth/login" className="text-blue-600 hover:underline font-medium">
              Войти
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
