'use server'

import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { CONTACTS } from '@/lib/contacts'

const SupportSchema = z.object({
  name: z.string().min(2, 'Введите ФИО').trim(),
  email: z.email('Введите корректный email').trim(),
  phone: z.string().min(5, 'Введите телефон').trim(),
  subject: z.string().min(2, 'Укажите тему обращения').trim(),
  message: z.string().min(10, 'Опишите проблему подробнее (минимум 10 символов)').trim(),
})

type FormState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined

export async function submitSupportRequest(state: FormState, formData: FormData): Promise<FormState> {
  const validated = SupportSchema.safeParse({
    name: formData.get('name'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, email, phone, subject, message } = validated.data

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
