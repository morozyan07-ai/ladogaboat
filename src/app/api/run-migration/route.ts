import { neon } from '@neondatabase/serverless'

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('key') !== 'lb-migrate-2026') {
    return Response.json({ error: 'forbidden' }, { status: 403 })
  }
  const sql = neon(process.env.DATABASE_URL!)
  await sql`ALTER TABLE "Boat" ADD COLUMN IF NOT EXISTS "priceUnit" TEXT NOT NULL DEFAULT 'SUTKI'`
  return Response.json({ ok: true, message: 'Migration applied' })
}
