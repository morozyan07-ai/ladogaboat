-- Количество человек в брони — нужно для тур-тарифа (priceUnit = TOUR),
-- где цена за одного человека, а не за весь катер целиком.
ALTER TABLE "Booking" ADD COLUMN "guestCount" INTEGER NOT NULL DEFAULT 1;
