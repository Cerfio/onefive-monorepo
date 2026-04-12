import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { StartupMemberRoleType } from '@prisma/client';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class DeleteStartupHandler {
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
    this.logger.info('Deleting startup', {
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

    if (!member || member.role !== StartupMemberRoleType.SUPER_ADMIN) {
      throw new ForbiddenException('Only the creator can delete the startup');
    }

    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
    });

    if (!startup) {
      throw new NotFoundException('Startup not found');
    }

    await this.prisma.startup.delete({
      where: { id: startupId },
    });

    this.posthogService.capture(userId, 'startup_deleted', {
      startup_id: startupId,
    });

    return { status: 'DELETED', startupId };
  }
}
