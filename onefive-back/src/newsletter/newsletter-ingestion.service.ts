import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import Parser from 'rss-parser';
import type { NewsletterFeedSource } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { NewsletterFeedService } from './newsletter-feed.service';

export type NewsletterIngestionTotals = {
  sourcesProcessed: number;
  itemsInserted: number;
  itemsUpdated: number;
  errors: { sourceId: string; slug: string; message: string }[];
};

@Injectable()
export class NewsletterIngestionService {
  private readonly parser = new Parser({
    timeout: 25_000,
    headers: {
      'User-Agent': 'OneFiveNewsletterBot/1.0 (+https://onefive.app)',
    },
  });

  constructor(
    private readonly prisma: PrismaService,
    private readonly feedService: NewsletterFeedService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  async ingestAllActiveFeeds(): Promise<NewsletterIngestionTotals> {
    const sources = await this.feedService.listActiveSources();
    return this.runForSources(sources);
  }

  async ingestBySourceId(sourceId: string): Promise<NewsletterIngestionTotals> {
    const source = await this.feedService.getActiveSourceById(sourceId);
    return this.runForSources([source]);
  }

  private async runForSources(
    sources: NewsletterFeedSource[],
  ): Promise<NewsletterIngestionTotals> {
    const totals: NewsletterIngestionTotals = {
      sourcesProcessed: 0,
      itemsInserted: 0,
      itemsUpdated: 0,
      errors: [],
    };

    for (const source of sources) {
      try {
        const { inserted, updated } = await this.ingestSingleSource(source);
        totals.sourcesProcessed += 1;
        totals.itemsInserted += inserted;
        totals.itemsUpdated += updated;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Unknown ingestion error';
        totals.errors.push({
          sourceId: source.id,
          slug: source.slug,
          message,
        });
        this.logger.warn(
          `Newsletter RSS ingestion failed for ${source.slug}: ${message}`,
        );
      }
    }

    return totals;
  }

  private async ingestSingleSource(source: NewsletterFeedSource): Promise<{
    inserted: number;
    updated: number;
  }> {
    const feed = await this.parser.parseURL(source.feedUrl);
    let inserted = 0;
    let updated = 0;

    const items = feed.items ?? [];
    for (const item of items) {
      const link = this.resolveLink(item);
      if (!link) {
        continue;
      }

      const title = item.title?.trim() || 'Sans titre';
      const summary =
        item.contentSnippet?.trim() ||
        item.summary?.trim() ||
        (typeof item.content === 'string' ? item.content.slice(0, 2000) : null);
      const publishedAt = this.parsePublishedAt(item);
      const externalId = this.resolveGuid(item);
      const rawPayload = this.toJsonValue(item);

      const existing = await this.prisma.newsletterFeedItem.findUnique({
        where: {
          sourceId_link: { sourceId: source.id, link },
        },
        select: { id: true },
      });

      await this.prisma.newsletterFeedItem.upsert({
        where: {
          sourceId_link: { sourceId: source.id, link },
        },
        create: {
          sourceId: source.id,
          link,
          title,
          summary,
          publishedAt,
          externalId,
          rawPayload,
        },
        update: {
          title,
          summary,
          publishedAt,
          externalId,
          rawPayload,
          fetchedAt: new Date(),
        },
      });

      if (existing) {
        updated += 1;
      } else {
        inserted += 1;
      }
    }

    return { inserted, updated };
  }

  private resolveLink(item: {
    link?: string;
    guid?: string | { _: string };
  }): string | null {
    const fromLink = item.link?.trim();
    if (fromLink) {
      return fromLink;
    }
    const g = item.guid;
    if (typeof g === 'string' && g.trim()) {
      return g.trim();
    }
    if (g && typeof g === 'object' && '_' in g && typeof g._ === 'string') {
      return g._.trim();
    }
    return null;
  }

  private resolveGuid(item: { guid?: string | { _: string } }): string | null {
    const g = item.guid;
    if (typeof g === 'string' && g.trim()) {
      return g.trim();
    }
    if (g && typeof g === 'object' && '_' in g && typeof g._ === 'string') {
      return g._.trim();
    }
    return null;
  }

  private parsePublishedAt(item: {
    pubDate?: string;
    isoDate?: string;
  }): Date | null {
    if (item.isoDate) {
      const d = new Date(item.isoDate);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    if (item.pubDate) {
      const d = new Date(item.pubDate);
      return Number.isNaN(d.getTime()) ? null : d;
    }
    return null;
  }

  private toJsonValue(item: unknown): object | null {
    try {
      return JSON.parse(JSON.stringify(item)) as object;
    } catch {
      return null;
    }
  }
}
