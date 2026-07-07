export const dynamic = 'force-dynamic'
import type { Metadata } from 'next'
import Link from 'next/link'
import { sql } from '@/lib/db'

export const metadata: Metadata = {
  title: 'Бронирование принято',
  robots: 'noindex',
}

type Props = { searchParams: Promise<{ code?: string }> }

export default async function BookingConfirmPage({ searchParams }: Props) {
  const { code } = await searchParams

  let booking: Record<string, unknown> | null = null
  if (code) {
    const rows = await sql`
      SELECT bk.*, bo.title as "boatTitle", bo.location as "boatLocation"
      FROM "Booking" bk
      JOIN "Boat" bo ON bo.id = bk."boatId"
      WHERE bk."bookingCode" = ${code} LIMIT 1`
    booking = (rows[0] as Record<string, unknown>) ?? null
  }

  if (!booking) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="text-5xl mb-4">404</div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">Бронирование не найдено</h1>
          <p className="text-slate-500 mb-6">
            Проверьте код в письме. Если письмо не пришло — напишите нам.
          </p>
          <Link href="/support" className="text-blue-600 hover:underline text-sm">
            Связаться с поддержкой
          </Link>
        </div>
      </div>
    )
  }

  const startFmt = new Date(booking.startDate as string).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  const endFmt = new Date(booking.endDate as string).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
  const isPaid = booking.status === 'CONFIRMED' || !!booking.paidAt

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="text-5xl mb-4">{isPaid ? 'OK' : '...'}</div>
          <h1 className="text-2xl font-semibold text-slate-800 mb-2">
            {isPaid ? 'Бронирование подтверждено!' : 'Бронирование принято'}
          </h1>
          <p className="text-slate-500 mb-6 text-sm">
            {isPaid
              ? 'Оплата прошла. Ждём вас на Ладоге!'
              : 'Детали отправлены на ваш email. Ожидаем оплату.'}
          </p>

          <div className="bg-slate-50 rounded-xl p-4 text-left space-y-2 mb-6">
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Код бронирования</span>
              <span className="font-mono font-bold text-slate-900">{booking.bookingCode as string}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Катер</span>
              <span className="font-medium text-slate-800 text-right max-w-[60%]">{booking.boatTitle as string}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Место</span>
              <span className="text-slate-700">{booking.boatLocation as string}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-500">Даты</span>
              <span className="text-slate-700">{startFmt} — {endFmt}</span>
            </div>
            <div className="flex justify-between text-sm font-semibold pt-2 border-t border-slate-200">
              <span className="text-slate-700">Сумма</span>
              <span className="text-slate-900">{Number(booking.totalPrice).toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          {!isPaid && (
            <p className="text-xs text-slate-400 mb-4">
              Судовладелец получил уведомление и свяжется с вами.
            </p>
          )}

          <Link href="/boats"
            className="block w-full text-center bg-blue-600 text-white font-semibold px-6 py-3 rounded-xl hover:bg-blue-700 transition-colors">
            Смотреть другие катера
          </Link>
          <Link href="/support"
            className="block mt-3 text-sm text-slate-400 hover:text-slate-600 transition-colors">
            Нужна помощь? Написать в поддержку
          </Link>
        </div>
      </div>
    </div>
  )
}
