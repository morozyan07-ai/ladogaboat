import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'
import { createPayment } from '@/lib/yookassa'
import { sendEmail } from '@/lib/email'

const COMMISSION_RATE = 0.08
const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'

function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const part = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  return `LB-${part(4)}-${part(4)}`
}

export async function GET() {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })

  let rows
  if (session.role === 'OWNER') {
    rows = await sql`
      SELECT bk.*,
        json_build_object('id', bo.id, 'title', bo.title, 'images', bo.images) as boat,
        CASE WHEN g.id IS NOT NULL THEN json_build_object('id', g.id, 'name', g.name, 'email', g.email) ELSE NULL END as guest,
        CASE WHEN r.id IS NOT NULL THEN row_to_json(r) ELSE NULL END as review
      FROM "Booking" bk
      JOIN "Boat" bo ON bo.id = bk."boatId"
      LEFT JOIN "User" g ON g.id = bk."guestId"
      LEFT JOIN "Review" r ON r."bookingId" = bk.id
      WHERE bo."ownerId" = ${session.userId}
      ORDER BY bk."createdAt" DESC`
  } else {
    rows = await sql`
      SELECT bk.*,
        json_build_object('id', bo.id, 'title', bo.title, 'images', bo.images) as boat,
        CASE WHEN g.id IS NOT NULL THEN json_build_object('id', g.id, 'name', g.name, 'email', g.email) ELSE NULL END as guest,
        CASE WHEN r.id IS NOT NULL THEN row_to_json(r) ELSE NULL END as review
      FROM "Booking" bk
      JOIN "Boat" bo ON bo.id = bk."boatId"
      LEFT JOIN "User" g ON g.id = bk."guestId"
      LEFT JOIN "Review" r ON r."bookingId" = bk.id
      WHERE bk."guestId" = ${session.userId}
      ORDER BY bk."createdAt" DESC`
  }

  return Response.json(rows.map((b: Record<string, unknown>) => ({
    ...b,
    totalPrice: Number(b.totalPrice),
    commission: Number(b.commission),
  })))
}

