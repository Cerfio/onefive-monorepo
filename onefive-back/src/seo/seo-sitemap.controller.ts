import { Controller, Get, Query } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('seo')
@Public()
export class SeoSitemapController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('sitemap/startups')
  async sitemapStartups(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const items = await this.prisma.startup.findMany({
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 50000,
    });
    return { success: true, data: items };
  }

  @Get('sitemap/profiles')
  async sitemapProfiles(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const items = await this.prisma.profile.findMany({
      where: {
        user: { isBanned: false },
        waitlistStatus: 'ACTIVE',
      },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 50000,
    });
    return { success: true, data: items };
  }

  @Get('sitemap/discussions')
  async sitemapDiscussions(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const items = await this.prisma.discussion.findMany({
      where: { isHidden: false },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 50000,
    });
    return { success: true, data: items };
  }

  @Get('sitemap/spots')
  async sitemapSpots(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const items = await this.prisma.spot.findMany({
      select: { id: true, name: true, spot: true },
      orderBy: { id: 'desc' },
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 50000,
    });
    return { success: true, data: items };
  }

  @Get('sitemap/posts')
  async sitemapPosts(
    @Query('skip') skip?: string,
    @Query('take') take?: string,
  ) {
    const items = await this.prisma.post.findMany({
      where: { isHidden: false },
      select: { id: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
      skip: skip ? parseInt(skip) : 0,
      take: take ? parseInt(take) : 50000,
    });
    return { success: true, data: items };
  }

  @Get('count/startups')
  async countStartups() {
    const count = await this.prisma.startup.count();
    return { success: true, data: count };
  }

  @Get('count/profiles')
  async countProfiles() {
    const count = await this.prisma.profile.count({
      where: { user: { isBanned: false }, waitlistStatus: 'ACTIVE' },
    });
    return { success: true, data: count };
  }

  @Get('count/discussions')
  async countDiscussions() {
    const count = await this.prisma.discussion.count({
      where: { isHidden: false },
    });
    return { success: true, data: count };
  }

  @Get('count/spots')
  async countSpots() {
    const count = await this.prisma.spot.count();
    return { success: true, data: count };
  }

  @Get('count/posts')
  async countPosts() {
    const count = await this.prisma.post.count({
      where: { isHidden: false },
    });
    return { success: true, data: count };
  }
}
