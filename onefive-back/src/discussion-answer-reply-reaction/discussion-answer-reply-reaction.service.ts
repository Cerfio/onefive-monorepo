import { Inject, Injectable } from '@nestjs/common';
import { DiscussionAnswerReplyReaction, ReactionType } from '@prisma/client';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';

@Injectable()
export class DiscussionAnswerReplyReactionService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transactionId,
    profileId,
    replyId,
    reaction,
  }: {
    transactionId: string;
    profileId: string;
    replyId: string;
    reaction: ReactionType;
  }): Promise<DiscussionAnswerReplyReaction | { deleted: boolean }> {
    // Vérifier si la même réaction existe déjà (toggle)
    const existing = await this.prisma.discussionAnswerReplyReaction.findFirst({
      where: {
        profileId,
        replyId,
        reaction,
      },
    });

    if (existing) {
      // Si la réaction existe déjà, on la supprime (toggle)
      await this.prisma.discussionAnswerReplyReaction.delete({
        where: { id: existing.id },
      });
      return { deleted: true };
    }

    // Créer la nouvelle réaction
    return await this.prisma.discussionAnswerReplyReaction.create({
      data: {
        reaction,
        profile: {
          connect: { id: profileId },
        },
        reply: {
          connect: { id: replyId },
        },
      },
    });
  }

  @Log()
  async delete({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transactionId,
    profileId,
    replyId,
    reaction,
  }: {
    transactionId: string;
    profileId: string;
    replyId: string;
    reaction: ReactionType;
  }): Promise<{ deleted: boolean }> {
    const result = await this.prisma.discussionAnswerReplyReaction.deleteMany({
      where: {
        profileId,
        replyId,
        reaction,
      },
    });

    return { deleted: result.count > 0 };
  }
}
