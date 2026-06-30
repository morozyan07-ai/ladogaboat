'use client'

import { useActionState } from 'react'
import { savePayoutDetails } from '@/app/actions/payout'
import Button from '@/components/ui/Button'

type Props = {
  initial: {
    payoutLegalName?: string | null
    payoutInn?: string | null
    payoutOgrn?: string | null
    payoutBankName?: string | null
    payoutBik?: string | null
    payoutAccount?: string | null
    payoutCorrAccount?: string | null
    payoutUpdatedAt?: Date | null
  }
}

const inputCls =
  'w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'

export default function OwnerPayoutForm({ initial }: Props) {
  const [state, action, pending] = useActionState(savePayoutDetails, undefined)

  const isFilled = Boolean(initial.payoutInn)

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800">Реквизиты для выплат</h2>
        <p className="text-sm text-slate-500 mt-1">
          Используются для перевода вашей доли от бронирований (за вычетом комиссии Платформы 8%) на
          расчётный счёт. Заполняются один раз для ИП или ООО.
        </p>
      </div>
      <form action={action} className="p-6 space-y-4">
        {state?.success && (
          <p className="text-green-700 text-sm bg-green-50 rounded-lg px-4 py-3">Реквизиты сохранены.</p>
        )}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Полное наименование (ИП/ООО)
          </label>
          <input
            name="payoutLegalName"
            required
            defaultValue={initial.payoutLegalName ?? ''}
            placeholder="Индивидуальный предприниматель Иванов Иван Иванович"
            className={inputCls}
          />
          {state?.errors?.payoutLegalName && (
            <p className="text-red-500 text-xs mt-1">{state.errors.payoutLegalName[0]}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ИНН</label>
            <input
              name="payoutInn"
              required
              inputMode="numeric"
              defaultValue={initial.payoutInn ?? ''}
              placeholder="10 или 12 цифр"
              className={inputCls}
            />
            {state?.errors?.payoutInn && <p className="text-red-500 text-xs mt-1">{state.errors.payoutInn[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">ОГРН / ОГРНИП</label>
            <input
              name="payoutOgrn"
              required
              inputMode="numeric"
              defaultValue={initial.payoutOgrn ?? ''}
              placeholder="13 или 15 цифр"
              className={inputCls}
            />
            {state?.errors?.payoutOgrn && <p className="text-red-500 text-xs mt-1">{state.errors.payoutOgrn[0]}</p>}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Банк</label>
          <input
            name="payoutBankName"
            required
            defaultValue={initial.payoutBankName ?? ''}
            placeholder='АО «Банк»'
            className={inputCls}
          />
          {state?.errors?.payoutBankName && (
            <p className="text-red-500 text-xs mt-1">{state.errors.payoutBankName[0]}</p>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">БИК</label>
            <input
              name="payoutBik"
              required
              inputMode="numeric"
              defaultValue={initial.payoutBik ?? ''}
              placeholder="9 цифр"
              className={inputCls}
            />
            {state?.errors?.payoutBik && <p className="text-red-500 text-xs mt-1">{state.errors.payoutBik[0]}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Корр. счёт банка</label>
            <input
              name="payoutCorrAccount"
              required
              inputMode="numeric"
              defaultValue={initial.payoutCorrAccount ?? ''}
              placeholder="20 цифр"
              className={inputCls}
            />
            {state?.errors?.payoutCorrAccount && (
              <p className="text-red-500 text-xs mt-1">{state.errors.payoutCorrAccount[0]}</p>
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Расчётный счёт</label>
          <input
            name="payoutAccount"
            required
            inputMode="numeric"
            defaultValue={initial.payoutAccount ?? ''}
            placeholder="20 цифр"
            className={inputCls}
          />
          {state?.errors?.payoutAccount && (
            <p className="text-red-500 text-xs mt-1">{state.errors.payoutAccount[0]}</p>
          )}
        </div>
        {state?.message && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-3">{state.message}</p>}
        <div className="flex items-center justify-between pt-2">
          {initial.payoutUpdatedAt ? (
            <p className="text-xs text-slate-400">
              Обновлено: {new Date(initial.payoutUpdatedAt).toLocaleDateString('ru-RU')}
            </p>
          ) : (
            <p className="text-xs text-amber-600">Реквизиты пока не заполнены</p>
          )}
          <Button type="submit" loading={pending}>
            {isFilled ? 'Обновить реквизиты' : 'Сохранить реквизиты'}
          </Button>
        </div>
      </form>
    </div>
  )
}
