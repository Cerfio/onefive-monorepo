-- AlterTable
ALTER TABLE "PasswordReset" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "PostView_profileId_idx" ON "PostView"("profileId");

-- CreateIndex
CREATE INDEX "ProfileFollow_followedById_createdAt_idx" ON "ProfileFollow"("followedById", "createdAt");

-- CreateIndex
CREATE INDEX "Relationship_accepterId_status_idx" ON "Relationship"("accepterId", "status");
