-- CreateTable
CREATE TABLE "NewsletterFeedSource" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "feedUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsletterFeedSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsletterFeedItem" (
    "id" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "externalId" TEXT,
    "link" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "publishedAt" TIMESTAMP(3),
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayload" JSONB,

    CONSTRAINT "NewsletterFeedItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterFeedSource_slug_key" ON "NewsletterFeedSource"("slug");

-- CreateIndex
CREATE INDEX "NewsletterFeedSource_isActive_idx" ON "NewsletterFeedSource"("isActive");

-- CreateIndex
CREATE INDEX "NewsletterFeedItem_sourceId_publishedAt_idx" ON "NewsletterFeedItem"("sourceId", "publishedAt");

-- CreateIndex
CREATE INDEX "NewsletterFeedItem_publishedAt_idx" ON "NewsletterFeedItem"("publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "NewsletterFeedItem_sourceId_link_key" ON "NewsletterFeedItem"("sourceId", "link");

-- AddForeignKey
ALTER TABLE "NewsletterFeedItem" ADD CONSTRAINT "NewsletterFeedItem_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "NewsletterFeedSource"("id") ON DELETE CASCADE ON UPDATE CASCADE;
