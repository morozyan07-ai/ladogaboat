-- Bootstrap: grant ADMIN role to the platform owner's account.
-- Idempotent: safe to re-run.
UPDATE "User" SET role = 'ADMIN' WHERE email = 'morozyan07@gmail.com' AND role != 'ADMIN';
