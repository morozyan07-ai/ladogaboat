import { neon } from '@neondatabase/serverless'

type Sql = ReturnType<typeof neon>
let _sql: Sql | undefined

// Lazy-инициализация: neon() не вызывается при импорте модуля.
// При next build DATABASE_URL недоступна — вызов произойдёт только при runtime.
// Все routes/pages помечены как force-dynamic чтобы Next.js не выполнял их при build.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql = ((...args: Parameters<Sql>) => {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!)
  return _sql(...args)
}) as unknown as Sql
