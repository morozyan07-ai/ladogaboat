'use server'

import { redirect } from 'next/navigation'
import { hash } from 'bcrypt-ts/browser'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'
const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 час

type FormState = { errors?: Record<string, string[]>; message?: string; ok?: boolean } | undefined

export async function requestPasswordReset(state: FormState, formData: FormData): Promise<FormState> {
  const email = (formData.get('email') as string ?? '').trim().toLowerCase()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { errors: { email: ['Введите корректный email'] } }
  }

  const rows = await sql`SELECT id, name FROM "User" WHERE email = ${email} LIMIT 1`
  const user = rows[0] as { id: string; name: string } | undefined

  if (user) {
    await sql`DELETE FROM "PasswordResetToken" WHERE "userId" = ${user.id}`

    const bytes = crypto.getRandomValues(new Uint8Array(32))
    const token = Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)
    const id = crypto.randomUUID()

    await sql`
      INSERT INTO "PasswordResetToken" (id, "userId", token, "expiresAt", "createdAt")
      VALUES (${id}, ${user.id}, ${token}, ${expiresAt.toISOString()}, NOW())`

    const resetUrl = `${SITE_URL}/auth/reset?token=${token}`

    await sendEmail({
      to: email,
      subject: 'Сброс пароля — Ladoga Boat',
      text: [
        `Здравствуйте, ${user.name}!`,
        '',
        'Мы получили запрос на сброс пароля вашего аккаунта на Ladoga Boat.',
        '',
        'Перейдите по ссылке для создания нового пароля:',
        resetUrl,
        '',
        'Ссылка действует 1 час. Если вы не запрашивали сброс — просто проигнорируйте это письмо.',
        '',
        '— Команда Ladoga Boat',
      ].join('\n'),
    })
  }

  return {
    ok: true,
    message: `Если аккаунт с адресом ${email} существует, на него отправлено письмо со ссылкой для сброса пароля.`,
  }
}

export async function resetPassword(state: FormState, formData: FormData): Promise<FormState> {
  const token = formData.get('token') as string ?? ''
  const password = formData.get('password') as string ?? ''
  const passwordConfirm = formData.get('passwordConfirm') as string ?? ''

  const errors: Record<string, string[]> = {}
  if (!token) errors.token = ['Токен отсутствует']
  if (password.length < 6) errors.password = ['Пароль должен содержать минимум 6 символов']
  if (password !== passwordConfirm) errors.passwordConfirm = ['Пароли не совпадают']
  if (Object.keys(errors).length) return { errors }

  const rows = await sql`SELECT id, "userId", "usedAt", "expiresAt" FROM "PasswordResetToken" WHERE token = ${token} LIMIT 1`
  const record = rows[0] as { id: string; userId: string; usedAt: string | null; expiresAt: string } | undefined

  if (!record || record.usedAt || new Date(record.expiresAt) < new Date()) {
    return { message: 'Ссылка недействительна или устарела. Запросите новую.' }
  }

  const passwordHash = await hash(password, 10)

  await sql`UPDATE "User" SET "passwordHash" = ${passwordHash}, "updatedAt" = NOW() WHERE id = ${record.userId}`
  await sql`UPDATE "PasswordResetToken" SET "usedAt" = NOW() WHERE id = ${record.id}`

  redirect('/auth/login?reset=done')
}
