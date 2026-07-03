import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'
import { createPayment } from '@/lib/yookassa'
import { sendEmail } from '@/lib/email'

const COMMISSION_RATE = 0.08
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'

/** Генерируем короткий читаемый код бронирования: LB-XXXX-XXXX */
function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `LB-${part(4)}-${part(4)}`
}

const createSchema = z.object({
  boatId: z.string(),
  startDate: z.string(),
  endDate: z.string(),
  // Поля для гостя без регистрации
  guestName: z.string().min(2).optional(),
  guestPhone: z.string().min(7).optional(),
  guestEmail: z.string().email().optional(),
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

  // Судовладельцы не могут бронировать
  if (session?.role === 'OWNER') {
    return Response.json({ error: 'Судовладельцы не могут бронировать' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Неверные данные' }, { status: 400 })

  const { boatId, startDate, endDate, guestName, guestPhone, guestEmail } = parsed.data

  // Если не залогинен — требуем контактные данные
  if (!session) {
    if (!guestName || !guestPhone || !guestEmail) {
      return Response.json({ error: 'Укажите ФИО, телефон и email для бронирования' }, { status: 400 })
    }
  }

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start >= end) return Response.json({ error: 'Дата окончания должна быть позже начала' }, { status: 400 })

  const boat = await prisma.boat.findUnique({
    where: { id: boatId },
    include: { owner: { select: { email: true, name: true, phone: true } } },
  })
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

  // Генерируем уникальный код бронирования
  let bookingCode: string
  let attempts = 0
  do {
    bookingCode = generateBookingCode()
    const existing = await prisma.booking.findUnique({ where: { bookingCode } })
    if (!existing) break
    attempts++
  } while (attempts < 5)

  const startFmt = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  const endFmt = end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

  const booking = await prisma.booking.create({
    data: {
      boatId,
      guestId: session?.userId ?? null,
      guestName: session ? null : (guestName ?? null),
      guestPhone: session ? null : (guestPhone ?? null),
      guestEmail: session ? null : (guestEmail ?? null),
      bookingCode,
      startDate: start,
      endDate: end,
      totalPrice,
      commission,
    },
  })

  // Создаём платёж в ЮKassa
  const returnUrl = session
    ? `${SITE_URL}/dashboard/guest?payment=done&booking=${booking.id}`
    : `${SITE_URL}/booking/confirm?code=${bookingCode}`

  let paymentUrl: string | null = null
  try {
    const payment = await createPayment({
      amountRub: totalPrice,
      description: `Аренда: ${boat.title} (${days} дн.)`,
      bookingId: booking.id,
      returnUrl,
    })
    paymentUrl = payment.confirmation?.confirmation_url ?? null
    if (payment.id) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { yookassaPaymentId: payment.id },
      })
    }
  } catch (err) {
    console.error('YooKassa payment error:', err)
  }

  // ========== Уведомления ==========
  const guestEmailAddr = session
    ? (await prisma.user.findUnique({ where: { id: session.userId }, select: { email: true, name: true } }))
    : { email: guestEmail!, name: guestName! }

  const displayName = guestEmailAddr?.name ?? guestName ?? 'Гость'
  const displayEmail = guestEmailAddr?.email ?? guestEmail

  // Письмо гостю
  if (displayEmail) {
    const guestMsg = [
      `Здравствуйте, ${displayName}!`,
      '',
      `Ваше бронирование принято.`,
      `Код бронирования: ${bookingCode}`,
      '',
      `Катер: ${boat.title}`,
      `Даты: ${startFmt} — ${endFmt} (${days} дн.)`,
      `Сумма: ${totalPrice.toLocaleString('ru-RU')} ₽`,
      '',
      paymentUrl
        ? `Для подтверждения оплатите бронирование по ссылке:\n${paymentUrl}`
        : `Наш менеджер свяжется с вами для уточнения деталей оплаты.`,
      '',
      `Если у вас возникли вопросы — напишите нам: support@ladogaboat.ru`,
      ``,
      `Ladoga Boat`,
    ].join('\n')

    await sendEmail({
      to: displayEmail,
      subject: `Бронирование ${bookingCode} — ${boat.title}`,
      text: guestMsg,
    })
  }

  // Письмо судовладельцу
  if (boat.owner?.email) {
    const contactInfo = session
      ? `Гость: ${displayName}`
      : `Гость: ${guestName}\nТелефон: ${guestPhone}\nEmail: ${guestEmail}`

    const ownerMsg = [
      `Новое бронирование на ваш катер "${boat.title}".`,
      '',
      `Код бронирования: ${bookingCode}`,
      `Даты: ${startFmt} — ${endFmt} (${days} дн.)`,
      `Сумма к получению: ${(totalPrice - commission).toLocaleString('ru-RU')} ₽`,
      '',
      contactInfo,
      '',
      `Управление бронированиями: ${SITE_URL}/dashboard/owner`,
    ].join('\n')

    await sendEmail({
      to: boat.owner.email,
      subject: `Новое бронирование — ${boat.title} (${startFmt})`,
      text: ownerMsg,
    })
  }

  return Response.json(
    {
      ...booking,
      totalPrice: Number(booking.totalPrice),
      commission: Number(booking.commission),
      paymentUrl,
      bookingCode,
    },
    { status: 201 }
  )
}
