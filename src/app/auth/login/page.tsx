'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { login } from '@/app/actions/auth'
import Button from '@/components/ui/Button'

function ResetSuccessBanner() {
  const searchParams = useSearchParams()
  if (searchParams.get('reset') !== 'done') return null
  return (
    <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl px-4 py-3 mb-6 text-sm">
      ✅ Пароль успешно изменён. Войдите с новым паролем.
    </div>
  )
}

export default function LoginPage() {
  const [state, action, pending] = useActionState(login, undefined)

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">⛵</span>
          <h1 className="text-2xl font-semibold text-slate-800 mt-4">Войти в аккаунт</h1>
          <p className="text-slate-500 mt-2">Добро пожаловать обратно!</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <Suspense fallback={null}>
            <ResetSuccessBanner />
          </Suspense>
          <form action={action} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {state?.errors?.email && <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-slate-700">Пароль</label>
                <Link href="/auth/forgot" className="text-xs text-blue-600 hover:underline">
                  Забыли пароль?
                </Link>
              </div>
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {state?.errors?.password && <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>}
            </div>
            {state?.message && (
              <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{state.message}</p>
            )}
            <Button type="submit" className="w-full" size="lg" loading={pending}>
              Войти
            </Button>
          </form>
          <p className="text-center text-sm text-slate-500 mt-6">
            Нет аккаунта?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:underline font-medium">
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
