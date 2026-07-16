import 'server-only'
import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'

export type SessionPayload = {
  userId: string
  role: string
  name: string
  email: string
  expiresAt: Date
}

/**
 * Lazy-инициализация ключа.
 * КРИТИЧНО для CF Workers: crypto.subtle.importKey() с пустым ключом зависает.
 * Null-guard: если SESSION_SECRET не задан — случайный ключ.
 */
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

export async function encrypt(payload: SessionPayload) {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getKey())
}

export async function decrypt(token: string | undefined = '') {
  try {
    const { payload } = await jwtVerify(token, getKey(), { algorithms: ['HS256'] })
    return payload as unknown as SessionPayload
  } catch {
    return null
  }
}

export async function createSession(user: { id: string; role: string; name: string; email: string }) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  const session = await encrypt({ userId: user.id, role: user.role, name: user.name, email: user.email, expiresAt })
  const cookieStore = await cookies()
  cookieStore.set('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    sameSite: 'lax',
    path: '/',
  })
}

export async function deleteSession() {
  const cookieStore = await cookies()
  cookieStore.delete('session')
}

async function _getSessionImpl(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value
    return decrypt(token)
  } catch {
    return null
  }
}

/**
 * getSession — обёртка с таймаутом 1.5s.
 * КРИТИЧНО: cookies() и crypto.subtle.importKey() могут зависать в CF Workers
 * Edge Runtime (SSR). Promise.race гарантирует возврат null через 1.5s вместо
 * бесконечного ожидания, которое убивает SSR-стрим и даёт 503.
 */
export async function getSession(): Promise<SessionPayload | null> {
  return Promise.race([
    _getSessionImpl(),
    new Promise<null>(resolve => setTimeout(() => resolve(null), 1500)),
  ])
}
