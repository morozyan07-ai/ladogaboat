'use server'

import { redirect } from 'next/navigation'
import { randomBytes } from 'crypto'
import { hash } from 'bcrypt-ts/browser'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'
const TOKEN_TTL_MS = 60 * 60 * 1000 // 1 час

type FormState = { errors?: Record<string, string[]>; message?: string; ok?: boolean } | undefined

// ─── Шаг 1: запросить сброс ────────────────────────────────────────────────

const ForgotSchema = z.object({
  email: z.email('Введите корректный email').trim(),
})

export async function requestPasswordReset(state: FormState, formData: FormData): Promise<FormState> {
  const validated = ForgotSchema.safeParse({ email: formData.get('email') })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email } = validated.data

  // Намеренно не раскрываем, есть ли такой email (защита от перебора)
  const user = await prisma.user.findUnique({ where: { email } })
  if (user) {
    // Инвалидируем старые токены этого пользователя
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } })

    const token = randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + TOKEN_TTL_MS)

    await prisma.passwordResetToken.create({
      data: { userId: user.id, token, expiresAt },
    })

    const resetUrl = `${SITE_URL}/auth/reset?token=${token}`

    await sendEmail({
      to: email,
      subject: 'Сброс пароля — Ladoga Boat',
      text: [
        `Здравствуйте, ${user.name}!`,
        '',
        'Мы получили запрос на сброс пароля вашего аккаунта на Ladoga Boat.',
        '',
        `Перейдите по ссылке для создания нового пароля:`,
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

// ─── Шаг 2: установить новый пароль ───────────────────────────────────────

const ResetSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  passwordConfirm: z.string(),
}).refine((d) => d.password === d.passwordConfirm, {
  message: 'Пароли не совпадают',
  path: ['passwordConfirm'],
})

export async function resetPassword(state: FormState, formData: FormData): Promise<FormState> {
  const validated = ResetSchema.safeParse({
    token: formData.get('token'),
    password: formData.get('password'),
    passwordConfirm: formData.get('passwordConfirm'),
  })
  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { token, password } = validated.data

  const record = await prisma.passwordResetToken.findUnique({ where: { token } })

  if (!record || record.usedAt || record.expiresAt < new Date()) {
    return { message: 'Ссылка недействительна или устарела. Запросите новую.' }
  }

  const passwordHash = await hash(password, 10)

  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } })
    await tx.passwordResetToken.update({ where: { id: record.id }, data: { usedAt: new Date() } })
  })

  redirect('/auth/login?reset=done')
}
