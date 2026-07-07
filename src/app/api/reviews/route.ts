export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })

  const body = await req.json() as { bookingId?: string; rating?: number; comment?: string }
  const { bookingId, rating, comment } = body
  if (!bookingId || !Number.isInteger(rating) || (rating as number) < 1 || (rating as number) > 5 || !comment || comment.length < 3) {
    return Response.json({ error: 'Неверные данные' }, { status: 400 })
  }

  const bRows = await sql`SELECT id, "guestId", "boatId", status FROM "Booking" WHERE id = ${bookingId} LIMIT 1`
  if (!bRows.length) return Response.json({ error: 'Бронирование не найдено' }, { status: 404 })
  const booking = bRows[0] as { id: string; guestId: string; boatId: string; status: string }

  if (booking.guestId !== session.userId) return Response.json({ error: 'Нет доступа' }, { status: 403 })
  if (booking.status !== 'COMPLETED') return Response.json({ error: 'Можно оставить отзыв только после завершения' }, { status: 400 })

  const existing = await sql`SELECT id FROM "Review" WHERE "bookingId" = ${bookingId} LIMIT 1`
  if (existing.length) return Response.json({ error: 'Отзыв уже оставлен' }, { status: 409 })

  const id = crypto.randomUUID()
  const rows = await sql`
    INSERT INTO "Review" (id, "bookingId", "boatId", "guestId", rating, comment, "createdAt")
    VALUES (${id}, ${bookingId}, ${booking.boatId}, ${session.userId}, ${rating as number}, ${comment}, NOW())
    RETURNING *`

  return Response.json(rows[0], { status: 201 })
}
