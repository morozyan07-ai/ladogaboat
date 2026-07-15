
// POST /api/payments — создаёт (или повторяет) ссылку на оплату для существующего PENDING-бронирования.
// Используется кнопкой "Оплатить" в ЛК гостя.

import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createPayment, getPayment } from '@/lib/yookassa'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { bookingId } = body as { bookingId?: string }
  if (!bookingId) return Response.json({ error: 'bookingId required' }, { status: 400 })

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { boat: { select: { title: true } } },
  })

  if (!booking) return Response.json({ error: 'Бронирование не найдено' }, { status: 404 })
  if (booking.guestId !== session.userId) return Response.json({ error: 'Нет доступа' }, { status: 403 })
  if (booking.status !== 'PENDING') {
    return Response.json({ error: 'Бронирование уже подтверждено или отменено' }, { status: 400 })
  }

  // Если у бронирования уже есть платёж — проверяем его статус прежде чем создавать новый
  if (booking.yookassaPaymentId) {
    try {
      const existing = await getPayment(booking.yookassaPaymentId)
      if (existing.status === 'pending' && existing.confirmation?.confirmation_url) {
        return Response.json({ paymentUrl: existing.confirmation.confirmation_url })
      }
      // Платёж просрочен/отменён — создадим новый (idempotency key меняем добавив суффикс)
    } catch {
      // Не удалось получить статус — создаём новый
    }
  }

  const days = Math.ceil(
    (new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / 86400000
  )

  const payment = await createPayment({
    amountRub: Number(booking.totalPrice),
    description: `Аренда: ${booking.boat?.title ?? 'катер'} (${days} дн.)`,
    bookingId: booking.yookassaPaymentId ? `${booking.id}-retry-${Date.now()}` : booking.id,
    returnUrl: `${SITE_URL}/dashboard/guest?payment=done&booking=${booking.id}`,
  })

  if (payment.id) {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { yookassaPaymentId: payment.id },
    })
  }

  return Response.json({ paymentUrl: payment.confirmation?.confirmation_url ?? null })
}
