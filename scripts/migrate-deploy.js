// Runs `prisma migrate deploy` against DIRECT_URL instead of DATABASE_URL.
//
// Why this exists: prisma.config.ts wires the Prisma datasource to
// process.env.DATABASE_URL, which points at the Supabase pooler in
// transaction mode (port 6543). Prisma Migrate needs advisory locks and
// prepared statements, which transaction-mode pgbouncer doesn't support —
// that's why `npx prisma migrate deploy` hangs instead of failing outright.
//
// This script temporarily overrides DATABASE_URL with DIRECT_URL (same
// pooler host, session mode / port 5432) for this one process only, then
// runs migrate deploy. The app's own DATABASE_URL in .env is untouched.
require("dotenv/config");

if (!process.env.DIRECT_URL) {
  console.error("DIRECT_URL is not set in .env — add it before running db:migrate.");
  process.exit(1);
}

process.env.DATABASE_URL = process.env.DIRECT_URL;

const { execSync } = require("node:child_process");

execSync("npx prisma migrate deploy", { stdio: "inherit", env: process.env });
