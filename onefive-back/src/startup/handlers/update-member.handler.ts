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
import { UpdateMemberDto } from '../dto/update-member.dto';
import { StartupMemberRoleType } from '@prisma/client';

@Injectable()
export class UpdateMemberHandler {
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
    payload,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    memberId: string;
    payload: UpdateMemberDto;
  }) {
    this.logger.info('Updating startup member', {
      transactionId,
      userId,
      startupId,
      memberId,
      payload,
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
      throw new ForbiddenException('Only admins can update members');
    }

    if (payload.role === StartupMemberRoleType.SUPER_ADMIN) {
      throw new ForbiddenException(
        'Cannot promote to creator via this endpoint. Use the transfer ownership endpoint instead.',
      );
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

    // If target is the creator, silently ignore role changes (other fields still update)
    const isTargetCreator = member.role === StartupMemberRoleType.SUPER_ADMIN;
    if (isTargetCreator) {
      delete payload.role;
    }

    if (
      payload.role !== undefined &&
      member.role === StartupMemberRoleType.ADMIN &&
      currentUserMember.role !== StartupMemberRoleType.SUPER_ADMIN
    ) {
      throw new ForbiddenException(
        "Only the creator can change an admin's role",
      );
    }

    if (payload.equity !== undefined) {
      const otherMembers = await this.prisma.startupMember.findMany({
        where: { startupId, id: { not: member.id } },
      });

      const pendingInvitations = await this.prisma.startupInvitation.findMany({
        where: { startupId, status: 'PENDING' },
      });

      const othersEquity = otherMembers.reduce(
        (sum, m) => sum + (m.equity || 0),
        0,
      );
      const pendingEquity = pendingInvitations.reduce(
        (sum, i) => sum + (i.equity || 0),
        0,
      );

      if (othersEquity + pendingEquity + payload.equity > 100) {
        throw new BadRequestException(
          `Total equity cannot exceed 100%. Others: ${othersEquity}%, Pending: ${pendingEquity}%, Requested: ${payload.equity}%, Total: ${othersEquity + pendingEquity + payload.equity}%`,
        );
      }
    }

    const updated = await this.prisma.startupMember.update({
      where: { id: member.id },
      data: {
        ...(payload.position !== undefined && { position: payload.position }),
        ...(payload.role !== undefined && { role: payload.role }),
        ...(payload.equity !== undefined && { equity: payload.equity }),
        ...(payload.isFounder !== undefined && {
          isFounder: payload.isFounder,
        }),
      },
      include: {
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatarId: true,
            userId: true,
          },
        },
      },
    });

    await this.prisma.startup.update({
      where: { id: startupId },
      data: { updatedAt: new Date() },
    });

    this.posthogService.capture(userId, 'startup_member_updated', {
      startup_id: startupId,
    });

    return updated;
  }
}
