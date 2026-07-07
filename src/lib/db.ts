import { neon } from '@neondatabase/serverless'

type Row = Record<string, unknown>

let _sql: ReturnType<typeof neon> | undefined

/**
 * Lazy-инициализация neon().
 * Возвращает Promise<Row[]> — TypeScript знает что это массив, .length/.map работают.
 * При next build neon() не вызывается (все routes помечены force-dynamic).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const sql = (strings: TemplateStringsArray, ...values: any[]): Promise<Row[]> => {
  if (!_sql) _sql = neon(process.env.DATABASE_URL!)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (_sql as any)(strings, ...values) as Promise<Row[]>
}
