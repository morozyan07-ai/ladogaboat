export const dynamic = 'force-dynamic'
import { NextRequest } from 'next/server'
import { sql } from '@/lib/db'
import { getSession } from '@/lib/session'
import { sendEmail } from '@/lib/email'

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.ladogaboat.ru'

// Новости/объявления от админа — показываются в кабинете судовладельца
// и рассылаются на email всем судовладельцам. Читать может любой
// авторизованный судовладелец/админ, писать — только ADMIN.

export async function GET() {
  const session = await getSession()
  if (!session || (session.role !== 'OWNER' && session.role !== 'ADMIN')) {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }
  const rows = await sql`
    SELECT id, title, body, "createdAt" FROM "Announcement"
    ORDER BY "createdAt" DESC LIMIT 20`
  return Response.json(rows)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }

  const body = await req.json() as Record<string, unknown>
  const title = String(body.title ?? '').trim()
  const text = String(body.body ?? '').trim()
  if (title.length < 2) return Response.json({ error: 'Укажите заголовок' }, { status: 400 })
  if (text.length < 2) return Response.json({ error: 'Укажите текст сообщения' }, { status: 400 })

  const id = crypto.randomUUID()
  const rows = await sql`
    INSERT INTO "Announcement" (id, title, body, "createdAt")
    VALUES (${id}, ${title}, ${text}, NOW())
    RETURNING id, title, body, "createdAt"`
  const announcement = rows[0] as Record<string, unknown>

  const owners = await sql`SELECT email, name FROM "User" WHERE role = 'OWNER'`

  let sent = 0
  for (const owner of owners as Record<string, unknown>[]) {
    const email = owner.email as string
    if (!email) continue
    const result = await sendEmail({
      to: email,
      subject: `Новость от Ladoga Boat: ${title}`,
      text: [
        `Здравствуйте, ${owner.name ?? 'судовладелец'}!`, '',
        title, '',
        text, '',
        `Личный кабинет: ${SITE_URL}/dashboard/owner`, '',
        'Ladoga Boat',
      ].join('\n'),
    })
    if (result.ok) sent += 1
  }

  return Response.json({ ...announcement, sentTo: sent, totalOwners: owners.length }, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session || session.role !== 'ADMIN') {
    return Response.json({ error: 'Нет доступа' }, { status: 403 })
  }
  const body = await req.json() as Record<string, unknown>
  const id = String(body.id ?? '')
  if (!id) return Response.json({ error: 'Не указан id' }, { status: 400 })
  await sql`DELETE FROM "Announcement" WHERE id = ${id}`
  return Response.json({ ok: true })
}
