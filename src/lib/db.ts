import { neon } from '@neondatabase/serverless'

// Lazy-инициализация: neon() НЕ вызывается при импорте модуля.
// Это предотвращает ошибку "No database connection string" во время next build,
// когда Next.js выполняет статическую генерацию без DATABASE_URL.
let _sql: ReturnType<typeof neon> | undefined

export const sql = new Proxy(
  (() => {}) as unknown as ReturnType<typeof neon>,
  {
    apply(_target, _thisArg, args) {
      if (!_sql) _sql = neon(process.env.DATABASE_URL!)
      return Reflect.apply(_sql, undefined, args)
    },
  }
)
