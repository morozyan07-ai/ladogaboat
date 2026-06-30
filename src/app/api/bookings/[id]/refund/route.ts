import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { sendEmail } from '@/lib/email'
import { CONTACTS } from '@/lib/contacts'

// Гость запрашивает возврат средств по оплаченному бронированию (см. оферту п.4).
// Заявка фиксируется на бронировании и уходит письмом в поддержку — фактический
// возврат денег Оператор выполняет вручную, пока в ЮKassa не подключён возврат API.
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })

  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { boat: { select: { title: true, ownerId: true } }, guest: { select: { name: true, email: true } } },
  })
  if (!booking) return Response.json({ error: 'Не найдено' }, { status: 404 })
  if (booking.guestId !== session.userId) return Response.json({ error: 'Нет доступа' }, { status: 403 })

  if (!['CONFIRMED', 'COMPLETED'].includes(booking.status)) {
    return Response.json({ error: 'Возврат можно запросить только по оплаченному бронированию' }, { status: 400 })
  }
  if (booking.refundStatus !== 'NONE') {
    return Response.json({ error: 'Запрос на возврат уже отправлен' }, { status: 400 })
  }

  const { reason } = await req.json()
  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return Response.json({ error: 'Опишите причину возврата (минимум 5 символов)' }, { status: 400 })
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { refundStatus: 'REQUESTED', refundReason: reason.trim(), refundRequestedAt: new Date() },
  })

  await sendEmail({
    to: CONTACTS.supportEmail,
    subject: `Запрос на возврат: бронирование ${booking.boat.title}`,
    text: `Гость: ${booking.guest.name} (${booking.guest.email})\nБронирование: ${id}\nСумма: ${Number(booking.totalPrice)} ₽\n\nПричина возврата:\n${reason.trim()}`,
    replyTo: booking.guest.email,
  })

  return Response.json({
    ...updated,
    totalPrice: Number(updated.totalPrice),
    commission: Number(updated.commission),
  })
}

// Судовладелец (или администратор) принимает решение по запросу на возврат.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })

  const { id } = await params
  const booking = await prisma.booking.findUnique({ where: { id }, include: { boat: true } })
  if (!booking) return Response.json({ error: 'Не найдено' }, { status: 404 })

  const isOwner = booking.boat.ownerId === session.userId
  if (!isOwner && session.role !== 'ADMIN') return Response.json({ error: 'Нет доступа' }, { status: 403 })

  if (booking.refundStatus !== 'REQUESTED') {
    return Response.json({ error: 'По этому бронированию нет открытого запроса на возврат' }, { status: 400 })
  }

  const { decision } = await req.json()
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return Response.json({ error: 'Недопустимое решение' }, { status: 400 })
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: {
      refundStatus: decision,
      refundDecidedAt: new Date(),
      // Полный возврат при одобрении — отменяем бронирование (см. оферту п.4.2).
      status: decision === 'APPROVED' ? 'CANCELLED' : booking.status,
    },
  })

  return Response.json({
    ...updated,
    totalPrice: Number(updated.totalPrice),
    commission: Number(updated.commission),
  })
}
