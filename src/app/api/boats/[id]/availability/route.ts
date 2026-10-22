export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'

// Возвращает занятость катера на конкретную дату: для тарифа "сутки" — весь день
// занят/свободен целиком, для "час"/"тур" — список уже занятых времён начала.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const date = req.nextUrl.searchParams.get('date')
  if (!date) return Response.json({ error: 'Укажите дату' }, { status: 400 })

  const boatRows = await sql`SELECT "priceUnit" FROM "Boat" WHERE id = ${id} LIMIT 1`
  if (!boatRows.length) return Response.json({ error: 'Не найдено' }, { status: 404 })
  const priceUnit = (boatRows[0] as Record<string, unknown>).priceUnit as string

  if (priceUnit === 'SUTKI') {
    const rows = await sql`
      SELECT id FROM "Booking"
      WHERE "boatId" = ${id}
        AND status IN ('PENDING', 'CONFIRMED')
        AND "startDate" <= ${date}::date
        AND "endDate" > ${date}::date
      LIMIT 1`
    return Response.json({ fullyBooked: rows.length > 0, bookedTimes: [] })
  }

  const rows = await sql`
    SELECT "startTime" FROM "Booking"
    WHERE "boatId" = ${id}
      AND status IN ('PENDING', 'CONFIRMED')
      AND "startDate" = ${date}::date
      AND "startTime" IS NOT NULL`
  return Response.json({
    fullyBooked: false,
    bookedTimes: rows.map((r: Record<string, unknown>) => r.startTime as string),
  })
}
