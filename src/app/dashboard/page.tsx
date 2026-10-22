import { redirect } from 'next/navigation'
import { verifySession } from '@/lib/dal'

export default async function DashboardPage() {
  const session = await verifySession()
  if (session.role === 'ADMIN') redirect('/dashboard/admin')
  redirect(session.role === 'OWNER' ? '/dashboard/owner' : '/dashboard/guest')
}
