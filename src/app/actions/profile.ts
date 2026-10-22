'use server'

import { sql } from '@/lib/db'
import { verifySession } from '@/lib/dal'
import { createSession } from '@/lib/session'
import { revalidatePath } from 'next/cache'

type FormState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined

export async function saveProfile(state: FormState, formData: FormData): Promise<FormState> {
  const session = await verifySession()

  const get = (k: string) => (formData.get(k) as string ?? '').trim()
  const name = get('name')
  const email = get('email').toLowerCase()
  const phone = get('phone')

  const errors: Record<string, string[]> = {}
  if (name.length < 2) errors.name = ['Укажите имя']
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Некорректный email']
  if (phone && !/^[\d+()\-\s]{7,20}$/.test(phone)) errors.phone = ['Некорректный телефон']
  if (Object.keys(errors).length) return { errors }

  const existing = await sql`SELECT id FROM "User" WHERE email = ${email} AND id != ${session.userId} LIMIT 1`
  if (existing.length) return { errors: { email: ['Этот email уже используется другим аккаунтом'] } }

  try {
    const rows = await sql`
      UPDATE "User" SET
        name = ${name},
        email = ${email},
        phone = ${phone || null},
        "updatedAt" = NOW()
      WHERE id = ${session.userId}
      RETURNING id, role, name, email`
    const user = rows[0] as { id: string; role: string; name: string; email: string }
    // Сессия (JWT) хранит имя/email — переиздаём, иначе в шапке будут старые данные до переавторизации.
    await createSession(user)
  } catch {
    return { message: 'Не удалось сохранить данные. Попробуйте позже.' }
  }

  revalidatePath('/dashboard')
  return { success: true }
}
