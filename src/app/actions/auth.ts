'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { createSession } from '@/lib/session'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').trim(),
  email: z.email('Введите корректный email').trim(),
  phone: z.string().min(10, 'Введите корректный номер телефона').trim(),
  password: z.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  role: z.enum(['GUEST', 'OWNER']),
})

const LoginSchema = z.object({
  email: z.email('Введите корректный email').trim(),
  password: z.string().min(1, 'Введите пароль'),
})

type FormState = { errors?: Record<string, string[]>; message?: string } | undefined

export async function register(state: FormState, formData: FormData): Promise<FormState> {
  const validated = RegisterSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    password: formData.get('password'),
    role: formData.get('role'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  if (formData.get('consent') !== 'on') {
    return { errors: { consent: ['Необходимо согласие на обработку персональных данных'] } }
  }

  const { name, email, phone, password, role } = validated.data

  let user
  try {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return { errors: { email: ['Email уже зарегистрирован'] } }

    const passwordHash = await bcrypt.hash(password, 10)
    user = await prisma.user.create({ data: { name, email, phone, passwordHash, role } })
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && err.code === 'P2002') {
      return { errors: { email: ['Email уже зарегистрирован'] } }
    }
    console.error('Ошибка регистрации:', err)
    return { message: 'Не удалось создать аккаунт. Попробуйте ещё раз через пару минут.' }
  }

  await createSession({ id: user.id, role: user.role, name: user.name, email: user.email })
  redirect(role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest')
}

export async function login(state: FormState, formData: FormData): Promise<FormState> {
  const validated = LoginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { email, password } = validated.data

  let user
  try {
    user = await prisma.user.findUnique({ where: { email } })
    if (!user) return { message: 'Неверный email или пароль' }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) return { message: 'Неверный email или пароль' }
  } catch (err: unknown) {
    console.error('Ошибка входа:', err)
    return { message: 'Сервис временно недоступен. Попробуйте ещё раз через пару минут.' }
  }

  await createSession({ id: user.id, role: user.role, name: user.name, email: user.email })
  redirect(user.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest')
}

