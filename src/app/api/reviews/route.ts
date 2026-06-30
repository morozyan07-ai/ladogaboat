import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

const schema = z.object({
  bookingId: z.string(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().min(3),
})

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })

  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Неверные данные' }, { status: 400 })

  const { bookingId, rating, comment } = parsed.data
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return Response.json({ error: 'Бронирование не найдено' }, { status: 404 })
  if (booking.guestId !== session.userId) return Response.json({ error: 'Нет доступа' }, { status: 403 })
  if (booking.status !== 'COMPLETED') return Response.json({ error: 'Можно оставить отзыв только после завершения' }, { status: 400 })

  const existing = await prisma.review.findUnique({ where: { bookingId } })
  if (existing) return Response.json({ error: 'Отзыв уже оставлен' }, { status: 409 })

  const review = await prisma.review.create({
    data: { bookingId, boatId: booking.boatId, guestId: session.userId, rating, comment },
  })

  return Response.json(review, { status: 201 })
}
