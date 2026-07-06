import Link from 'next/link'
import { verifyOwner } from '@/lib/dal'
import { sql } from '@/lib/db'
import OwnerPayoutForm from '@/components/dashboard/OwnerPayoutForm'
import RefundDecisionButtons from '@/components/dashboard/RefundDecisionButtons'

export default async function OwnerDashboard() {
  const session = await verifyOwner()

  const [boats, bookings, payoutRows] = await Promise.all([
    sql`
      SELECT b.*, COUNT(DISTINCT bk.id)::int as "bookingCount", COUNT(DISTINCT r.id)::int as "reviewCount"
      FROM "Boat" b
      LEFT JOIN "Booking" bk ON bk."boatId" = b.id
      LEFT JOIN "Review" r ON r."boatId" = b.id
      WHERE b."ownerId" = ${session.userId}
      GROUP BY b.id ORDER BY b."createdAt" DESC`,
    sql`
      SELECT bk.*,
        json_build_object('title', bo.title) as boat,
        CASE WHEN g.id IS NOT NULL THEN json_build_object('name', g.name, 'email', g.email) ELSE NULL END as guest
      FROM "Booking" bk
      JOIN "Boat" bo ON bo.id = bk."boatId"
      LEFT JOIN "User" g ON g.id = bk."guestId"
      WHERE bo."ownerId" = ${session.userId}
      ORDER BY bk."createdAt" DESC
      LIMIT 10`,
    sql`
      SELECT "payoutLegalName", "payoutInn", "payoutOgrn", "payoutBankName",
             "payoutBik", "payoutAccount", "payoutCorrAccount", "payoutUpdatedAt"
      FROM "User" WHERE id = ${session.userId} LIMIT 1`,
  ])

  const payoutUser = (payoutRows[0] ?? {}) as Record<string, unknown>

  const totalRevenue = bookings
    .filter((b: Record<string, unknown>) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((s: number, b: Record<string, unknown>) => s + Number(b.totalPrice) - Number(b.commission), 0)

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">Кабинет судовладельца</h1>
            <p className="text-slate-500 mt-1">Привет, {session.name}!</p>
          </div>
          <Link href="/dashboard/owner/boats/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium">
            + Добавить катер
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Катеров', value: boats.length, icon: '⛵' },
            { label: 'Бронирований', value: bookings.length, icon: '📋' },
            { label: 'Доход (₽)', value: totalRevenue.toLocaleString('ru-RU'), icon: '💰' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-2xl font-semibold text-slate-800">{value}</div>
              <div className="text-slate-500 text-sm">{label}</div>
            </div>
          ))}
        </div>

        <div className="mb-8">
          <OwnerPayoutForm initial={payoutUser} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm mb-8">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800">Мои катера</h2>
          </div>
          {boats.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <div className="text-4xl mb-3">⛵</div>
              <p>Катеров пока нет</p>
              <Link href="/dashboard/owner/boats/new" className="mt-3 inline-block text-blue-600 hover:underline">
                Добавить первый катер →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(boats as Record<string, unknown>[]).map((boat) => (
                <div key={boat.id as string} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{boat.title as string}</p>
                    <p className="text-sm text-slate-500">
                      {boat.bookingCount as number} бронирований · {boat.reviewCount as number} отзывов
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${boat.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {boat.status === 'ACTIVE' ? 'Активен' : 'Неактивен'}
                    </span>
                    <Link href={`/boats/${boat.id}`} className="text-sm text-blue-600 hover:underline">Просмотр</Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800">Последние бронирования</h2>
          </div>
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Бронирований пока нет</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {(bookings as Record<string, unknown>[]).map((b) => {
                const bBoat = b.boat as Record<string, unknown>
                const bGuest = b.guest as Record<string, unknown> | null
                return (
                  <div key={b.id as string} className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-slate-800">{bBoat.title as string}</p>
                        <p className="text-sm text-slate-500">
                          Гость: {bGuest?.name ?? b.guestName ?? 'Гость'} · {new Date(b.startDate as string).toLocaleDateString('ru-RU')} — {new Date(b.endDate as string).toLocaleDateString('ru-RU')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-slate-800">{Number(b.totalPrice).toLocaleString('ru-RU')} ₽</p>
                        <StatusBadge status={b.status as string} />
                      </div>
                    </div>
                    {b.refundStatus === 'REQUESTED' && (
                      <div className="mt-3 pt-3 border-t border-amber-100 bg-amber-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-xs font-medium text-amber-700">Запрос на возврат средств</p>
                            <p className="text-sm text-slate-600 mt-0.5">{b.refundReason as string}</p>
                          </div>
                          <RefundDecisionButtons bookingId={b.id as string} />
                        </div>
                      </div>
                    )}
                    {b.refundStatus === 'APPROVED' && (
                      <p className="mt-2 text-xs text-green-700">Возврат одобрен — бронирование отменено</p>
                    )}
                    {b.refundStatus === 'REJECTED' && (
                      <p className="mt-2 text-xs text-red-600">Запрос на возврат отклонён</p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    PENDING: { label: 'Ожидает', cls: 'bg-yellow-100 text-yellow-700' },
    CONFIRMED: { label: 'Подтверждено', cls: 'bg-green-100 text-green-700' },
    CANCELLED: { label: 'Отменено', cls: 'bg-red-100 text-red-700' },
    COMPLETED: { label: 'Завершено', cls: 'bg-blue-100 text-blue-700' },
  }
  const { label, cls } = map[status] ?? { label: status, cls: 'bg-slate-100 text-slate-600' }
  return <span className={`text-xs px-2 py-1 rounded-full font-medium ${cls}`}>{label}</span>
}
