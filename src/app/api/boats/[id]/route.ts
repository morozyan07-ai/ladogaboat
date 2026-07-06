import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const boatRows = await sql`
    SELECT b.*, u.name as "ownerName", COUNT(r.id)::int as "reviewCount"
    FROM "Boat" b
    LEFT JOIN "User" u ON u.id = b."ownerId"
    LEFT JOIN "Review" r ON r."boatId" = b.id
    WHERE b.id = ${id}
    GROUP BY b.id, u.name`
  if (!boatRows.length) return Response.json({ error: 'Не найдено' }, { status: 404 })

  const reviewRows = await sql`
    SELECT r.*, g.name as "guestName"
    FROM "Review" r
    LEFT JOIN "User" g ON g.id = r."guestId"
    WHERE r."boatId" = ${id}
    ORDER BY r."createdAt" DESC`

  const b = boatRows[0] as Record<string, unknown>
  return Response.json({
    ...b,
    pricePerDay: Number(b.pricePerDay),
    owner: { name: b.ownerName },
    _count: { reviews: b.reviewCount ?? 0 },
    ownerName: undefined,
    reviewCount: undefined,
    reviews: reviewRows.map((r: Record<string, unknown>) => ({
      ...r,
      guest: r.guestName ? { name: r.guestName } : null,
      guestName: undefined,
    })),
  })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  const { id } = await params

  const boatRows = await sql`SELECT id, "ownerId" FROM "Boat" WHERE id = ${id} LIMIT 1`
  if (!boatRows.length) return Response.json({ error: 'Не найдено' }, { status: 404 })
  const boat = boatRows[0] as { id: string; ownerId: string }
  if (boat.ownerId !== session.userId && session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }

  const body = await req.json() as Record<string, unknown>
  const t = (k: string) => (k in body ? String(body[k]) : null)
  const n = (k: string) => (k in body ? Number(body[k]) : null)
  const a = (k: string) => (k in body ? (body[k] as unknown[]) : null)

  const updated = await sql`
    UPDATE "Boat" SET
      title       = COALESCE(${t('title')}, title),
      description = COALESCE(${t('description')}, description),
      capacity    = COALESCE(${n('capacity')}::int, capacity),
      "pricePerDay" = COALESCE(${n('pricePerDay')}::numeric, "pricePerDay"),
      location    = COALESCE(${t('location')}, location),
      routes      = COALESCE(${a('routes') as string[]}, routes),
      images      = COALESCE(${a('images') as string[]}, images),
      status      = COALESCE(${t('status')}::"BoatStatus", status),
      "updatedAt" = NOW()
    WHERE id = ${id}
    RETURNING *`

  const u = updated[0] as Record<string, unknown>
  return Response.json({ ...u, pricePerDay: Number(u.pricePerDay) })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  const { id } = await params

  const boatRows = await sql`SELECT id, "ownerId" FROM "Boat" WHERE id = ${id} LIMIT 1`
  if (!boatRows.length) return Response.json({ error: 'Не найдено' }, { status: 404 })
  const boat = boatRows[0] as { id: string; ownerId: string }
  if (boat.ownerId !== session.userId && session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }

  await sql`DELETE FROM "Boat" WHERE id = ${id}`
  return Response.json({ ok: true })
}
