// Webhook от ЮKassa — вызывается при изменении статуса платежа.
// Настройте URL в ЮKassa → Интеграция → HTTP-уведомления:
//   https://www.ladogaboat.ru/api/payments/webhook

import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Обрабатываем только успешную оплату
    if (body.event !== 'payment.succeeded') {
      return Response.json({ ok: true })
    }

    const payment = body.object as {
      id: string
      status: string
      metadata?: { bookingId?: string }
    }

    const bookingId = payment?.metadata?.bookingId
    if (!bookingId) {
      console.error('Webhook: no bookingId in metadata', body)
      return Response.json({ error: 'no bookingId' }, { status: 400 })
    }

    const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
    if (!booking) {
      console.error('Webhook: booking not found', bookingId)
      return Response.json({ error: 'booking not found' }, { status: 404 })
    }

    // Идемпотентность: если уже подтверждено — ок
    if (booking.status === 'CONFIRMED') {
      return Response.json({ ok: true })
    }

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        yookassaPaymentId: payment.id,
        paidAt: new Date(),
      },
    })

    console.log(`Booking ${bookingId} confirmed via YooKassa payment ${payment.id}`)
    return Response.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ error: 'internal' }, { status: 500 })
  }
}
