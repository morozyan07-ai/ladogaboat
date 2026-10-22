-- Удаление тестового катера и тестового аккаунта владельца.
-- Идемпотентно: безопасно повторять.
DELETE FROM "Review"
  WHERE "boatId" IN (SELECT id FROM "Boat" WHERE "ownerId" IN (SELECT id FROM "User" WHERE email = 'owner-test@ladogaboat.ru'));

DELETE FROM "Booking"
  WHERE "boatId" IN (SELECT id FROM "Boat" WHERE "ownerId" IN (SELECT id FROM "User" WHERE email = 'owner-test@ladogaboat.ru'));

DELETE FROM "Boat"
  WHERE "ownerId" IN (SELECT id FROM "User" WHERE email = 'owner-test@ladogaboat.ru');

DELETE FROM "User" WHERE email = 'owner-test@ladogaboat.ru';
