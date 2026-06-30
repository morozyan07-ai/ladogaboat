import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { getSession } from './session'

export const verifySession = cache(async () => {
  const session = await getSession()
  if (!session?.userId) redirect('/auth/login')
  return session
})

export const verifyOwner = cache(async () => {
  const session = await verifySession()
  if (session.role !== 'OWNER' && session.role !== 'ADMIN') redirect('/dashboard')
  return session
})

export const verifyGuest = cache(async () => {
  const session = await verifySession()
  if (session.role !== 'GUEST' && session.role !== 'ADMIN') redirect('/dashboard')
  return session
})
