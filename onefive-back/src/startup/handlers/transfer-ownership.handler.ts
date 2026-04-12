import {
  Injectable,
  Inject,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { PrismaService } from '../../prisma/prisma.service';
import { PostHogService } from 'src/posthog/posthog.service';
import { StartupMemberRoleType, NotificationType, NotificationCategory } from '@prisma/client';
import { NotificationService } from '../../notification/notification.service';

@Injectable()
export class TransferOwnershipHandler {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly notificationService: NotificationService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
    newOwnerMemberId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    newOwnerMemberId: string;
  }) {
    this.logger.info('Transferring startup ownership', {
      transactionId,
      userId,
      startupId,
      newOwnerMemberId,
    });

    const currentOwner = await this.prisma.startupMember.findFirst({
      where: {
        startupId,
        profile: { userId },
      },
      include: { profile: true },
    });

    if (
      !currentOwner ||
      currentOwner.role !== StartupMemberRoleType.SUPER_ADMIN
    ) {
      throw new ForbiddenException('Only the creator can transfer ownership');
    }

    const newOwner = await this.prisma.startupMember.findFirst({
      where: {
        startupId,
        OR: [{ id: newOwnerMemberId }, { profileId: newOwnerMemberId }],
      },
      include: { profile: true },
    });

    if (!newOwner) {
      throw new NotFoundException('Target member not found in this startup');
    }

    if (newOwner.id === currentOwner.id) {
      throw new ForbiddenException('Cannot transfer ownership to yourself');
    }

    await this.prisma.$transaction([
      this.prisma.startupMember.update({
        where: { id: currentOwner.id },
        data: { role: StartupMemberRoleType.ADMIN },
      }),
      this.prisma.startupMember.update({
        where: { id: newOwner.id },
        data: { role: StartupMemberRoleType.SUPER_ADMIN },
      }),
    ]);

    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
    });

    await this.notificationService.create({
      profileId: newOwner.profileId,
      type: 'STARTUP_UPDATE' as NotificationType,
      category: NotificationCategory.SYSTEM,
      title: 'You are now the creator of a startup',
      message: `${currentOwner.profile.firstName} ${currentOwner.profile.lastName} transferred ownership of ${startup.name} to you.`,
      actorId: currentOwner.profileId,
      entityId: startupId,
      entityType: 'STARTUP',
      data: { startupId },
    });

    this.posthogService.capture(userId, 'startup_ownership_transferred', {
      startup_id: startupId,
      new_owner_profile_id: newOwner.profileId,
    });

    return { status: 'TRANSFERRED' };
  }
}
