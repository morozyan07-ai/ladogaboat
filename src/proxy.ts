import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/dashboard']
const ownerRoutes = ['/dashboard/owner']
const guestRoutes = ['/dashboard/guest']

export default async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname
  const token = req.cookies.get('session')?.value
  const session = await decrypt(token)

  const isProtected = protectedRoutes.some((r) => path.startsWith(r))
  if (isProtected && !session?.userId) {
    return NextResponse.redirect(new URL('/auth/login', req.nextUrl))
  }

  if (session?.userId) {
    if (ownerRoutes.some((r) => path.startsWith(r)) && session.role === 'GUEST') {
      return NextResponse.redirect(new URL('/dashboard/guest', req.nextUrl))
    }
    if (guestRoutes.some((r) => path.startsWith(r)) && session.role === 'OWNER') {
      return NextResponse.redirect(new URL('/dashboard/owner', req.nextUrl))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
