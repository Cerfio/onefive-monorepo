import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import type { CreateNewsletterFeedDto } from './dto/create-newsletter-feed.dto';

@Injectable()
export class NewsletterFeedService {
  constructor(private readonly prisma: PrismaService) {}

  async createFeed(dto: CreateNewsletterFeedDto) {
    const existing = await this.prisma.newsletterFeedSource.findUnique({
      where: { slug: dto.slug },
      select: { id: true },
    });
    if (existing) {
      throw new ConflictException('A feed with this slug already exists');
    }

    return this.prisma.newsletterFeedSource.create({
      data: {
        slug: dto.slug,
        name: dto.name,
        feedUrl: dto.feedUrl,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async listFeeds() {
    return this.prisma.newsletterFeedSource.findMany({
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { items: true } },
      },
    });
  }

  async getActiveSourceById(id: string) {
    const source = await this.prisma.newsletterFeedSource.findFirst({
      where: { id, isActive: true },
    });
    if (!source) {
      throw new NotFoundException('Feed source not found or inactive');
    }
    return source;
  }

  async listActiveSources() {
    return this.prisma.newsletterFeedSource.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    });
  }
}
