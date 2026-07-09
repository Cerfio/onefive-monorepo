import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { FileUrlUtils } from '../../common/utils';
import { Log } from '../../common/logger/logger.decorator';

/**
 * Publications de l'équipe d'une startup : Post n'a pas de startupId, on agrège
 * les posts publiés par les profils membres (même logique que le compteur
 * stats.posts de get-startup). Sert la section « Publications » du profil
 * startup (item roadmap : brancher le TODO posts de StartupFullView).
 */
@Injectable()
export class GetStartupPostsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async execute({
    transactionId,
    startupId,
    limit = 10,
  }: {
    transactionId: string;
    startupId: string;
    limit?: number;
  }) {
    const members = await this.prisma.startupMember.findMany({
      where: { startupId },
      select: { profileId: true },
    });
    const memberProfileIds = members.map((m) => m.profileId);
    if (memberProfileIds.length === 0) {
      return [];
    }

    const take = Math.max(1, Math.min(limit, 30));
    const posts = await this.prisma.post.findMany({
      where: { profileId: { in: memberProfileIds }, isHidden: false },
      orderBy: { createdAt: 'desc' },
      take,
      select: {
        id: true,
        content: true,
        medias: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: { select: { id: true } },
          },
        },
        _count: { select: { reactions: true, comments: true, views: true } },
      },
    });

    const formatted = await Promise.all(
      posts.map(async (post) => ({
        id: post.id,
        content: post.content,
        createdAt: post.createdAt,
        mediasCount: Array.isArray(post.medias) ? post.medias.length : 0,
        author: {
          id: post.author.id,
          name: `${post.author.firstName} ${post.author.lastName}`,
          avatar: post.author.avatar?.id
            ? await this.fileUrlUtils.getFileUrl(
                post.author.avatar.id,
                this.storageService,
              )
            : null,
        },
        reactionsCount: post._count.reactions,
        commentsCount: post._count.comments,
        viewsCount: post._count.views,
      })),
    );

    this.logger.info('Startup posts retrieved', {
      transactionId,
      startupId,
      count: formatted.length,
    });

    return formatted;
  }
}
