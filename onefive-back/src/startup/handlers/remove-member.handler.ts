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
export class RemoveMemberHandler {
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
    memberId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    memberId: string;
  }) {
    this.logger.info('Removing startup member', {
      transactionId,
      userId,
      startupId,
      memberId,
    });

    const currentUserMember = await this.prisma.startupMember.findFirst({
      where: {
        startupId,
        profile: { userId },
      },
    });

    if (
      !currentUserMember ||
      (currentUserMember.role !== StartupMemberRoleType.SUPER_ADMIN &&
        currentUserMember.role !== StartupMemberRoleType.ADMIN)
    ) {
      throw new ForbiddenException('Only admins can remove members');
    }

    // Accept either the StartupMember.id or the Profile.id as identifier
    const member = await this.prisma.startupMember.findFirst({
      where: {
        startupId,
        OR: [{ id: memberId }, { profileId: memberId }],
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found in this startup');
    }

    if (member.role === StartupMemberRoleType.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Cannot remove the creator. Transfer ownership first.',
      );
    }

    if (
      member.role === StartupMemberRoleType.ADMIN &&
      currentUserMember.role !== StartupMemberRoleType.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        "Only the creator can remove an admin",
      );
    }

    await this.prisma.startupMember.delete({
      where: { id: member.id },
    });

    await this.prisma.startup.update({
      where: { id: startupId },
      data: { updatedAt: new Date() },
    });

    this.posthogService.capture(userId, 'startup_member_removed', {
      startup_id: startupId,
      removed_profile_id: member.profileId,
    });

    return { status: 'REMOVED', memberId };
  }
}
