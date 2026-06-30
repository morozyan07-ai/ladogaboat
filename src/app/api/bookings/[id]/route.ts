import { NextRequest } from 'next/server'
import prisma from '@/lib/prisma'
import { getSession } from '@/lib/session'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  const { id } = await params
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { boat: true, guest: { select: { name: true, email: true } }, review: true },
  })
  if (!booking) return Response.json({ error: 'Не найдено' }, { status: 404 })
  if (booking.guestId !== session.userId && booking.boat.ownerId !== session.userId && session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }
  return Response.json({ ...booking, totalPrice: Number(booking.totalPrice), commission: Number(booking.commission) })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession()
  if (!session) return Response.json({ error: 'Не авторизован' }, { status: 401 })
  const { id } = await params
  const booking = await prisma.booking.findUnique({ where: { id }, include: { boat: true } })
  if (!booking) return Response.json({ error: 'Не найдено' }, { status: 404 })

  const { status } = await req.json()
  const isGuest = booking.guestId === session.userId
  const isOwner = booking.boat.ownerId === session.userId

  if (!isGuest && !isOwner && session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }

  const allowedTransitions: Record<string, string[]> = {
    PENDING: isOwner ? ['CONFIRMED', 'CANCELLED'] : ['CANCELLED'],
    CONFIRMED: isOwner ? ['COMPLETED', 'CANCELLED'] : ['CANCELLED'],
  }

  const current = booking.status
  if (!allowedTransitions[current]?.includes(status)) {
    return Response.json({ error: 'Недопустимый переход статуса' }, { status: 400 })
  }

  const updated = await prisma.booking.update({ where: { id }, data: { status } })
  return Response.json({ ...updated, totalPrice: Number(updated.totalPrice), commission: Number(updated.commission) })
}
