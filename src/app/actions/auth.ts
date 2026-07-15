'use server'

import { redirect } from 'next/navigation'
import { hash, compare } from 'bcrypt-ts/browser'
import { sql } from '@/lib/db'
import { createSession } from '@/lib/session'

type FormState = { errors?: Record<string, string[]>; message?: string } | undefined

export async function register(state: FormState, formData: FormData): Promise<FormState> {
  const name = (formData.get('name') as string ?? '').trim()
  const email = (formData.get('email') as string ?? '').trim().toLowerCase()
  const phone = (formData.get('phone') as string ?? '').trim()
  const password = formData.get('password') as string ?? ''
  const role = formData.get('role') as string ?? ''

  const errors: Record<string, string[]> = {}
  if (name.length < 2) errors.name = ['Имя должно содержать минимум 2 символа']
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Введите корректный email']
  if (phone.length < 10) errors.phone = ['Введите корректный номер телефона']
  if (password.length < 6) errors.password = ['Пароль должен содержать минимум 6 символов']
  if (!['GUEST', 'OWNER'].includes(role)) errors.role = ['Неверная роль']
  if (Object.keys(errors).length) return { errors }

  if (formData.get('consent') !== 'on') {
    return { errors: { consent: ['Необходимо согласие на обработку персональных данных'] } }
  }

  let user: { id: string; role: string; name: string; email: string }
  try {
    const existing = await sql`SELECT id FROM "User" WHERE email = ${email} LIMIT 1`
    if (existing.length > 0) return { errors: { email: ['Email уже зарегистрирован'] } }

    const passwordHash = await hash(password, 10)
    const id = crypto.randomUUID()
    const rows = await sql`
      INSERT INTO "User" (id, name, email, phone, "passwordHash", role, "createdAt", "updatedAt")
      VALUES (${id}, ${name}, ${email}, ${phone}, ${passwordHash}, ${role}::"Role", NOW(), NOW())
      RETURNING id, role, name, email`
    user = rows[0] as typeof user
  } catch (err: unknown) {
    console.error('Ошибка регистрации:', err)
    return { message: 'Не удалось создать аккаунт. Попробуйте ещё раз через пару минут.' }
  }

  await createSession({ id: user.id, role: user.role, name: user.name, email: user.email })
  redirect(role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest')
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const email = (formData.get('email') as string ?? '').trim().toLowerCase()
  const password = formData.get('password') as string ?? ''

  const errors: Record<string, string[]> = {}
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Введите корректный email']
  if (!password) errors.password = ['Введите пароль']
  if (Object.keys(errors).length) return { errors }

  let user: { id: string; role: string; name: string; email: string; passwordHash: string } | undefined
  try {
    const rows = await sql`SELECT id, role, name, email, "passwordHash" FROM "User" WHERE email = ${email} LIMIT 1`
    user = rows[0] as typeof user
    if (!user) return { message: 'Неверный email или пароль' }

    const valid = await compare(password, user.passwordHash)
    if (!valid) return { message: 'Неверный email или пароль' }
  } catch (err: unknown) {
    console.error('Ошибка входа:', err)
    return { message: 'Сервис временно недоступен. Попробуйте ещё раз через пару минут.' }
  }

  await createSession({ id: user.id, role: user.role, name: user.name, email: user.email })
  redirect(user.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest')
}
