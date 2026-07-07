export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { sendEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    if (body.event !== 'payment.succeeded') return Response.json({ ok: true })

    const payment = body.object as { id: string; status: string; metadata?: { bookingId?: string } }
    const bookingId = payment?.metadata?.bookingId
    if (!bookingId) {
      console.error('Webhook: no bookingId in metadata', body)
      return Response.json({ error: 'no bookingId' }, { status: 400 })
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
      console.error('Webhook: booking not found', bookingId)
      return Response.json({ error: 'booking not found' }, { status: 404 })
    }
    const booking = rows[0] as Record<string, unknown>

    if (booking.status === 'CONFIRMED') return Response.json({ ok: true })

    await sql`
      UPDATE "Booking" SET
        status = 'CONFIRMED'::"BookingStatus",
        "yookassaPaymentId" = ${payment.id},
        "paidAt" = NOW(),
        "updatedAt" = NOW()
      WHERE id = ${bookingId}`

    console.log(`Booking ${bookingId} confirmed via YooKassa payment ${payment.id}`)

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

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ error: 'internal' }, { status: 500 })
  }
}
