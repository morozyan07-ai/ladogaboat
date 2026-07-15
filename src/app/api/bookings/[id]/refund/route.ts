export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'
import { sendEmail } from '@/lib/email'
import { CONTACTS } from '@/lib/contacts'

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  const { id } = await params

  const rows = await sql`
    SELECT bk.*,
      bo.title as "boatTitle", bo."ownerId",
      g.name as "guestName2", g.email as "guestEmail2"
    FROM "Booking" bk
    JOIN "Boat" bo ON bo.id = bk."boatId"
    LEFT JOIN "User" g ON g.id = bk."guestId"
    WHERE bk.id = ${id} LIMIT 1`
  if (!rows.length) return Response.json({ error: 'Не найдено' }, { status: 404 })
  const booking = rows[0] as Record<string, unknown>

  if (booking.guestId !== session.userId) return Response.json({ error: 'Нет доступа' }, { status: 403 })
  if (!['CONFIRMED', 'COMPLETED'].includes(booking.status as string)) {
    return Response.json({ error: 'Возврат можно запросить только по оплаченному бронированию' }, { status: 400 })
  }
  if (booking.refundStatus !== 'NONE') {
    return Response.json({ error: 'Запрос на возврат уже отправлен' }, { status: 400 })
  }

  const { reason } = await req.json() as { reason?: string }
  if (!reason || typeof reason !== 'string' || reason.trim().length < 5) {
    return Response.json({ error: 'Опишите причину возврата (минимум 5 символов)' }, { status: 400 })
  }

  const updated = await sql`
    UPDATE "Booking" SET
      "refundStatus" = 'REQUESTED'::"RefundStatus",
      "refundReason" = ${reason.trim()},
      "refundRequestedAt" = NOW(),
      "updatedAt" = NOW()
    WHERE id = ${id} RETURNING *`

  const guestName = (booking.guestName2 ?? booking.guestName ?? 'Гость') as string
  const guestEmail = (booking.guestEmail2 ?? booking.guestEmail ?? '') as string

  await sendEmail({
    to: CONTACTS.supportEmail,
    subject: `Запрос на возврат: бронирование ${booking.boatTitle}`,
    text: `Гость: ${guestName} (${guestEmail})\nБронирование: ${id}\nСумма: ${Number(booking.totalPrice)} ₽\n\nПричина:\n${reason.trim()}`,
    replyTo: guestEmail || undefined,
  })

  const u = updated[0] as Record<string, unknown>
  return Response.json({ ...u, totalPrice: Number(u.totalPrice), commission: Number(u.commission) })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  const { id } = await params

  const rows = await sql`
    SELECT bk.*, bo."ownerId"
    FROM "Booking" bk
    JOIN "Boat" bo ON bo.id = bk."boatId"
    WHERE bk.id = ${id} LIMIT 1`
  if (!rows.length) return Response.json({ error: 'Не найдено' }, { status: 404 })
  const booking = rows[0] as Record<string, unknown>

  if (booking.ownerId !== session.userId && session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }
  if (booking.refundStatus !== 'REQUESTED') {
    return Response.json({ error: 'По этому бронированию нет открытого запроса на возврат' }, { status: 400 })
  }

  const { decision } = await req.json() as { decision?: string }
  if (decision !== 'APPROVED' && decision !== 'REJECTED') {
    return Response.json({ error: 'Недопустимое решение' }, { status: 400 })
  }

  const newStatus = decision === 'APPROVED' ? 'CANCELLED' : (booking.status as string)
  const updated = await sql`
    UPDATE "Booking" SET
      "refundStatus" = ${decision}::"RefundStatus",
      "refundDecidedAt" = NOW(),
      status = ${newStatus}::"BookingStatus",
      "updatedAt" = NOW()
    WHERE id = ${id} RETURNING *`

  const u = updated[0] as Record<string, unknown>
  return Response.json({ ...u, totalPrice: Number(u.totalPrice), commission: Number(u.commission) })
}
