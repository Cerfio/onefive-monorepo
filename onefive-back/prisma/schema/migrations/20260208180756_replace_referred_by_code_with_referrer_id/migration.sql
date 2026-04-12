/*
  Warnings:

  - You are about to drop the column `referredByCode` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `referrerType` on the `Profile` table. All the data in the column will be lost.

*/
-- Step 1: Add new column
ALTER TABLE "Profile" ADD COLUMN "referrerId" TEXT;

-- Step 2: Migrate data: find referrer profile by referralCode and set referrerId
UPDATE "Profile" p
SET "referrerId" = (
  SELECT r.id 
  FROM "Profile" r 
  WHERE r."referralCode" = p."referredByCode" 
  LIMIT 1
)
WHERE p."referredByCode" IS NOT NULL;

-- Step 3: Drop old columns
ALTER TABLE "Profile" DROP COLUMN "referredByCode";
ALTER TABLE "Profile" DROP COLUMN "referrerType";

-- Step 4: Drop enum
DROP TYPE "public"."ReferrerType";

-- Step 5: Add foreign key constraint
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_referrerId_fkey" FOREIGN KEY ("referrerId") REFERENCES "Profile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
