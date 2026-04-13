import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from 'src/prisma/prisma.service';
import Parser = require('rss-parser');
import { NewsletterFeedService } from './newsletter-feed.service';

type FeedSource = { id: string; slug: string; feedUrl: string };

export type NewsletterIngestionTotals = {
  sourcesProcessed: number;
  itemsInserted: number;
  itemsUpdated: number;
  errors: { sourceId: string; slug: string; message: string }[];
};

/**
 * Chrome-like UA so CDNs / WAFs (Akamai, Cloudflare…) don't return 403.
 * Same approach as the local test script `newsletter/scripts/ingest-rss.mjs`.
 */
const BROWSER_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';

@Injectable()
export class NewsletterIngestionService {
  private readonly parser = new Parser({ timeout: 25_000 });

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
    sources: FeedSource[],
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
        totals.errors.push({ sourceId: source.id, slug: source.slug, message });
        this.logger.warn(
          `Newsletter RSS ingestion failed for ${source.slug}: ${message}`,
        );
      }
    }

    return totals;
  }

  private async ingestSingleSource(source: FeedSource): Promise<{
    inserted: number;
    updated: number;
  }> {
    const xml = await this.fetchRssXml(source.feedUrl);
    const feed = await this.parser.parseString(xml);
    let inserted = 0;
    let updated = 0;

    for (const item of feed.items ?? []) {
      const link = this.resolveLink(item);
      if (!link) continue;

      const title = item.title?.trim() || 'Sans titre';
      const summary =
        item.contentSnippet?.trim() ||
        (item as Record<string, unknown>)['summary']?.toString().trim() ||
        (typeof item.content === 'string' ? item.content.slice(0, 2000) : null);
      const publishedAt = this.parsePublishedAt(item);
      const externalId = this.resolveGuid(item);
      const rawPayload = this.toJsonValue(item);

      const existing = await this.prisma.newsletterFeedItem.findUnique({
        where: { sourceId_link: { sourceId: source.id, link } },
        select: { id: true },
      });

      await this.prisma.newsletterFeedItem.upsert({
        where: { sourceId_link: { sourceId: source.id, link } },
        create: { sourceId: source.id, link, title, summary, publishedAt, externalId, rawPayload },
        update: { title, summary, publishedAt, externalId, rawPayload, fetchedAt: new Date() },
      });

      if (existing) updated += 1;
      else inserted += 1;
    }

    return { inserted, updated };
  }

  /**
   * Download the RSS/Atom XML via Node's native fetch (Undici).
   * Uses a browser-like UA + Referer to avoid 403s on Akamai-protected sites
   * (Les Echos, Usine Digitale, etc.). rss-parser's built-in https.get does
   * not set these headers and gets blocked.
   */
  private async fetchRssXml(feedUrl: string): Promise<string> {
    let origin: string;
    try {
      origin = new URL(feedUrl).origin + '/';
    } catch {
      origin = 'https://www.google.com/';
    }

    const res = await fetch(feedUrl, {
      redirect: 'follow',
      signal: AbortSignal.timeout(25_000),
      headers: {
        'User-Agent': BROWSER_UA,
        Accept:
          'application/rss+xml, application/atom+xml, application/xml;q=0.9, text/xml;q=0.8, */*;q=0.7',
        'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        Referer: origin,
      },
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} ${res.statusText}`.trim());
    }

    return res.text();
  }

  private resolveLink(item: {
    link?: string;
    guid?: string | { _: string };
  }): string | null {
    const fromLink = item.link?.trim();
    if (fromLink) return fromLink;
    const g = item.guid;
    if (typeof g === 'string' && g.trim()) return g.trim();
    if (g && typeof g === 'object' && '_' in g && typeof g._ === 'string')
      return g._.trim();
    return null;
  }

  private resolveGuid(item: { guid?: string | { _: string } }): string | null {
    const g = item.guid;
    if (typeof g === 'string' && g.trim()) return g.trim();
    if (g && typeof g === 'object' && '_' in g && typeof g._ === 'string')
      return g._.trim();
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
