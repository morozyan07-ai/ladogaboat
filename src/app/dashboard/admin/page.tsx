export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { verifyAdmin } from '@/lib/dal'
import { sql } from '@/lib/db'
import MiniBarChart from '@/components/dashboard/MiniBarChart'
import RoleSwitcher from '@/components/dashboard/RoleSwitcher'
import { formatOwnerNumber, formatBoatNumber } from '@/lib/numbering'
import DepartureLocationsManager from '@/components/dashboard/DepartureLocationsManager'

const PAID_STATUSES = ['CONFIRMED', 'COMPLETED']

export default async function AdminDashboard() {
  const session = await verifyAdmin()

  const [summaryRows, usersRows, boatsRows, byBoatRows, monthlyRows, refundRows, locationRows] = await Promise.all([
    sql`
      SELECT
        COUNT(*)::int as "totalBookings",
        COUNT(*) FILTER (WHERE status = ANY(${PAID_STATUSES}))::int as "paidBookings",
        COALESCE(SUM("totalPrice") FILTER (WHERE status = ANY(${PAID_STATUSES})), 0) as "grossRevenue",
        COALESCE(SUM(commission) FILTER (WHERE status = ANY(${PAID_STATUSES})), 0) as "totalCommission"
      FROM "Booking"`,
    sql`
      SELECT role, COUNT(*)::int as count
      FROM "User"
      GROUP BY role`,
    sql`
      SELECT status, COUNT(*)::int as count
      FROM "Boat"
      GROUP BY status`,
    sql`
      SELECT bo.id, bo.title, bo."boatNumber", u.name as "ownerName", u.email as "ownerEmail", u."ownerNumber",
        COUNT(bk.id) FILTER (WHERE bk.status = ANY(${PAID_STATUSES}))::int as "paidBookings",
        COALESCE(SUM(bk."totalPrice") FILTER (WHERE bk.status = ANY(${PAID_STATUSES})), 0) as revenue,
        COALESCE(SUM(bk.commission) FILTER (WHERE bk.status = ANY(${PAID_STATUSES})), 0) as commission
      FROM "Boat" bo
      JOIN "User" u ON u.id = bo."ownerId"
      LEFT JOIN "Booking" bk ON bk."boatId" = bo.id
      GROUP BY bo.id, bo.title, bo."boatNumber", u.name, u.email, u."ownerNumber"
      ORDER BY revenue DESC`,
    sql`
      SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') as month,
        COALESCE(SUM("totalPrice") FILTER (WHERE status = ANY(${PAID_STATUSES})), 0) as revenue,
        COALESCE(SUM(commission) FILTER (WHERE status = ANY(${PAID_STATUSES})), 0) as commission,
        COUNT(*) FILTER (WHERE status = ANY(${PAID_STATUSES}))::int as bookings
      FROM "Booking"
      WHERE "createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY 1 ORDER BY 1`,
    sql`
      SELECT "refundStatus", COUNT(*)::int as count, COALESCE(SUM("totalPrice"), 0) as amount
      FROM "Booking"
      WHERE "refundStatus" != 'NONE'
      GROUP BY "refundStatus"`,
    sql`SELECT id, name FROM "DepartureLocation" ORDER BY name ASC`,
  ])

  const summary = summaryRows[0] as Record<string, unknown>
  const grossRevenue = Number(summary.grossRevenue)
  const totalCommission = Number(summary.totalCommission)

  const usersByRole: Record<string, number> = { GUEST: 0, OWNER: 0, ADMIN: 0 }
  for (const r of usersRows as Record<string, unknown>[]) usersByRole[r.role as string] = r.count as number

  const boatsByStatus: Record<string, number> = { ACTIVE: 0, INACTIVE: 0 }
  for (const r of boatsRows as Record<string, unknown>[]) boatsByStatus[r.status as string] = r.count as number

  const refundsByStatus: Record<string, { count: number; amount: number }> = {}
  for (const r of refundRows as Record<string, unknown>[]) {
    refundsByStatus[r.refundStatus as string] = { count: r.count as number, amount: Number(r.amount) }
  }

  const monthLabel = (m: string) => {
    const [y, mo] = m.split('-')
    return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString('ru-RU', { month: 'short' })
  }

  const revenueByMonth = (monthlyRows as Record<string, unknown>[]).map((r) => ({
    label: monthLabel(r.month as string),
    value: Number(r.revenue),
  }))
  const bookingsByMonth = (monthlyRows as Record<string, unknown>[]).map((r) => ({
    label: monthLabel(r.month as string),
    value: Number(r.bookings),
  }))

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-1 text-white/60 hover:text-white transition-colors text-sm mb-6">
          ← Главная
        </Link>
        <RoleSwitcher active="admin" />
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-white">Админ-панель</h1>
          <p className="text-white/70 mt-1">Привет, {session.name}! Метрики по всей площадке.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Общая выручка (₽)', value: grossRevenue.toLocaleString('ru-RU'), icon: '💰' },
            { label: 'Комиссия площадки (₽)', value: totalCommission.toLocaleString('ru-RU'), icon: '🏦' },
            { label: 'Оплаченных броней', value: summary.paidBookings as number, icon: '✅' },
            { label: 'Всего броней', value: summary.totalBookings as number, icon: '📋' },
          ].map(({ label, value, icon }) => (
            <div key={label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="text-3xl mb-2">{icon}</div>
              <div className="text-2xl font-semibold text-slate-800">{value}</div>
              <div className="text-slate-500 text-sm">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <p className="font-semibold text-slate-800 mb-3">Пользователи</p>
            <div className="flex gap-6 text-sm">
              <div><span className="text-2xl font-semibold text-slate-800">{usersByRole.OWNER}</span><p className="text-slate-500">Судовладельцы</p></div>
              <div><span className="text-2xl font-semibold text-slate-800">{usersByRole.GUEST}</span><p className="text-slate-500">Гости</p></div>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <p className="font-semibold text-slate-800 mb-3">Катера</p>
            <div className="flex gap-6 text-sm">
              <div><span className="text-2xl font-semibold text-slate-800">{boatsByStatus.ACTIVE}</span><p className="text-slate-500">Активных</p></div>
              <div><span className="text-2xl font-semibold text-slate-800">{boatsByStatus.INACTIVE}</span><p className="text-slate-500">Неактивных</p></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <p className="font-semibold text-slate-800 mb-4">Выручка по месяцам (12 мес.)</p>
            <MiniBarChart data={revenueByMonth} formatValue={(v) => `${v.toLocaleString('ru-RU')} ₽`} />
          </div>
          <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
            <p className="font-semibold text-slate-800 mb-4">Бронирования по месяцам</p>
            <MiniBarChart data={bookingsByMonth} color="#0d9488" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm mb-8">
          <p className="font-semibold text-slate-800 mb-3">Возвраты и отмены</p>
          {Object.keys(refundsByStatus).length === 0 ? (
            <p className="text-slate-400 text-sm">Запросов на возврат не было</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { key: 'REQUESTED', label: 'Запрошено' },
                { key: 'APPROVED', label: 'Одобрено' },
                { key: 'REJECTED', label: 'Отклонено' },
              ].map(({ key, label }) => (
                <div key={key}>
                  <span className="text-2xl font-semibold text-slate-800">{refundsByStatus[key]?.count ?? 0}</span>
                  <p className="text-slate-500 text-sm">{label} · {(refundsByStatus[key]?.amount ?? 0).toLocaleString('ru-RU')} ₽</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mb-8">
          <DepartureLocationsManager initial={locationRows as { id: string; name: string }[]} />
        </div>

        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800">Разбивка по катерам и владельцам</h2>
          </div>
          {byBoatRows.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Катеров пока нет</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-slate-400 border-b border-slate-100">
                    <th className="px-6 py-3 font-medium">№ катера</th>
                    <th className="px-6 py-3 font-medium">Катер</th>
                    <th className="px-6 py-3 font-medium">№ владельца</th>
                    <th className="px-6 py-3 font-medium">Владелец</th>
                    <th className="px-6 py-3 font-medium text-right">Броней</th>
                    <th className="px-6 py-3 font-medium text-right">Выручка</th>
                    <th className="px-6 py-3 font-medium text-right">Комиссия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(byBoatRows as Record<string, unknown>[]).map((row) => (
                    <tr key={row.id as string} className="hover:bg-slate-50">
                      <td className="px-6 py-3 text-slate-500">№{formatBoatNumber(row.boatNumber as number | null)}</td>
                      <td className="px-6 py-3 font-medium text-slate-800">
                        <Link href={`/boats/${row.id}`} className="hover:underline">{row.title as string}</Link>
                      </td>
                      <td className="px-6 py-3 text-slate-500">№{formatOwnerNumber(row.ownerNumber as number | null)}</td>
                      <td className="px-6 py-3 text-slate-500">
                        {row.ownerName as string}
                        <span className="block text-xs text-slate-400">{row.ownerEmail as string}</span>
                      </td>
                      <td className="px-6 py-3 text-right text-slate-700">{row.paidBookings as number}</td>
                      <td className="px-6 py-3 text-right text-slate-700">{Number(row.revenue).toLocaleString('ru-RU')} ₽</td>
                      <td className="px-6 py-3 text-right text-slate-700">{Number(row.commission).toLocaleString('ru-RU')} ₽</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
