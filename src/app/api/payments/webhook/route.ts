// Webhook от ЮKassa — вызывается при изменении статуса платежа.
// Настройте URL в ЮKassa → Интеграция → HTTP-уведомления:
//   https://www.ladogaboat.ru/api/payments/webhook

import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

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

    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        boat: { select: { title: true, location: true } },
        guest: { select: { name: true, email: true } },
      },
    })
    if (!booking) {
      console.error('Webhook: booking not found', bookingId)
      return Response.json({ error: 'booking not found' }, { status: 404 })
    }

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

    const guestEmail = booking.guest?.email ?? booking.guestEmail
    const guestName = booking.guest?.name ?? booking.guestName ?? 'Гость'

    if (guestEmail) {
      const startFmt = new Date(booking.startDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
      const endFmt = new Date(booking.endDate).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })
      const confirmUrl = booking.bookingCode
        ? `${SITE_URL}/booking/confirm?code=${booking.bookingCode}`
        : `${SITE_URL}/dashboard/guest`

      await sendEmail({
        to: guestEmail,
        subject: `Oplata podtverzhdena — ${booking.boat.title} (${startFmt})`,
        text: [
          `Zdravstvuyte, ${guestName}!`,
          '',
          'Oplata proshla uspeshno. Bronirovanie podtverzhdeno.',
          '',
          `Kod bronirovaniya: ${booking.bookingCode ?? bookingId}`,
          `Kater: ${booking.boat.title}`,
          `Mesto: ${booking.boat.location}`,
          `Daty: ${startFmt} — ${endFmt}`,
          `Summa: ${Number(booking.totalPrice).toLocaleString('ru-RU')} RUB`,
          '',
          `Detali: ${confirmUrl}`,
          '',
          'Zhdem vas na Ladoge! Voprosy: support@ladogaboat.ru',
          '',
          'Ladoga Boat',
        ].join('\n'),
      })
    }

    return Response.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return Response.json({ error: 'internal' }, { status: 500 })
  }
}
