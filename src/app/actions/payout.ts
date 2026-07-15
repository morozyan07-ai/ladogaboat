'use server'

import { sql } from '@/lib/db'
import { verifyOwner } from '@/lib/dal'
import { revalidatePath } from 'next/cache'

type FormState = { errors?: Record<string, string[]>; message?: string; success?: boolean } | undefined

export async function savePayoutDetails(state: FormState, formData: FormData): Promise<FormState> {
  const session = await verifyOwner()

  const get = (k: string) => (formData.get(k) as string ?? '').trim()
  const payoutLegalName = get('payoutLegalName')
  const payoutInn = get('payoutInn')
  const payoutOgrn = get('payoutOgrn')
  const payoutBankName = get('payoutBankName')
  const payoutBik = get('payoutBik')
  const payoutAccount = get('payoutAccount')
  const payoutCorrAccount = get('payoutCorrAccount')

  const errors: Record<string, string[]> = {}
  if (payoutLegalName.length < 3) errors.payoutLegalName = ['Укажите полное наименование (ИП/ООО)']
  if (!/^\d{10}$|^\d{12}$/.test(payoutInn)) errors.payoutInn = ['ИНН должен содержать 10 (ООО) или 12 (ИП) цифр']
  if (!/^\d{13}$|^\d{15}$/.test(payoutOgrn)) errors.payoutOgrn = ['ОГРН (13 цифр) или ОГРНИП (15 цифр)']
  if (payoutBankName.length < 2) errors.payoutBankName = ['Укажите название банка']
  if (!/^\d{9}$/.test(payoutBik)) errors.payoutBik = ['БИК должен содержать 9 цифр']
  if (!/^\d{20}$/.test(payoutAccount)) errors.payoutAccount = ['Расчётный счёт должен содержать 20 цифр']
  if (!/^\d{20}$/.test(payoutCorrAccount)) errors.payoutCorrAccount = ['Корреспондентский счёт должен содержать 20 цифр']
  if (Object.keys(errors).length) return { errors }

  try {
    await sql`
      UPDATE "User" SET
        "payoutLegalName" = ${payoutLegalName},
        "payoutInn" = ${payoutInn},
        "payoutOgrn" = ${payoutOgrn},
        "payoutBankName" = ${payoutBankName},
        "payoutBik" = ${payoutBik},
        "payoutAccount" = ${payoutAccount},
        "payoutCorrAccount" = ${payoutCorrAccount},
        "payoutUpdatedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${session.userId}`
  } catch {
    return { message: 'Не удалось сохранить реквизиты. Попробуйте позже.' }
  }

  revalidatePath('/dashboard/owner')
  return { success: true }
}
