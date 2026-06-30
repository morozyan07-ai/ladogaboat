import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/session'
import { logout } from '@/app/actions/auth'

export default async function Header() {
  const session = await getSession()

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center">
            <Image src="/logo.svg" alt="Ladoga Boat" width={140} height={56} priority />
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/boats" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
              Каталог катеров
            </Link>
            {session ? (
              <>
                <Link
                  href={session.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest'}
                  className="text-slate-600 hover:text-blue-600 font-medium transition-colors"
                >
                  Личный кабинет
                </Link>
                <form action={logout}>
                  <button type="submit" className="text-slate-500 hover:text-red-500 font-medium transition-colors">
                    Выйти
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/auth/login" className="text-slate-600 hover:text-blue-600 font-medium transition-colors">
                  Войти
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Регистрация
                </Link>
              </>
            )}
          </nav>

          <div className="md:hidden">
            <Link href="/auth/login" className="text-blue-600 font-medium">
              Войти
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
