import { NextRequest } from 'next/server'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { createSession } from '@/lib/session'

const schema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(6),
  role: z.enum(['GUEST', 'OWNER']),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Неверные данные' }, { status: 400 })

  const { name, email, password, role } = parsed.data
  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) return Response.json({ error: 'Email уже используется' }, { status: 409 })

  const passwordHash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({ data: { name, email, passwordHash, role } })
  await createSession({ id: user.id, role: user.role, name: user.name, email: user.email })

  return Response.json({ ok: true })
}
