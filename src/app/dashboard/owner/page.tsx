import Link from 'next/link'
import { verifyOwner } from '@/lib/dal'
import prisma from '@/lib/prisma'
import OwnerPayoutForm from '@/components/dashboard/OwnerPayoutForm'
import RefundDecisionButtons from '@/components/dashboard/RefundDecisionButtons'

export default async function OwnerDashboard() {
  const session = await verifyOwner()

  const [boats, bookings, payoutUser] = await Promise.all([
    prisma.boat.findMany({
      where: { ownerId: session.userId },
      include: { _count: { select: { bookings: true, reviews: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.booking.findMany({
      where: { boat: { ownerId: session.userId } },
      include: { boat: { select: { title: true } }, guest: { select: { name: true, email: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        payoutLegalName: true,
        payoutInn: true,
        payoutOgrn: true,
        payoutBankName: true,
        payoutBik: true,
        payoutAccount: true,
        payoutCorrAccount: true,
        payoutUpdatedAt: true,
      },
    }),
  ])

  const totalRevenue = bookings
    .filter((b: { status: string }) => b.status === 'CONFIRMED' || b.status === 'COMPLETED')
    .reduce((s: number, b: { totalPrice: unknown; commission: unknown }) => s + Number(b.totalPrice) - Number(b.commission), 0)

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-slate-800">Кабинет судовладельца</h1>
            <p className="text-slate-500 mt-1">Привет, {session.name}!</p>
          </div>
          <Link
            href="/dashboard/owner/boats/new"
            className="bg-blue-600 text-white px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors font-medium"
          >
            + Добавить катер
          </Link>
        </div>

        {/* Stats */}
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

        {/* Реквизиты для выплат */}
        <div className="mb-8">
          <OwnerPayoutForm initial={payoutUser ?? {}} />
        </div>

        {/* Boats */}
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
              {boats.map((boat) => (
                <div key={boat.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{boat.title}</p>
                    <p className="text-sm text-slate-500">
                      {boat._count.bookings} бронирований · {boat._count.reviews} отзывов
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${boat.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                      {boat.status === 'ACTIVE' ? 'Активен' : 'Неактивен'}
                    </span>
                    <Link href={`/boats/${boat.id}`} className="text-sm text-blue-600 hover:underline">
                      Просмотр
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent bookings */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-xl font-semibold text-slate-800">Последние бронирования</h2>
          </div>
          {bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400">Бронирований пока нет</div>
          ) : (
            <div className="divide-y divide-slate-100">
              {bookings.map((b) => (
                <div key={b.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-slate-800">{b.boat.title}</p>
                      <p className="text-sm text-slate-500">
                        Гость: {b.guest.name} · {new Date(b.startDate).toLocaleDateString('ru-RU')} — {new Date(b.endDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-800">{Number(b.totalPrice).toLocaleString('ru-RU')} ₽</p>
                      <StatusBadge status={b.status} />
                    </div>
                  </div>
                  {b.refundStatus === 'REQUESTED' && (
                    <div className="mt-3 pt-3 border-t border-amber-100 bg-amber-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-amber-700">Запрос на возврат средств</p>
                          <p className="text-sm text-slate-600 mt-0.5">{b.refundReason}</p>
                        </div>
                        <RefundDecisionButtons bookingId={b.id} />
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
              ))}
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
