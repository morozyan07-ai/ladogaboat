'use server'

import { z } from 'zod'
import { sendEmail } from '@/lib/email'
import { CONTACTS } from '@/lib/contacts'

const ServiceCenterLeadSchema = z.object({
  name: z.string().min(2, 'Введите имя').trim(),
  phone: z.string().min(5, 'Введите телефон').trim(),
  email: z.string().trim().optional(),
  message: z.string().trim().optional(),
})

type FormState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined

export async function submitServiceCenterLead(state: FormState, formData: FormData): Promise<FormState> {
  const validated = ServiceCenterLeadSchema.safeParse({
    name: formData.get('name'),
    phone: formData.get('phone'),
    email: formData.get('email') || undefined,
    message: formData.get('message') || undefined,
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  const { name, phone, email, message } = validated.data

  const { ok } = await sendEmail({
    to: CONTACTS.supportEmail,
    subject: `Заявка: Сервисный центр Ladoga Boat`,
    text: `Имя: ${name}\nТелефон: ${phone}\nEmail: ${email || '—'}\n\n${message || 'Без комментария'}`,
    replyTo: email,
  })

  if (!ok) {
    return { message: 'Не удалось отправить заявку. Попробуйте позже или напишите нам напрямую.' }
  }

  return { success: true }
}
