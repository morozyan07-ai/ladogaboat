export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'
import { createPayment } from '@/lib/cloudpayments'

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

  const days = Math.ceil(
    (new Date(booking.endDate as string).getTime() - new Date(booking.startDate as string).getTime()) / 86400000
  )

  let order
  try {
    order = await createPayment({
      amountRub: Number(booking.totalPrice),
      description: `Аренда: ${booking.boatTitle ?? 'катер'} (${days} дн.)`,
      bookingId: booking.id as string,
      successUrl: `${SITE_URL}/dashboard/guest?payment=done&booking=${booking.id}`,
      failUrl: `${SITE_URL}/dashboard/guest?payment=failed&booking=${booking.id}`,
    })
  } catch (err) {
    console.error('CloudPayments createPayment error:', err)
    return Response.json({ error: 'Не удалось создать платёж' }, { status: 502 })
  }

  if (order.Id) {
    await sql`UPDATE "Booking" SET "cloudPaymentsInvoiceId" = ${order.Id} WHERE id = ${bookingId}`
  }

  return Response.json({ paymentUrl: order.Url ?? null })
}
