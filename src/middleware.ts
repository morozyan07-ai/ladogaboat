import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

type SessionPayload = {
  userId: string
  role: string
  name: string
  email: string
  expiresAt: Date
}

let _key: Uint8Array | undefined
function getKey(): Uint8Array {
  if (!_key) {
    const secret = process.env.SESSION_SECRET
    if (!secret) {
      _key = crypto.getRandomValues(new Uint8Array(32))
    } else {
      _key = new TextEncoder().encode(secret)
    }
  }
  return _key
}

async function decrypt(token: string | undefined = ''): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

const protectedRoutes = ['/dashboard']
const ownerRoutes = ['/dashboard/owner']
const guestRoutes = ['/dashboard/guest']

export async function middleware(req: NextRequest) {
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

  const response = NextResponse.next()
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  if (path.startsWith('/auth/')) {
    response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  }

  if (session?.role) {
    response.cookies.set('user-role', session.role, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    })
  } else {
    response.cookies.set('user-role', '', { maxAge: 0, path: '/' })
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
