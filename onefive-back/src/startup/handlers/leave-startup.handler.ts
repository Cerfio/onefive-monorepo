import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { PostHogService } from 'src/posthog/posthog.service';
import { StartupMemberRoleType } from '@prisma/client';

@Injectable()
export class LeaveStartupHandler {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
  }) {
    this.logger.info('Member leaving startup', {
      transactionId,
      userId,
      startupId,
    });

    const member = await this.prisma.startupMember.findFirst({
      where: {
        startupId,
        profile: { userId },
      },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this startup');
    }

    if (member.role === StartupMemberRoleType.SUPER_ADMIN) {
      throw new ForbiddenException(
        'The creator cannot leave the startup. Transfer ownership first.',
      );
    }

    await this.prisma.startupMember.delete({
      where: { id: member.id },
    });

    await this.prisma.startup.update({
      where: { id: startupId },
      data: { updatedAt: new Date() },
    });

    this.posthogService.capture(userId, 'startup_member_left', {
      startup_id: startupId,
    });

    return { status: 'LEFT', memberId: member.id };
  }
}
