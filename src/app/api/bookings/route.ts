import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

const COMMISSION_RATE = 0.08

const createSchema = z.object({
  boatId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
})

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })

  const where = session.role === 'OWNER'
    ? { boat: { ownerId: session.userId } }
    : { guestId: session.userId }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      boat: { select: { id: true, title: true, images: true } },
      guest: { select: { id: true, name: true, email: true } },
      review: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return Response.json(
    bookings.map((b: typeof bookings[number]) => ({
      ...b,
      totalPrice: Number(b.totalPrice),
      commission: Number(b.commission),
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  if (session.role === 'OWNER') return Response.json({ error: 'Судовладельцы не могут бронировать' }, { status: 403 })

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Неверные данные' }, { status: 400 })

  const { boatId, startDate, endDate } = parsed.data
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start >= end) return Response.json({ error: 'Дата окончания должна быть позже начала' }, { status: 400 })

  const boat = await prisma.boat.findUnique({ where: { id: boatId } })
  if (!boat || boat.status !== 'ACTIVE') return Response.json({ error: 'Катер недоступен' }, { status: 404 })

  const days = Math.ceil((end.getTime() - start.getTime()) / 86400000)
  const totalPrice = days * Number(boat.pricePerDay)
  const commission = Math.round(totalPrice * COMMISSION_RATE * 100) / 100

  const conflict = await prisma.booking.findFirst({
    where: {
      boatId,
      status: { in: ['PENDING', 'CONFIRMED'] },
      AND: [{ startDate: { lt: end } }, { endDate: { gt: start } }],
    },
  })
  if (conflict) return Response.json({ error: 'Катер занят на выбранные даты' }, { status: 409 })

  const booking = await prisma.booking.create({
    data: {
      boatId,
      guestId: session.userId,
      startDate: start,
      endDate: end,
      totalPrice,
      commission,
    },
  })

  return Response.json({ ...booking, totalPrice: Number(booking.totalPrice), commission: Number(booking.commission) }, { status: 201 })
}
