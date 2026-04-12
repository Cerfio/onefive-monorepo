import { Controller, Get, Param, NotFoundException } from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('seo')
@Public()
export class SeoPreviewController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('startup/:id')
  async getStartupPublic(@Param('id') id: string) {
    const startup = await this.prisma.startup.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        tagline: true,
        description: true,
        categories: true,
        city: true,
        countryCode: true,
        foundedDate: true,
        logo: true,
        coverImage: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            followedBy: true,
            members: true,
          },
        },
      },
    });

    if (!startup) throw new NotFoundException('Startup not found');

    return {
      success: true,
      data: {
        id: startup.id,
        name: startup.name,
        tagline: startup.tagline,
        description: startup.description
          ? startup.description.slice(0, 200)
          : null,
        categories: startup.categories,
        city: startup.city,
        countryCode: startup.countryCode,
        foundedDate: startup.foundedDate?.toISOString() ?? null,
        logo: startup.logo,
        coverImage: startup.coverImage,
        stats: {
          followers: startup._count.followedBy,
          members: startup._count.members,
        },
        createdAt: startup.createdAt.toISOString(),
        updatedAt: startup.updatedAt.toISOString(),
      },
    };
  }

  @Get('profile/:id')
  async getProfilePublic(@Param('id') id: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        highlight: true,
        bio: true,
        city: true,
        countryCode: true,
        skills: true,
        ecosystemRoles: true,
        avatarId: true,
        coverId: true,
        createdAt: true,
        updatedAt: true,
        experiences: {
          orderBy: { from: 'desc' },
          take: 1,
          select: {
            title: true,
            company: true,
          },
        },
        startups: {
          select: {
            startup: {
              select: { id: true, name: true },
            },
          },
        },
        _count: {
          select: {
            followedBy: true,
            posts: true,
          },
        },
      },
    });

    if (!profile) throw new NotFoundException('Profile not found');

    return {
      success: true,
      data: {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        highlight: profile.highlight,
        bio: profile.bio ? profile.bio.slice(0, 150) : null,
        city: profile.city,
        countryCode: profile.countryCode,
        skills: profile.skills,
        ecosystemRoles: profile.ecosystemRoles,
        avatarId: profile.avatarId,
        coverId: profile.coverId,
        latestExperience: profile.experiences[0] ?? null,
        startups: profile.startups.map((m) => ({
          id: m.startup.id,
          name: m.startup.name,
        })),
        stats: {
          followers: profile._count.followedBy,
          posts: profile._count.posts,
        },
        createdAt: profile.createdAt.toISOString(),
        updatedAt: profile.updatedAt.toISOString(),
      },
    };
  }

  @Get('discussion/:id')
  async getDiscussionPublic(@Param('id') id: string) {
    const discussion = await this.prisma.discussion.findUnique({
      where: { id },
      select: {
        id: true,
        question: true,
        content: true,
        context: true,
        tags: true,
        type: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarId: true,
          },
        },
        _count: {
          select: {
            answers: true,
            upvotes: true,
            views: true,
          },
        },
      },
    });

    if (!discussion) throw new NotFoundException('Discussion not found');

    return {
      success: true,
      data: {
        id: discussion.id,
        question: discussion.question,
        content: discussion.content ? discussion.content.slice(0, 300) : null,
        context: discussion.context ? discussion.context.slice(0, 200) : null,
        tags: discussion.tags,
        type: discussion.type,
        author: {
          id: discussion.author.id,
          firstName: discussion.author.firstName,
          lastName: discussion.author.lastName,
          avatarId: discussion.author.avatarId,
        },
        stats: {
          answers: discussion._count.answers,
          upvotes: discussion._count.upvotes,
          views: discussion._count.views,
        },
        createdAt: discussion.createdAt.toISOString(),
        updatedAt: discussion.updatedAt.toISOString(),
      },
    };
  }

  @Get('spot/:id/similar')
  async getSimilarSpots(@Param('id') id: string) {
    const spot = await this.prisma.spot.findUnique({
      where: { id },
      select: {
        id: true,
        spot: true,
        incubator: { select: { expertiseDomains: true } },
        accelerator: { select: { expertiseDomains: true } },
        event: { select: { expertiseDomains: true } },
        contest: { select: { expertiseDomains: true } },
      },
    });

    if (!spot) throw new NotFoundException('Spot not found');

    const domains: string[] =
      spot.incubator?.expertiseDomains ??
      spot.accelerator?.expertiseDomains ??
      spot.event?.expertiseDomains ??
      spot.contest?.expertiseDomains ??
      [];

    const similar = await this.prisma.spot.findMany({
      where: {
        id: { not: id },
        OR: [
          { spot: spot.spot },
          ...(domains.length > 0
            ? [
                {
                  incubator: { expertiseDomains: { hasSome: domains as any } },
                },
                {
                  accelerator: {
                    expertiseDomains: { hasSome: domains as any },
                  },
                },
                { event: { expertiseDomains: { hasSome: domains as any } } },
                { contest: { expertiseDomains: { hasSome: domains as any } } },
              ]
            : []),
        ],
      },
      select: {
        id: true,
        name: true,
        spot: true,
        highlight: true,
        address: true,
        image: true,
        provider: true,
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, data: similar };
  }

  @Get('spot/:id')
  async getSpotPublic(@Param('id') id: string) {
    const spot = await this.prisma.spot.findUnique({
      where: { id },
      include: {
        event: { include: { prices: { include: { plan: true } } } },
        accelerator: { include: { prices: { include: { plan: true } } } },
        incubator: { include: { prices: { include: { plan: true } } } },
        contest: { include: { prices: { include: { plan: true } } } },
        coworkingSpace: {
          include: {
            prices: { include: { plan: true } },
            openingHours: true,
          },
        },
      },
    });

    if (!spot) throw new NotFoundException('Spot not found');

    const formatPrices = (prices: any[]) =>
      prices?.map((p) => ({
        name: p.plan.name,
        price: p.plan.price,
        currency: p.plan.currency,
        fee: p.plan.fee,
        periodicity: p.periodicity ?? null,
      })) ?? [];

    const base = {
      id: spot.id,
      name: spot.name,
      description: spot.description,
      highlight: spot.highlight,
      spot: spot.spot,
      address: spot.address,
      image: spot.image,
      url: spot.url,
      location: spot.location,
      provider: spot.provider,
    };

    if (spot.event) {
      return {
        success: true,
        data: {
          ...base,
          event: {
            beginDate: spot.event.beginDate.toISOString(),
            endDate: spot.event.endDate.toISOString(),
            attendees: spot.event.attendees,
            format: spot.event.format,
            expertiseDomains: spot.event.expertiseDomains,
            days: spot.event.days,
            prices: formatPrices(spot.event.prices),
          },
        },
      };
    }

    if (spot.contest) {
      return {
        success: true,
        data: {
          ...base,
          contest: {
            beginDate: spot.contest.beginDate.toISOString(),
            endDate: spot.contest.endDate.toISOString(),
            expertiseDomains: spot.contest.expertiseDomains,
            prizeType: spot.contest.prizeType,
            prizeAmount: spot.contest.prizeAmount,
            eligibility: spot.contest.eligibility,
            prices: formatPrices(spot.contest.prices),
          },
        },
      };
    }

    if (spot.incubator) {
      return {
        success: true,
        data: {
          ...base,
          incubator: {
            expertiseDomains: spot.incubator.expertiseDomains,
            hiringPeriod: spot.incubator.hiringPeriod,
            dates: spot.incubator.dates,
            fundingModel: spot.incubator.fundingModel,
            equityPercentage: spot.incubator.equityPercentage,
            investmentAmount: spot.incubator.investmentAmount,
            stage: spot.incubator.stage,
            capacity: spot.incubator.capacity,
            programDuration: spot.incubator.programDuration,
            prices: formatPrices(spot.incubator.prices),
          },
        },
      };
    }

    if (spot.accelerator) {
      return {
        success: true,
        data: {
          ...base,
          accelerator: {
            expertiseDomains: spot.accelerator.expertiseDomains,
            hiringPeriod: spot.accelerator.hiringPeriod,
            date: spot.accelerator.date?.toISOString() ?? null,
            fundingModel: spot.accelerator.fundingModel,
            equityPercentage: spot.accelerator.equityPercentage,
            investmentAmount: spot.accelerator.investmentAmount,
            stage: spot.accelerator.stage,
            capacity: spot.accelerator.capacity,
            programDuration: spot.accelerator.programDuration,
            prices: formatPrices(spot.accelerator.prices),
          },
        },
      };
    }

    if (spot.coworkingSpace) {
      return {
        success: true,
        data: {
          ...base,
          coworkingSpace: {
            openingHours: spot.coworkingSpace.openingHours
              ? {
                  begin: spot.coworkingSpace.openingHours.begin,
                  end: spot.coworkingSpace.openingHours.end,
                }
              : null,
            prices: formatPrices(spot.coworkingSpace.prices),
          },
        },
      };
    }

    return { success: true, data: base };
  }

  @Get('post/:id')
  async getPostPublic(@Param('id') id: string) {
    const post = await this.prisma.post.findUnique({
      where: { id, isHidden: false },
      select: {
        id: true,
        content: true,
        medias: true,
        tags: true,
        createdAt: true,
        updatedAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarId: true,
            highlight: true,
          },
        },
        _count: {
          select: {
            comments: true,
            reactions: true,
            views: true,
            reposts: true,
          },
        },
      },
    });

    if (!post) throw new NotFoundException('Post not found');

    return {
      success: true,
      data: {
        id: post.id,
        content: post.content ? post.content.slice(0, 300) : null,
        medias: post.medias,
        tags: post.tags,
        author: {
          id: post.author.id,
          firstName: post.author.firstName,
          lastName: post.author.lastName,
          avatarId: post.author.avatarId,
          highlight: post.author.highlight,
        },
        stats: {
          comments: post._count.comments,
          reactions: post._count.reactions,
          views: post._count.views,
          reposts: post._count.reposts,
        },
        createdAt: post.createdAt.toISOString(),
        updatedAt: post.updatedAt.toISOString(),
      },
    };
  }
}
