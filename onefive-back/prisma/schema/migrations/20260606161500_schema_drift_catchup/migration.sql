-- CreateEnum
CREATE TYPE "AdminInvitationStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REVOKED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "NewsletterFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'QUARTERLY');

-- CreateEnum
CREATE TYPE "NewsletterDealType" AS ENUM ('FUNDRAISING', 'MA', 'LBO', 'OTHER');

-- CreateEnum
CREATE TYPE "NewsletterDealStatus" AS ENUM ('DRAFT', 'VALIDATED', 'SENT');

-- CreateEnum
CREATE TYPE "ReportResourceType" AS ENUM ('PROFILE', 'POST', 'POST_COMMENT', 'POST_COMMENT_REPLY', 'DISCUSSION', 'DISCUSSION_ANSWER', 'DISCUSSION_ANSWER_REPLY');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'HARASSMENT', 'INAPPROPRIATE_CONTENT', 'MISINFORMATION', 'IMPERSONATION', 'OTHER');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'RESOLVED', 'DISMISSED');

-- CreateEnum
CREATE TYPE "FeedbackType" AS ENUM ('BUG', 'SUGGESTION', 'COMMENT', 'FUNCTIONAL');

-- CreateEnum
CREATE TYPE "FundingModel" AS ENUM ('GRANT', 'EQUITY', 'REVENUE_SHARE', 'EQUITY_AND_GRANT', 'NONE');

-- CreateEnum
CREATE TYPE "StartupStage" AS ENUM ('IDEA', 'PRESEED', 'SEED', 'SERIES_A', 'GROWTH', 'ALL');

-- CreateEnum
CREATE TYPE "EventFormat" AS ENUM ('ONLINE', 'INPERSON', 'HYBRID');

