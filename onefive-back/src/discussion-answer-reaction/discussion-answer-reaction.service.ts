import { Inject, Injectable } from '@nestjs/common';
import { DiscussionAnswerReaction, ReactionType } from '@prisma/client';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../prisma/prisma.service';
import { Log } from '../common/logger/logger.decorator';

@Injectable()
export class DiscussionAnswerReactionService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async create({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transactionId,
    profileId,
    answerId,
    reaction,
  }: {
    transactionId: string;
    profileId: string;
    answerId: string;
    reaction: ReactionType;
  }): Promise<DiscussionAnswerReaction | { deleted: boolean }> {
    // Vérifier si la même réaction existe déjà (toggle)
    const existing = await this.prisma.discussionAnswerReaction.findFirst({
      where: {
        profileId,
        answerId,
        reaction,
      },
    });

    if (existing) {
      // Si la réaction existe déjà, on la supprime (toggle)
      await this.prisma.discussionAnswerReaction.delete({
        where: { id: existing.id },
      });
      return { deleted: true };
    }

    // Créer la nouvelle réaction
    return await this.prisma.discussionAnswerReaction.create({
      data: {
        reaction,
        profile: {
          connect: { id: profileId },
        },
        answer: {
          connect: { id: answerId },
        },
      },
    });
  }

  @Log()
  async delete({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    transactionId,
    profileId,
    answerId,
    reaction,
  }: {
    transactionId: string;
    profileId: string;
    answerId: string;
    reaction: ReactionType;
  }): Promise<{ deleted: boolean }> {
    const result = await this.prisma.discussionAnswerReaction.deleteMany({
      where: {
        profileId,
        answerId,
        reaction,
      },
    });

    return { deleted: result.count > 0 };
  }
}
