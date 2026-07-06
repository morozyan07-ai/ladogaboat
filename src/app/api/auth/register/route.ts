import { NextRequest } from 'next/server'
import { hash } from 'bcrypt-ts/browser'
import { sql } from '@/lib/db'
import { createSession } from '@/lib/session'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { name, email: rawEmail, password, role } = body as Record<string, string>

  const email = (rawEmail ?? '').trim().toLowerCase()
  if (!name || name.length < 2) return Response.json({ error: 'Неверные данные' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return Response.json({ error: 'Неверные данные' }, { status: 400 })
  if (!password || password.length < 6) return Response.json({ error: 'Неверные данные' }, { status: 400 })
  if (!['GUEST', 'OWNER'].includes(role)) return Response.json({ error: 'Неверные данные' }, { status: 400 })

  const existing = await sql`SELECT id FROM "User" WHERE email = ${email} LIMIT 1`
  if (existing.length > 0) return Response.json({ error: 'Email уже используется' }, { status: 409 })

  const passwordHash = await hash(password, 10)
  const id = crypto.randomUUID()
  const rows = await sql`
    INSERT INTO "User" (id, name, email, "passwordHash", role, "createdAt", "updatedAt")
    VALUES (${id}, ${name}, ${email}, ${passwordHash}, ${role}::"Role", NOW(), NOW())
    RETURNING id, role, name, email`
  const user = rows[0] as { id: string; role: string; name: string; email: string }
  await createSession({ id: user.id, role: user.role, name: user.name, email: user.email })

  return Response.json({ ok: true })
}
