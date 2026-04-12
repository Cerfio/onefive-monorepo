import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class CreateDiscussionAnswerReplyHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    answerId,
    content,
  }: {
    transactionId: string;
    userId: string;
    answerId: string;
    content: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const reply = await this.prisma.discussionAnswerReply.create({
      data: {
        content,
        author: {
          connect: {
            id: profile.id,
          },
        },
        answer: {
          connect: {
            id: answerId,
          },
        },
      },
    });

    return reply;
  }
}
