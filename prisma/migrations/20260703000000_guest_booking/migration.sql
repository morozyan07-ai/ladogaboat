-- Гостевое бронирование без регистрации
-- 1. Делаем guestId необязательным
ALTER TABLE "Booking" ALTER COLUMN "guestId" DROP NOT NULL;

-- 2. Добавляем поля данных гостя без регистрации
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "guestName"   TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "guestPhone"  TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "guestEmail"  TEXT;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "bookingCode" TEXT;

-- 3. Уникальный индекс на код бронирования
CREATE UNIQUE INDEX IF NOT EXISTS "Booking_bookingCode_key" ON "Booking"("bookingCode");
