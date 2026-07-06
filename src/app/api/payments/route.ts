import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'
import { createPayment, getPayment } from '@/lib/yookassa'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })

  const body = await req.json().catch(() => ({})) as { bookingId?: string }
  const { bookingId } = body
  if (!bookingId) return Response.json({ error: 'bookingId required' }, { status: 400 })

  const rows = await sql`
    SELECT bk.*, bo.title as "boatTitle"
    FROM "Booking" bk
    JOIN "Boat" bo ON bo.id = bk."boatId"
    WHERE bk.id = ${bookingId} LIMIT 1`
  if (!rows.length) return Response.json({ error: 'Бронирование не найдено' }, { status: 404 })
  const booking = rows[0] as Record<string, unknown>

  if (booking.guestId !== session.userId) return Response.json({ error: 'Нет доступа' }, { status: 403 })
  if (booking.status !== 'PENDING') {
    return Response.json({ error: 'Бронирование уже подтверждено или отменено' }, { status: 400 })
  }

  if (booking.yookassaPaymentId) {
    try {
      const existing = await getPayment(booking.yookassaPaymentId as string)
      if (existing.status === 'pending' && existing.confirmation?.confirmation_url) {
        return Response.json({ paymentUrl: existing.confirmation.confirmation_url })
      }
    } catch { /* создадим новый */ }
  }

  const days = Math.ceil(
    (new Date(booking.endDate as string).getTime() - new Date(booking.startDate as string).getTime()) / 86400000
  )

  const payment = await createPayment({
    amountRub: Number(booking.totalPrice),
    description: `Аренда: ${booking.boatTitle ?? 'катер'} (${days} дн.)`,
    bookingId: booking.yookassaPaymentId ? `${booking.id}-retry-${Date.now()}` : booking.id as string,
    returnUrl: `${SITE_URL}/dashboard/guest?payment=done&booking=${booking.id}`,
  })

  if (payment.id) {
    await sql`UPDATE "Booking" SET "yookassaPaymentId" = ${payment.id} WHERE id = ${bookingId}`
  }

  return Response.json({ paymentUrl: payment.confirmation?.confirmation_url ?? null })
}
