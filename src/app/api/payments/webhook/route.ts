export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { verifyWebhookSignature } from '@/lib/cloudpayments'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'

// Единый обработчик уведомлений CloudPayments (Pay и Fail можно указать на один URL —
// событие различается по полю Status). Тело может прийти как application/x-www-form-urlencoded
// (по умолчанию) или application/json (если так настроено в ЛК CloudPayments).
function parseBody(raw: string, contentType: string): Record<string, string> {
  if (contentType.includes('application/json')) {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  const params = new URLSearchParams(raw)
  const obj: Record<string, string> = {}
  for (const [k, v] of params) obj[k] = v
  return obj
}

export async function POST(req: NextRequest) {
  try {
    const raw = await req.text()
    const signature = req.headers.get('Content-HMAC')
    const validSignature = await verifyWebhookSignature(raw, signature)
    if (!validSignature) {
      console.error('CloudPayments webhook: неверная подпись Content-HMAC')
      // код != 0 — CloudPayments повторит попытку; на случай, если ключ ещё не обновлён в CF Secrets
      return Response.json({ code: 13 })
    }

    const contentType = req.headers.get('content-type') ?? ''
    const data = parseBody(raw, contentType)

    const bookingId = data.InvoiceId
    const transactionId = data.TransactionId
    const status = data.Status // 'Completed' — успешная оплата (уведомление Pay)

    if (!bookingId) {
      console.error('CloudPayments webhook: нет InvoiceId', data)
      return Response.json({ code: 0 })
    }

    if (status !== 'Completed') {
      // Уведомление Fail (или иной незавершённый статус) — бронирование остаётся PENDING,
      // гость может повторить оплату из личного кабинета.
      console.log(`CloudPayments: платёж по бронированию ${bookingId} не завершён (status=${status})`)
      return Response.json({ code: 0 })
    }

    const rows = await sql`
      SELECT bk.*,
        bo.title as "boatTitle", bo.location as "boatLocation",
        g.name as "guestName2", g.email as "guestEmail2"
      FROM "Booking" bk
      JOIN "Boat" bo ON bo.id = bk."boatId"
      LEFT JOIN "User" g ON g.id = bk."guestId"
      WHERE bk.id = ${bookingId} LIMIT 1`
    if (!rows.length) {
      console.error('CloudPayments webhook: бронирование не найдено', bookingId)
      return Response.json({ code: 0 })
    }
    const booking = rows[0] as Record<string, unknown>

    if (booking.status === 'CONFIRMED') return Response.json({ code: 0 })

    await sql`
      UPDATE "Booking" SET
        status = 'CONFIRMED'::"BookingStatus",
        "cloudPaymentsTransactionId" = ${transactionId ?? null},
        "paidAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${bookingId}`

    console.log(`Booking ${bookingId} confirmed via CloudPayments transaction ${transactionId}`)

    const guestEmail = (booking.guestEmail2 ?? booking.guestEmail) as string | null
    const guestName = ((booking.guestName2 ?? booking.guestName ?? 'Гость') as string)

    if (guestEmail) {
      const startFmt = new Date(booking.startDate as string).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
      const endFmt = new Date(booking.endDate as string).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      const confirmUrl = booking.bookingCode
        ? `${SITE_URL}/booking/confirm?code=${booking.bookingCode}`
        : `${SITE_URL}/dashboard/guest`

      await sendEmail({
        to: guestEmail,
        subject: `Оплата подтверждена — ${booking.boatTitle} (${startFmt})`,
        text: [
          `Здравствуйте, ${guestName}!`, '',
          'Оплата прошла успешно. Бронирование подтверждено.', '',
          `Код бронирования: ${booking.bookingCode ?? bookingId}`,
          `Катер: ${booking.boatTitle}`,
          `Место: ${booking.boatLocation}`,
          `Даты: ${startFmt} — ${endFmt}`,
          `Сумма: ${Number(booking.totalPrice).toLocaleString('ru-RU')} ₽`, '',
          `Детали: ${confirmUrl}`, '',
          'Ждём вас на Ладоге! Вопросы: support@ladogaboat.ru', '', 'Ladoga Boat',
        ].join('\n'),
      })
    }

    return Response.json({ code: 0 })
  } catch (err) {
    console.error('CloudPayments webhook error:', err)
    // код != 0 — пусть CloudPayments повторит попытку, возможно сбой был временным (БД/сеть)
    return Response.json({ code: 13 })
  }
}
