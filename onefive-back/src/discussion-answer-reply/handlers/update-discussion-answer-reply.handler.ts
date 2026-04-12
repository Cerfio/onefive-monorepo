import { Log } from '../../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import {
  Inject,
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class UpdateDiscussionAnswerReplyHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    replyId,
    content,
  }: {
    transactionId: string;
    userId: string;
    replyId: string;
    content: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    const existingReply = await this.prisma.discussionAnswerReply.findUnique({
      where: { id: replyId },
    });

    if (!existingReply) {
      throw new NotFoundException('Reply not found');
    }

    if (existingReply.profileId !== profile.id) {
      throw new ForbiddenException('You are not allowed to update this reply');
    }

    const reply = await this.prisma.discussionAnswerReply.update({
      where: { id: replyId },
      data: { content },
    });

    return reply;
  }
}
