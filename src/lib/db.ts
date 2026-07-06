import { neon } from '@neondatabase/serverless'

// Прямой HTTP клиент к Neon без Prisma
// Заменяет: @prisma/client, @prisma/adapter-neon, src/lib/prisma.ts
export const sql = neon(process.env.DATABASE_URL!)
