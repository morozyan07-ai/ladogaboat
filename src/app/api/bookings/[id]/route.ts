export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  const { id } = await params

  const rows = await sql`
    SELECT bk.*,
      row_to_json(bo) as boat,
      CASE WHEN g.id IS NOT NULL THEN json_build_object('name', g.name, 'email', g.email) ELSE NULL END as guest,
      CASE WHEN r.id IS NOT NULL THEN row_to_json(r) ELSE NULL END as review
    FROM "Booking" bk
    JOIN "Boat" bo ON bo.id = bk."boatId"
    LEFT JOIN "User" g ON g.id = bk."guestId"
    LEFT JOIN "Review" r ON r."bookingId" = bk.id
    WHERE bk.id = ${id}
    LIMIT 1`
  if (!rows.length) return Response.json({ error: 'Не найдено' }, { status: 404 })

  const booking = rows[0] as Record<string, unknown>
  const boat = booking.boat as Record<string, unknown>

  if (booking.guestId !== session.userId && boat.ownerId !== session.userId && session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }

  return Response.json({
    ...booking,
    totalPrice: Number(booking.totalPrice),
    commission: Number(booking.commission),
  })
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

  const { status } = await req.json() as { status: string }
  const isGuest = booking.guestId === session.userId
  const isOwner = booking.ownerId === session.userId

  if (!isGuest && !isOwner && session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }

  const allowedTransitions: Record<string, string[]> = {
    PENDING: isOwner ? ['CONFIRMED', 'CANCELLED'] : ['CANCELLED'],
    CONFIRMED: isOwner ? ['COMPLETED', 'CANCELLED'] : ['CANCELLED'],
  }

  const current = booking.status as string
  if (!allowedTransitions[current]?.includes(status)) {
    return Response.json({ error: 'Недопустимый переход статуса' }, { status: 400 })
  }

  const updated = await sql`
    UPDATE "Booking" SET status = ${status}::"BookingStatus", "updatedAt" = NOW()
    WHERE id = ${id} RETURNING *`
  const u = updated[0] as Record<string, unknown>
  return Response.json({ ...u, totalPrice: Number(u.totalPrice), commission: Number(u.commission) })
}
