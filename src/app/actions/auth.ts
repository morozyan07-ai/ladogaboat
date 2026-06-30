'use server'

import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { createSession, deleteSession } from '@/lib/session'

const RegisterSchema = z.object({
  name: z.string().min(2, 'Имя должно содержать минимум 2 символа').trim(),
  email: z.email('Введите корректный email').trim(),
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
    password: formData.get('password'),
    role: formData.get('role'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, password, role } = validated.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return { errors: { email: ['Email уже зарегистрирован'] } }

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, passwordHash, role } })

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
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return { message: 'Неверный email или пароль' }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) return { message: 'Неверный email или пароль' }

  await createSession({ id: user.id, role: user.role, name: user.name, email: user.email })
  redirect(user.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest')
}

export async function logout() {
  await deleteSession()
  redirect('/')
}