export async function POST(req: NextRequest) {
  const session = await getSession()

  if (session?.role === 'OWNER') {
    return Response.json({ error: 'Судовладельцы не могут бронировать' }, { status: 403 })
  }

  const body = await req.json() as Record<string, unknown>
  const { boatId, startDate, endDate, guestName, guestPhone, guestEmail } = body as {
    boatId?: string; startDate?: string; endDate?: string;
    guestName?: string; guestPhone?: string; guestEmail?: string
  }

  if (!boatId || !startDate || !endDate) {
    return Response.json({ error: 'Неверные данные' }, { status: 400 })
  }

  if (!session) {
    if (!guestName || !guestPhone || !guestEmail) {
      return Response.json({ error: 'Укажите ФИО, телефон и email для бронирования' }, { status: 400 })
    }
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (start >= end) return Response.json({ error: 'Дата окончания должна быть позже начала' }, { status: 400 })

  const boatRows = await sql`
    SELECT b.*, u.email as "ownerEmail", u.name as "ownerName"
    FROM "Boat" b
    LEFT JOIN "User" u ON u.id = b."ownerId"
    WHERE b.id = ${boatId} LIMIT 1`
  if (!boatRows.length || (boatRows[0] as Record<string, unknown>).status !== 'ACTIVE') {
    return Response.json({ error: 'Катер недоступен' }, { status: 404 })
  }
  const boat = boatRows[0] as Record<string, unknown>

  const days = Math.ceil((end.getTime() - start.getTime()) / 86400000)
  const totalPrice = days * Number(boat.pricePerDay)
  const commission = Math.round(totalPrice * COMMISSION_RATE * 100) / 100

  const conflict = await sql`
    SELECT id FROM "Booking"
    WHERE "boatId" = ${boatId}
      AND status IN ('PENDING', 'CONFIRMED')
      AND "startDate" < ${end.toISOString()}::date
      AND "endDate" > ${start.toISOString()}::date
    LIMIT 1`
  if (conflict.length > 0) return Response.json({ error: 'Катер занят на выбранные даты' }, { status: 409 })

  let bookingCode = generateBookingCode()
  for (let i = 0; i < 4; i++) {
    const ex = await sql`SELECT id FROM "Booking" WHERE "bookingCode" = ${bookingCode} LIMIT 1`
    if (!ex.length) break
    bookingCode = generateBookingCode()
  }

  const startFmt = start.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
  const endFmt = end.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })

  const bookingId = crypto.randomUUID()
  const bookingRows = await sql`
    INSERT INTO "Booking" (
      id, "boatId", "guestId", "guestName", "guestPhone", "guestEmail",
      "bookingCode", "startDate", "endDate", "totalPrice", commission, status, "createdAt", "updatedAt"
    ) VALUES (
      ${bookingId}, ${boatId},
      ${session?.userId ?? null}, ${!session ? (guestName ?? null) : null},
      ${!session ? (guestPhone ?? null) : null}, ${!session ? (guestEmail ?? null) : null},
      ${bookingCode}, ${start.toISOString()}::date, ${end.toISOString()}::date,
      ${totalPrice}, ${commission}, 'PENDING', NOW(), NOW()
    ) RETURNING *`
  const booking = bookingRows[0] as Record<string, unknown>

  const returnUrl = session
    ? `${SITE_URL}/dashboard/guest?payment=done&booking=${booking.id}`
    : `${SITE_URL}/booking/confirm?code=${bookingCode}`

  let paymentUrl: string | null = null
  try {
    const payment = await createPayment({
      amountRub: totalPrice,
      description: `Аренда: ${boat.title} (${days} дн.)`,
      bookingId: booking.id as string,
      returnUrl,
    })
    paymentUrl = payment.confirmation?.confirmation_url ?? null
    if (payment.id) {
      await sql`UPDATE "Booking" SET "yookassaPaymentId" = ${payment.id} WHERE id = ${booking.id as string}`
    }
  } catch (err) {
    console.error('YooKassa payment error:', err)
  }

  let emailTo: string | null = null
  let emailName = 'Гость'
  if (session) {
    const userRows = await sql`SELECT email, name FROM "User" WHERE id = ${session.userId} LIMIT 1`
    if (userRows.length) {
      emailTo = (userRows[0] as Record<string, unknown>).email as string
      emailName = (userRows[0] as Record<string, unknown>).name as string
    }
  } else {
    emailTo = guestEmail ?? null
    emailName = guestName ?? 'Гость'
  }

  if (emailTo) {
    await sendEmail({
      to: emailTo,
      subject: `Бронирование ${bookingCode} — ${boat.title}`,
      text: [
        `Здравствуйте, ${emailName}!`, '',
        'Ваше бронирование принято.',
        `Код бронирования: ${bookingCode}`, '',
        `Катер: ${boat.title}`,
        `Даты: ${startFmt} — ${endFmt} (${days} дн.)`,
        `Сумма: ${totalPrice.toLocaleString('ru-RU')} ₽`, '',
        paymentUrl
          ? `Для подтверждения оплатите бронирование:\n${paymentUrl}`
          : 'Менеджер свяжется с вами для уточнения деталей оплаты.',
        '', 'Вопросы: support@ladogaboat.ru', '', 'Ladoga Boat',
      ].join('\n'),
    })
  }

  if (boat.ownerEmail) {
    const contactInfo = session
      ? `Гость: ${emailName}`
      : `Гость: ${guestName}\nТелефон: ${guestPhone}\nEmail: ${guestEmail}`
    await sendEmail({
      to: boat.ownerEmail as string,
      subject: `Новое бронирование — ${boat.title} (${startFmt})`,
      text: [
        `Новое бронирование на ваш катер "${boat.title}".`, '',
        `Код: ${bookingCode}`,
        `Даты: ${startFmt} — ${endFmt} (${days} дн.)`,
        `К получению: ${(totalPrice - commission).toLocaleString('ru-RU')} ₽`, '',
        contactInfo, '', `ЛК: ${SITE_URL}/dashboard/owner`,
      ].join('\n'),
    })
  }

  return Response.json({
    ...booking,
    totalPrice: Number(booking.totalPrice),
    commission: Number(booking.commission),
    paymentUrl,
    bookingCode,
  }, { status: 201 })
}
