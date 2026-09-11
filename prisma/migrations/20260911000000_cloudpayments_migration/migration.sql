-- AlterTable: миграция с ЮKassa на CloudPayments
ALTER TABLE "Booking" RENAME COLUMN "yookassaPaymentId" TO "cloudPaymentsInvoiceId";
ALTER TABLE "Booking" ADD COLUMN "cloudPaymentsTransactionId" TEXT;
