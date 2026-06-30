import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const boat = await prisma.boat.findUnique({
    where: { id },
    include: {
      owner: { select: { name: true } },
      reviews: { include: { guest: { select: { name: true } } }, orderBy: { createdAt: 'desc' } },
      _count: { select: { reviews: true } },
    },
  })
  if (!boat) return Response.json({ error: 'Не найдено' }, { status: 404 })
  return Response.json({ ...boat, pricePerDay: Number(boat.pricePerDay) })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  const { id } = await params
  const boat = await prisma.boat.findUnique({ where: { id } })
  if (!boat) return Response.json({ error: 'Не найдено' }, { status: 404 })
  if (boat.ownerId !== session.userId && session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }
  const body = await req.json()
  const updated = await prisma.boat.update({ where: { id }, data: body })
  return Response.json({ ...updated, pricePerDay: Number(updated.pricePerDay) })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  const { id } = await params
  const boat = await prisma.boat.findUnique({ where: { id } })
  if (!boat) return Response.json({ error: 'Не найдено' }, { status: 404 })
  if (boat.ownerId !== session.userId && session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }
  await prisma.boat.delete({ where: { id } })
  return Response.json({ ok: true })
}
