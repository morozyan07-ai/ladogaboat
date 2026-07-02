'use client'

import Link from 'next/link'
import { useActionState } from 'react'
import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { resetPassword } from '@/app/actions/password-reset'
import Button from '@/components/ui/Button'

function ResetForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token') ?? ''
  const [state, action, pending] = useActionState(resetPassword, undefined)

  if (!token) {
    return (
      <div className="text-center space-y-3">
        <p className="text-red-600 text-sm">Ссылка недействительна. Попробуйте запросить новую.</p>
        <Link href="/auth/forgot" className="text-blue-600 hover:underline text-sm">
          Запросить сброс пароля
        </Link>
      </div>
    )
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Новый пароль</label>
        <input
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder="Минимум 6 символов"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.password && (
          <p className="text-red-500 text-xs mt-1">{state.errors.password[0]}</p>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Повторите пароль</label>
        <input
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          placeholder="Повторите пароль"
          className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {state?.errors?.passwordConfirm && (
          <p className="text-red-500 text-xs mt-1">{state.errors.passwordConfirm[0]}</p>
        )}
      </div>
      {state?.message && (
        <div className="text-red-600 text-sm bg-red-50 rounded-lg px-4 py-3 space-y-2">
          <p>{state.message}</p>
          <Link href="/auth/forgot" className="underline text-blue-600 block">
            Запросить новую ссылку
          </Link>
        </div>
      )}
      <Button type="submit" className="w-full" size="lg" loading={pending}>
        Сохранить новый пароль
      </Button>
    </form>
  )
}

export default function ResetPage() {
  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🔒</span>
          <h1 className="text-2xl font-semibold text-slate-800 mt-4">Новый пароль</h1>
          <p className="text-slate-500 mt-2">Придумайте надёжный пароль для вашего аккаунта</p>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          <Suspense fallback={<div className="text-slate-400 text-sm text-center">Загрузка...</div>}>
            <ResetForm />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
