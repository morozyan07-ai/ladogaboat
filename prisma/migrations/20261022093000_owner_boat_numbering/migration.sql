-- Внутренняя нумерация судовладельцев и катеров для дашборда.
-- Судовладельцы: 0001, 0002, ... Катера: 00001, 00002, ...
-- Номера назначаются по порядку регистрации/создания (старые записи — меньший номер),
-- далее новые записи получают номер автоматически через DEFAULT nextval(...).

-- Судовладельцы
ALTER TABLE "User" ADD COLUMN "ownerNumber" INTEGER;

CREATE SEQUENCE IF NOT EXISTS owner_number_seq;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "User"
  WHERE role = 'OWNER'
)
UPDATE "User" u SET "ownerNumber" = ranked.rn
FROM ranked WHERE ranked.id = u.id;

SELECT setval('owner_number_seq', COALESCE((SELECT MAX("ownerNumber") FROM "User"), 0) + 1, false);

ALTER TABLE "User" ALTER COLUMN "ownerNumber" SET DEFAULT nextval('owner_number_seq');
ALTER TABLE "User" ADD CONSTRAINT "User_ownerNumber_key" UNIQUE ("ownerNumber");

-- Катера
ALTER TABLE "Boat" ADD COLUMN "boatNumber" INTEGER;

CREATE SEQUENCE IF NOT EXISTS boat_number_seq;

WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY "createdAt" ASC) AS rn
  FROM "Boat"
)
UPDATE "Boat" b SET "boatNumber" = ranked.rn
FROM ranked WHERE ranked.id = b.id;

SELECT setval('boat_number_seq', COALESCE((SELECT MAX("boatNumber") FROM "Boat"), 0) + 1, false);

ALTER TABLE "Boat" ALTER COLUMN "boatNumber" SET DEFAULT nextval('boat_number_seq');
ALTER TABLE "Boat" ADD CONSTRAINT "Boat_boatNumber_key" UNIQUE ("boatNumber");
