import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ListPostCommentReactionsHandler {
  constructor(private readonly prisma: PrismaService) {}

  @Log()
  async execute({
    transactionId,
    commentId,
    skip,
    take,
  }: {
    transactionId: string;
    commentId: string;
    skip?: number;
    take?: number;
  }) {
    const reactions = await this.prisma.postCommentReaction.findMany({
      where: { commentId },
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        reaction: true,
        profileId: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return reactions.map((r) => ({
      id: r.id,
      reaction: r.reaction,
      profileId: r.profileId,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      profile: {
        id: r.profile?.id,
        name: `${r.profile?.firstName ?? ''} ${r.profile?.lastName ?? ''}`.trim(),
      },
    }));
  }
}
