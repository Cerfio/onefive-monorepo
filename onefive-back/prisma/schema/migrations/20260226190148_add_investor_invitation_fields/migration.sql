-- CreateEnum
CREATE TYPE "InvestorInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED');

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'INVESTOR_INVITATION';

-- AlterTable: make profileId optional and add new fields
ALTER TABLE "FundingHistoryInvestor" ALTER COLUMN "profileId" DROP NOT NULL;
ALTER TABLE "FundingHistoryInvestor" ADD COLUMN "email" TEXT;
ALTER TABLE "FundingHistoryInvestor" ADD COLUMN "firstName" TEXT;
ALTER TABLE "FundingHistoryInvestor" ADD COLUMN "lastName" TEXT;
ALTER TABLE "FundingHistoryInvestor" ADD COLUMN "invitationStatus" "InvestorInvitationStatus" NOT NULL DEFAULT 'PENDING';
ALTER TABLE "FundingHistoryInvestor" ADD COLUMN "isVisible" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "FundingHistoryInvestor" ADD COLUMN "token" TEXT;
ALTER TABLE "FundingHistoryInvestor" ADD COLUMN "expiresAt" TIMESTAMP(3);
ALTER TABLE "FundingHistoryInvestor" ADD COLUMN "respondedAt" TIMESTAMP(3);
ALTER TABLE "FundingHistoryInvestor" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX "FundingHistoryInvestor_token_key" ON "FundingHistoryInvestor"("token");

-- CreateIndex
CREATE INDEX "FundingHistoryInvestor_token_idx" ON "FundingHistoryInvestor"("token");

-- CreateIndex
CREATE INDEX "FundingHistoryInvestor_email_idx" ON "FundingHistoryInvestor"("email");

-- Set existing records to ACCEPTED (they were already confirmed before this feature)
UPDATE "FundingHistoryInvestor" SET "invitationStatus" = 'ACCEPTED' WHERE "profileId" IS NOT NULL;
