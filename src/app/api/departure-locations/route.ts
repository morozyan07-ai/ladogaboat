export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'

// Список причалов отправления — используется в формах добавления/редактирования
// катера (выпадающий список "Место базирования"). Читать может любой авторизованный
// пользователь (нужно для формы), управлять (добавлять/удалять) — только ADMIN.

export async function GET() {
  const rows = await sql`SELECT id, name FROM "DepartureLocation" ORDER BY name ASC`
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }

  const body = await req.json() as Record<string, unknown>
  const name = String(body.name ?? '').trim()
  if (name.length < 2) {
    return Response.json({ error: 'Укажите название причала' }, { status: 400 })
  }

  try {
    const id = crypto.randomUUID()
    const rows = await sql`
      INSERT INTO "DepartureLocation" (id, name, "createdAt")
      VALUES (${id}, ${name}, NOW())
      RETURNING id, name`
    return Response.json(rows[0], { status: 201 })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : ''
    if (message.includes('unique') || message.includes('duplicate')) {
      return Response.json({ error: 'Такой причал уже есть в списке' }, { status: 409 })
    }
    console.error('Ошибка добавления причала:', err)
    return Response.json({ error: 'Не удалось добавить причал' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }

  const body = await req.json() as Record<string, unknown>
  const id = String(body.id ?? '')
  if (!id) return Response.json({ error: 'Не указан id' }, { status: 400 })

  await sql`DELETE FROM "DepartureLocation" WHERE id = ${id}`
  return Response.json({ ok: true })
}
