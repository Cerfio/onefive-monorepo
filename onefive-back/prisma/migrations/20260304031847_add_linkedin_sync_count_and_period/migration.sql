-- AlterTable: add syncCount and syncPeriodStart to LinkedInSync
ALTER TABLE "LinkedInSync" ADD COLUMN "syncCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "LinkedInSync" ADD COLUMN "syncPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
