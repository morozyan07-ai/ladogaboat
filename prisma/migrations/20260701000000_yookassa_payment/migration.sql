-- AlterTable: добавить поля ЮKassa в таблицу Booking
ALTER TABLE "Booking" ADD COLUMN "yookassaPaymentId" TEXT;
ALTER TABLE "Booking" ADD COLUMN "paidAt" TIMESTAMP(3);
