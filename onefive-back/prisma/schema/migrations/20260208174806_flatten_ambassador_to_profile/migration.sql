/*
  Warnings:

  - You are about to drop the `Ambassador` table. If the table is not empty, all the data it contains will be lost.

*/
-- Step 1: Add new columns to Profile
ALTER TABLE "Profile" ADD COLUMN     "ambassadorInterviewUrl" TEXT,
ADD COLUMN     "ambassadorTitle" TEXT,
ADD COLUMN     "isAmbassador" BOOLEAN NOT NULL DEFAULT false;

-- Step 2: Migrate data from Ambassador to Profile
UPDATE "Profile" p
SET 
  "isAmbassador" = true,
  "ambassadorTitle" = a."title",
  "ambassadorInterviewUrl" = a."interviewUrl"
FROM "Ambassador" a
WHERE p."id" = a."profileId" AND a."isActive" = true;

-- Step 3: Drop foreign key and table
ALTER TABLE "Ambassador" DROP CONSTRAINT "Ambassador_profileId_fkey";
DROP TABLE "Ambassador";
