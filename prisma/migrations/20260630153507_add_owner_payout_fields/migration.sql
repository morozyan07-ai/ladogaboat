-- AlterTable
ALTER TABLE "User" ADD COLUMN     "payoutLegalName" TEXT,
ADD COLUMN     "payoutInn" TEXT,
ADD COLUMN     "payoutOgrn" TEXT,
ADD COLUMN     "payoutBankName" TEXT,
ADD COLUMN     "payoutBik" TEXT,
ADD COLUMN     "payoutAccount" TEXT,
ADD COLUMN     "payoutCorrAccount" TEXT,
ADD COLUMN     "payoutUpdatedAt" TIMESTAMP(3);
