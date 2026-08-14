// One-time DDL migrations via Neon HTTP (no direct connection required)
// Usage: node scripts/neon-migrate.js
const { neon } = require('@neondatabase/serverless')

const sql = neon(process.env.DATABASE_URL)

async function main() {
  console.log('Applying DB migrations via Neon HTTP...')

  // Add priceUnit column (idempotent)
  await sql`ALTER TABLE "Boat" ADD COLUMN IF NOT EXISTS "priceUnit" TEXT NOT NULL DEFAULT 'SUTKI'`

  console.log('Migrations applied successfully')
}

main().catch(err => {
  console.error('Migration error:', err)
  process.exit(1)
})
