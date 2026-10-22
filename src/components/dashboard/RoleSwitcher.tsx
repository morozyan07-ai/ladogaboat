import Link from 'next/link'

type Props = { active: 'owner' | 'admin' }

export default function RoleSwitcher({ active }: Props) {
  const base = 'px-4 py-2 rounded-lg text-sm font-medium transition-colors'
  const activeCls = 'bg-white text-slate-800 shadow-sm'
  const inactiveCls = 'text-white/70 hover:text-white'

  return (
    <div className="inline-flex items-center gap-1 bg-white/10 rounded-xl p-1 mb-4">
      <Link href="/dashboard/owner" className={`${base} ${active === 'owner' ? activeCls : inactiveCls}`}>
        ⛵ Судовладелец
      </Link>
      <Link href="/dashboard/admin" className={`${base} ${active === 'admin' ? activeCls : inactiveCls}`}>
        📊 Админ-панель
      </Link>
    </div>
  )
}