-- CreateEnum
CREATE TYPE "PrizeType" AS ENUM ('CASH', 'GRANT', 'SERVICES', 'VISIBILITY', 'MIXED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ExpertiseDomain" ADD VALUE 'AI';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'FINTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'INSURTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'HEALTHTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'EDTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'GREENTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'ECOMMERCE';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'SOCIALIMPACT';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'LEGALTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'PROPTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'FOODTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'MOBILITY';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'GAMING';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'MEDIA';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'CYBERSECURITY';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'BIOTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'WEB3';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'HR';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'DESIGN';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'LUXURY';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'BEAUTY';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'SPORTS';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'QUANTUM';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'ADTECH';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'URBAN';
ALTER TYPE "ExpertiseDomain" ADD VALUE 'OTHER';

-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'DATAROOM_ENGAGEMENT';

-- AlterEnum
ALTER TYPE "ProviderType" ADD VALUE 'BPI_FRANCE';

-- AlterEnum
BEGIN;
CREATE TYPE "StartupMemberRoleType_new" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MEMBER');
ALTER TABLE "public"."StartupInvitation" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "StartupMember" ALTER COLUMN "role" TYPE "StartupMemberRoleType_new" USING ("role"::text::"StartupMemberRoleType_new");
ALTER TABLE "StartupInvitation" ALTER COLUMN "role" TYPE "StartupMemberRoleType_new" USING ("role"::text::"StartupMemberRoleType_new");
ALTER TYPE "StartupMemberRoleType" RENAME TO "StartupMemberRoleType_old";
ALTER TYPE "StartupMemberRoleType_new" RENAME TO "StartupMemberRoleType";
DROP TYPE "public"."StartupMemberRoleType_old";
ALTER TABLE "StartupInvitation" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterEnum
ALTER TYPE "WaitlistStatus" ADD VALUE 'IGNORED';

-- DropIndex
DROP INDEX "PostView_postId_profileId_idx";

-- AlterTable
ALTER TABLE "Discussion" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "FundingHistoryInvestor" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "LinkedInSync" ADD COLUMN     "syncCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "syncPeriodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "isHidden" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "SpotAccelerator" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "equityPercentage" DOUBLE PRECISION,
ADD COLUMN     "fundingModel" "FundingModel",
ADD COLUMN     "investmentAmount" DOUBLE PRECISION,
ADD COLUMN     "programDuration" INTEGER,
ADD COLUMN     "stage" "StartupStage";

-- AlterTable
ALTER TABLE "SpotContest" ADD COLUMN     "eligibility" TEXT,
ADD COLUMN     "expertiseDomains" "ExpertiseDomain"[],
ADD COLUMN     "prizeAmount" DOUBLE PRECISION,
ADD COLUMN     "prizeType" "PrizeType";

-- AlterTable
ALTER TABLE "SpotEvent" ADD COLUMN     "attendees" INTEGER,
ADD COLUMN     "format" "EventFormat";

-- AlterTable
ALTER TABLE "SpotIncubator" ADD COLUMN     "capacity" INTEGER,
ADD COLUMN     "equityPercentage" DOUBLE PRECISION,
ADD COLUMN     "fundingModel" "FundingModel",
ADD COLUMN     "investmentAmount" DOUBLE PRECISION,
ADD COLUMN     "programDuration" INTEGER,
ADD COLUMN     "stage" "StartupStage";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isBanned" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT,
    "lastName" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isSuperAdmin" BOOLEAN NOT NULL DEFAULT false,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminSession" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "adminUserId" TEXT NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "lastUsage" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userAgent" TEXT NOT NULL DEFAULT '',
    "ipAddress" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "AdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminRole" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminPermission" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUserRole" (
    "adminUserId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminUserRole_pkey" PRIMARY KEY ("adminUserId","roleId")
);

-- CreateTable
CREATE TABLE "AdminRolePermission" (
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminRolePermission_pkey" PRIMARY KEY ("roleId","permissionId")
);

-- CreateTable
CREATE TABLE "AdminInvitation" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "AdminInvitationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "invitedById" TEXT NOT NULL,
    "acceptedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminAuditLog" (
    "id" TEXT NOT NULL,
    "adminUserId" TEXT,
    "action" TEXT NOT NULL,
    "resourceType" TEXT NOT NULL,
    "resourceId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AdminAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataroomFileComment" (
    "id" TEXT NOT NULL,
    "dataroomId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,
    "profileId" TEXT NOT NULL,
    "content" VARCHAR(3000) NOT NULL,
    "pageNumber" INTEGER,
    "parentId" TEXT,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataroomFileComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterSubscriber" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "preferenceToken" TEXT NOT NULL,
    "isSubscribed" BOOLEAN NOT NULL DEFAULT true,
    "frequency" "NewsletterFrequency" NOT NULL DEFAULT 'WEEKLY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "NewsletterSubscriber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterDeal" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "dealType" "NewsletterDealType" NOT NULL DEFAULT 'OTHER',
    "amount" DOUBLE PRECISION,
    "currency" VARCHAR(10),
    "round" TEXT,
    "investors" JSONB,
    "sector" TEXT,
    "summary" TEXT,
    "primaryCountry" VARCHAR(5) NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "status" "NewsletterDealStatus" NOT NULL DEFAULT 'DRAFT',
    "feedItemId" TEXT,
    "extractedBy" TEXT,
    "promptVersion" TEXT,
    "confidence" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterDeal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Report" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "resourceType" "ReportResourceType" NOT NULL,
    "resourceId" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "message" VARCHAR(500),
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "reporterId" TEXT NOT NULL,
    "type" "FeedbackType" NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "url" VARCHAR(500),
    "browserInfo" VARCHAR(500),
    "screenshotId" TEXT,
    "status" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "AdminSession_token_key" ON "AdminSession"("token");

-- CreateIndex
CREATE INDEX "AdminSession_adminUserId_idx" ON "AdminSession"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminSession_expiresAt_idx" ON "AdminSession"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "AdminRole_key_key" ON "AdminRole"("key");

-- CreateIndex
CREATE UNIQUE INDEX "AdminPermission_key_key" ON "AdminPermission"("key");

-- CreateIndex
CREATE INDEX "AdminUserRole_roleId_idx" ON "AdminUserRole"("roleId");

-- CreateIndex
CREATE INDEX "AdminRolePermission_permissionId_idx" ON "AdminRolePermission"("permissionId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminInvitation_token_key" ON "AdminInvitation"("token");

-- CreateIndex
CREATE INDEX "AdminInvitation_email_idx" ON "AdminInvitation"("email");

-- CreateIndex
CREATE INDEX "AdminInvitation_status_expiresAt_idx" ON "AdminInvitation"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "AdminAuditLog_adminUserId_idx" ON "AdminAuditLog"("adminUserId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_resourceType_resourceId_idx" ON "AdminAuditLog"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "AdminAuditLog_createdAt_idx" ON "AdminAuditLog"("createdAt");

-- CreateIndex
CREATE INDEX "DataroomFileComment_fileId_createdAt_idx" ON "DataroomFileComment"("fileId", "createdAt");

-- CreateIndex
CREATE INDEX "DataroomFileComment_profileId_idx" ON "DataroomFileComment"("profileId");

-- CreateIndex
CREATE INDEX "DataroomFileComment_parentId_idx" ON "DataroomFileComment"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_email_key" ON "NewsletterSubscriber"("email");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterSubscriber_preferenceToken_key" ON "NewsletterSubscriber"("preferenceToken");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_isSubscribed_idx" ON "NewsletterSubscriber"("isSubscribed");

-- CreateIndex
CREATE INDEX "NewsletterSubscriber_preferenceToken_idx" ON "NewsletterSubscriber"("preferenceToken");

-- CreateIndex
CREATE INDEX "NewsletterDeal_status_primaryCountry_idx" ON "NewsletterDeal"("status", "primaryCountry");

-- CreateIndex
CREATE INDEX "NewsletterDeal_publishedAt_idx" ON "NewsletterDeal"("publishedAt");

-- CreateIndex
CREATE INDEX "NewsletterDeal_feedItemId_idx" ON "NewsletterDeal"("feedItemId");

-- CreateIndex
CREATE INDEX "Report_reporterId_idx" ON "Report"("reporterId");

-- CreateIndex
CREATE INDEX "Report_resourceType_resourceId_idx" ON "Report"("resourceType", "resourceId");

-- CreateIndex
CREATE INDEX "Report_status_idx" ON "Report"("status");

-- CreateIndex
CREATE INDEX "Report_createdAt_idx" ON "Report"("createdAt");

-- CreateIndex
CREATE INDEX "Feedback_reporterId_idx" ON "Feedback"("reporterId");

-- CreateIndex
CREATE INDEX "Feedback_type_idx" ON "Feedback"("type");

-- CreateIndex
CREATE INDEX "Feedback_status_idx" ON "Feedback"("status");

-- CreateIndex
CREATE INDEX "Feedback_createdAt_idx" ON "Feedback"("createdAt");

-- CreateIndex
CREATE INDEX "AccessLog_dataroomId_action_idx" ON "AccessLog"("dataroomId", "action");

-- CreateIndex
CREATE INDEX "Member_dataroomId_profileId_idx" ON "Member"("dataroomId", "profileId");

-- CreateIndex
CREATE UNIQUE INDEX "PostView_postId_profileId_key" ON "PostView"("postId", "profileId");

-- CreateIndex
CREATE INDEX "Referral_referrerId_status_idx" ON "Referral"("referrerId", "status");

-- CreateIndex
CREATE INDEX "Session_userId_isRevoked_idx" ON "Session"("userId", "isRevoked");

-- CreateIndex
CREATE UNIQUE INDEX "SmsVerification_userId_key" ON "SmsVerification"("userId");

-- CreateIndex
CREATE INDEX "StartupMember_profileId_role_idx" ON "StartupMember"("profileId", "role");

-- AddForeignKey
ALTER TABLE "AdminSession" ADD CONSTRAINT "AdminSession_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUserRole" ADD CONSTRAINT "AdminUserRole_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminUserRole" ADD CONSTRAINT "AdminUserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRolePermission" ADD CONSTRAINT "AdminRolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminRolePermission" ADD CONSTRAINT "AdminRolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "AdminPermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "AdminRole"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_invitedById_fkey" FOREIGN KEY ("invitedById") REFERENCES "AdminUser"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminInvitation" ADD CONSTRAINT "AdminInvitation_acceptedById_fkey" FOREIGN KEY ("acceptedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdminAuditLog" ADD CONSTRAINT "AdminAuditLog_adminUserId_fkey" FOREIGN KEY ("adminUserId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataroomFileComment" ADD CONSTRAINT "DataroomFileComment_dataroomId_fkey" FOREIGN KEY ("dataroomId") REFERENCES "Dataroom"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataroomFileComment" ADD CONSTRAINT "DataroomFileComment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "DataroomFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataroomFileComment" ADD CONSTRAINT "DataroomFileComment_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataroomFileComment" ADD CONSTRAINT "DataroomFileComment_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "DataroomFileComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Report" ADD CONSTRAINT "Report_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_reporterId_fkey" FOREIGN KEY ("reporterId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_screenshotId_fkey" FOREIGN KEY ("screenshotId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

