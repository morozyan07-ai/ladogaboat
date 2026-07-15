'use server'

import { z } from 'zod'
import prisma from '@/lib/prisma'
import { verifyOwner } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

// Реквизиты для выплат судовладельцу (ИП/ООО) — используются для сплитования
// платежей через ЮKassa и/или прямых выплат на расчётный счёт (см. п.15 задач).
const PayoutSchema = z.object({
  payoutLegalName: z.string().min(3, 'Укажите полное наименование (ИП/ООО)').trim(),
  payoutInn: z
    .string()
    .trim()
    .regex(/^\d{10}$|^\d{12}$/, 'ИНН должен содержать 10 (ООО) или 12 (ИП) цифр'),
  payoutOgrn: z
    .string()
    .trim()
    .regex(/^\d{13}$|^\d{15}$/, 'ОГРН (13 цифр) или ОГРНИП (15 цифр)'),
  payoutBankName: z.string().min(2, 'Укажите название банка').trim(),
  payoutBik: z
    .string()
    .trim()
    .regex(/^\d{9}$/, 'БИК должен содержать 9 цифр'),
  payoutAccount: z
    .string()
    .trim()
    .regex(/^\d{20}$/, 'Расчётный счёт должен содержать 20 цифр'),
  payoutCorrAccount: z
    .string()
    .trim()
    .regex(/^\d{20}$/, 'Корреспондентский счёт должен содержать 20 цифр'),
})

type FormState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined

export async function savePayoutDetails(state: FormState, formData: FormData): Promise<FormState> {
  const session = await verifyOwner()

  const validated = PayoutSchema.safeParse({
    payoutLegalName: formData.get('payoutLegalName'),
    payoutInn: formData.get('payoutInn'),
    payoutOgrn: formData.get('payoutOgrn'),
    payoutBankName: formData.get('payoutBankName'),
    payoutBik: formData.get('payoutBik'),
    payoutAccount: formData.get('payoutAccount'),
    payoutCorrAccount: formData.get('payoutCorrAccount'),
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  try {
    await prisma.user.update({
      where: { id: session.userId },
      data: { ...validated.data, payoutUpdatedAt: new Date() },
    })
  } catch {
    return { message: 'Не удалось сохранить реквизиты. Попробуйте позже.' }
  }

  revalidatePath('/dashboard/owner')
  return { success: true }
}
