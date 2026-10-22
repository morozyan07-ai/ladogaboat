export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { verifyOwner } from '@/lib/dal'
import { sql } from '@/lib/db'
import EditBoatForm from '@/components/dashboard/EditBoatForm'

type Props = { params: Promise<{ id: string }> }

export default async function EditBoatPage({ params }: Props) {
  const session = await verifyOwner()
  const { id } = await params

  const rows = await sql`SELECT * FROM "Boat" WHERE id = ${id} LIMIT 1`
  if (!rows.length) notFound()
  const boat = rows[0] as Record<string, unknown>

  if (boat.ownerId !== session.userId && session.role !== 'ADMIN') notFound()

  return (
    <div className="py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard/owner" className="inline-flex items-center gap-1 text-slate-400 hover:text-slate-600 transition-colors text-sm mb-6">
          ← Кабинет судовладельца
        </Link>
        <h1 className="text-3xl font-semibold text-slate-800 mb-8">Редактировать катер</h1>
        <EditBoatForm
          boat={{
            id: boat.id as string,
            title: boat.title as string,
            description: boat.description as string,
            capacity: boat.capacity as number,
            pricePerDay: Number(boat.pricePerDay),
            priceUnit: (boat.priceUnit as string) ?? 'SUTKI',
            priceBasis: (boat.priceBasis as string) ?? 'BOAT',
            location: boat.location as string,
            routes: (boat.routes as string[]) ?? [],
            images: (boat.images as string[]) ?? [],
            status: boat.status as string,
          }}
        />
      </div>
    </div>
  )
}
