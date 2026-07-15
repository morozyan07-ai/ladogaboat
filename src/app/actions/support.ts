'use server'

import { sendEmail } from '@/lib/email'
import { CONTACTS } from '@/lib/contacts'

type FormState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined

export async function submitSupportRequest(state: FormState, formData: FormData): Promise<FormState> {
  const name = (formData.get('name') as string ?? '').trim()
  const email = (formData.get('email') as string ?? '').trim().toLowerCase()
  const phone = (formData.get('phone') as string ?? '').trim()
  const subject = (formData.get('subject') as string ?? '').trim()
  const message = (formData.get('message') as string ?? '').trim()

  const errors: Record<string, string[]> = {}
  if (name.length < 2) errors.name = ['Введите ФИО']
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = ['Введите корректный email']
  if (phone.length < 5) errors.phone = ['Введите телефон']
  if (subject.length < 2) errors.subject = ['Укажите тему обращения']
  if (message.length < 10) errors.message = ['Опишите проблему подробнее (минимум 10 символов)']
  if (Object.keys(errors).length) return { errors }

  const { ok } = await sendEmail({
    to: CONTACTS.supportEmail,
    subject: `Обращение в поддержку: ${subject}`,
    text: `ФИО: ${name}\nEmail: ${email}\nТелефон: ${phone}\nТема: ${subject}\n\n${message}`,
    replyTo: email,
  })

  if (!ok) {
    return { message: 'Не удалось отправить обращение. Попробуйте позже или напишите нам напрямую.' }
  }

  return { success: true }
}
