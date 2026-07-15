import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { decrypt } from '@/lib/session'

const protectedRoutes = ['/dashboard']
const ownerRoutes = ['/dashboard/owner']
const guestRoutes = ['/dashboard/guest']

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  const token = req.cookies.get('session')?.value
  const session = await decrypt(token)

  // Auth routing
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

  const response = NextResponse.next()

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (path.startsWith('/auth/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
