import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createPayment } from '@/lib/yookassa'

const COMMISSION_RATE = 0.08
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'

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

  // Создаём бронирование со статусом PENDING (ждём оплаты)
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

  // Создаём платёж в ЮKassa
  let paymentUrl: string | null = null
  try {
    const payment = await createPayment({
      amountRub: totalPrice,
      description: `Аренда: ${boat.title} (${days} дн.)`,
      bookingId: booking.id,
      returnUrl: `${SITE_URL}/dashboard/guest?payment=done&booking=${booking.id}`,
    })
    paymentUrl = payment.confirmation?.confirmation_url ?? null
    if (payment.id) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { yookassaPaymentId: payment.id },
      })
    }
  } catch (err) {
    // Платёж не создан (ключи не настроены / ошибка ЮKassa).
    // Бронирование создано — гость увидит его в ЛК и сможет оплатить позже.
    console.error('YooKassa payment error:', err)
  }

  return Response.json(
    {
      ...booking,
      totalPrice: Number(booking.totalPrice),
      commission: Number(booking.commission),
      paymentUrl,
    },
    { status: 201 }
  )
}
