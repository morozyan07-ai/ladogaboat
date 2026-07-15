import { getSession } from '@/lib/session'
import HeaderClient from '@/components/layout/HeaderClient'

export default async function Header() {
  const session = await getSession()
  return <HeaderClient role={session?.role ?? null} />
}
