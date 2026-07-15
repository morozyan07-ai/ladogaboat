'use server'

import { sendEmail } from '@/lib/email'
import { CONTACTS } from '@/lib/contacts'

type FormState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined

export async function submitServiceCenterLead(state: FormState, formData: FormData): Promise<FormState> {
  const name = (formData.get('name') as string ?? '').trim()
  const phone = (formData.get('phone') as string ?? '').trim()
  const email = (formData.get('email') as string ?? '').trim() || undefined
  const message = (formData.get('message') as string ?? '').trim() || undefined

  const errors: Record<string, string[]> = {}
  if (name.length < 2) errors.name = ['Введите имя']
  if (phone.length < 5) errors.phone = ['Введите телефон']
  if (Object.keys(errors).length) return { errors }

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
