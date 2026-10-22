-- Удаление тестового гостевого аккаунта.
-- Идемпотентно: безопасно повторять.
DELETE FROM "Review"
  WHERE "guestId" IN (SELECT id FROM "User" WHERE email = 'morozyan07@mail.ru');

DELETE FROM "Booking"
  WHERE "guestId" IN (SELECT id FROM "User" WHERE email = 'morozyan07@mail.ru');

DELETE FROM "User" WHERE email = 'morozyan07@mail.ru';
