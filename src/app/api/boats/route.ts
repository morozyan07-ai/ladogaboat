import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const location = sp.get('location')
  const capacity = sp.get('capacity') ? Number(sp.get('capacity')) : null

  let rows
  if (location && capacity) {
    rows = await sql`
      SELECT b.*, u.name as "ownerName", COUNT(r.id)::int as "reviewCount"
      FROM "Boat" b
      LEFT JOIN "User" u ON u.id = b."ownerId"
      LEFT JOIN "Review" r ON r."boatId" = b.id
      WHERE b.status = 'ACTIVE'
        AND LOWER(b.location) LIKE '%' || LOWER(${location}) || '%'
        AND b.capacity >= ${capacity}
      GROUP BY b.id, u.name
      ORDER BY b."createdAt" DESC`
  } else if (location) {
    rows = await sql`
      SELECT b.*, u.name as "ownerName", COUNT(r.id)::int as "reviewCount"
      FROM "Boat" b
      LEFT JOIN "User" u ON u.id = b."ownerId"
      LEFT JOIN "Review" r ON r."boatId" = b.id
      WHERE b.status = 'ACTIVE'
        AND LOWER(b.location) LIKE '%' || LOWER(${location}) || '%'
      GROUP BY b.id, u.name
      ORDER BY b."createdAt" DESC`
  } else if (capacity) {
    rows = await sql`
      SELECT b.*, u.name as "ownerName", COUNT(r.id)::int as "reviewCount"
      FROM "Boat" b
      LEFT JOIN "User" u ON u.id = b."ownerId"
      LEFT JOIN "Review" r ON r."boatId" = b.id
      WHERE b.status = 'ACTIVE' AND b.capacity >= ${capacity}
      GROUP BY b.id, u.name
      ORDER BY b."createdAt" DESC`
  } else {
    rows = await sql`
      SELECT b.*, u.name as "ownerName", COUNT(r.id)::int as "reviewCount"
      FROM "Boat" b
      LEFT JOIN "User" u ON u.id = b."ownerId"
      LEFT JOIN "Review" r ON r."boatId" = b.id
      WHERE b.status = 'ACTIVE'
      GROUP BY b.id, u.name
      ORDER BY b."createdAt" DESC`
  }

  const result = rows.map((b: Record<string, unknown>) => ({
    ...b,
    pricePerDay: Number(b.pricePerDay),
    owner: { name: b.ownerName },
    _count: { reviews: b.reviewCount ?? 0 },
    ownerName: undefined,
    reviewCount: undefined,
  }))
  return Response.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
    return Response.json({ error: 'Только судовладельцы могут добавлять катера' }, { status: 403 })
  }

  const body = await req.json()
  const { title, description, capacity, pricePerDay, location, routes = [], images = [] } = body as Record<string, unknown>

  if (!title || String(title).length < 3) return Response.json({ error: 'Неверные данные', details: { title: ['Минимум 3 символа'] } }, { status: 400 })
  if (!description || String(description).length < 10) return Response.json({ error: 'Неверные данные', details: { description: ['Минимум 10 символов'] } }, { status: 400 })
  if (!Number.isInteger(Number(capacity)) || Number(capacity) < 1) return Response.json({ error: 'Неверные данные', details: { capacity: ['Минимум 1'] } }, { status: 400 })
  if (Number(pricePerDay) < 1) return Response.json({ error: 'Неверные данные', details: { pricePerDay: ['Минимум 1'] } }, { status: 400 })
  if (!location || String(location).length < 2) return Response.json({ error: 'Неверные данные', details: { location: ['Минимум 2 символа'] } }, { status: 400 })

  const id = crypto.randomUUID()
  const rows = await sql`
    INSERT INTO "Boat" (id, "ownerId", title, description, capacity, "pricePerDay", location, routes, images, status, "createdAt", "updatedAt")
    VALUES (${id}, ${session.userId}, ${String(title)}, ${String(description)}, ${Number(capacity)}, ${Number(pricePerDay)}, ${String(location)}, ${routes as string[]}, ${images as string[]}, 'ACTIVE', NOW(), NOW())
    RETURNING *`

  const boat = rows[0] as Record<string, unknown>
  return Response.json({ ...boat, pricePerDay: Number(boat.pricePerDay) }, { status: 201 })
}
