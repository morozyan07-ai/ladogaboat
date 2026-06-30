import { NextRequest } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

const createSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  capacity: z.number().int().min(1),
  pricePerDay: z.number().min(1),
  location: z.string().min(2),
  routes: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
})

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const where: Record<string, unknown> = { status: 'ACTIVE' }
  if (sp.get('location')) where.location = { contains: sp.get('location'), mode: 'insensitive' }
  if (sp.get('capacity')) where.capacity = { gte: Number(sp.get('capacity')) }

  const boats = await prisma.boat.findMany({
    where,
    include: {
      owner: { select: { name: true } },
      _count: { select: { reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  const result = boats.map((b: typeof boats[number]) => ({ ...b, pricePerDay: Number(b.pricePerDay) }))
  return Response.json(result)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  if (session.role !== 'OWNER' && session.role !== 'ADMIN') {
    return Response.json({ error: 'Только судовладельцы могут добавлять катера' }, { status: 403 })
  }

  const body = await req.json()
  const parsed = createSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Неверные данные', details: parsed.error.flatten() }, { status: 400 })

  const boat = await prisma.boat.create({
    data: { ...parsed.data, ownerId: session.userId },
  })

  return Response.json({ ...boat, pricePerDay: Number(boat.pricePerDay) }, { status: 201 })
}
