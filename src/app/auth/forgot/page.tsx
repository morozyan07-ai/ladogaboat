'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { requestPasswordReset } from '@/app/actions/password-reset'
import Button from '@/components/ui/Button'

export default function ForgotPage() {
  const [state, action, pending] = useActionState(requestPasswordReset, undefined)

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🔑</span>
          <h1 className="text-2xl font-semibold text-slate-800 mt-4">Забыли пароль?</h1>
          <p className="text-slate-500 mt-2">Введите email — пришлём ссылку для сброса</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {state?.ok ? (
            <div className="text-center space-y-4">
              <div className="text-4xl">✉️</div>
              <p className="text-slate-700 text-sm leading-relaxed">{state.message}</p>
              <Link
                href="/auth/login"
                className="inline-block text-blue-600 hover:underline text-sm font-medium mt-2"
              >
                ← Вернуться ко входу
              </Link>
            </div>
          ) : (
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
                {state?.errors?.email && (
                  <p className="text-red-500 text-xs mt-1">{state.errors.email[0]}</p>
                )}
              </div>
              {state?.message && (
                <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{state.message}</p>
              )}
              <Button type="submit" className="w-full" size="lg" loading={pending}>
                Отправить ссылку
              </Button>
              <p className="text-center text-sm text-slate-500">
                <Link href="/auth/login" className="text-blue-600 hover:underline">
                  ← Вернуться ко входу
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
