import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { FileUrlUtils } from '../../common/utils';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetStartupMembersHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async execute({
    transactionId,
    startupId,
  }: {
    transactionId: string;
    startupId: string;
  }) {
    this.logger.info('Getting startup members', {
      transactionId,
      startupId,
    });

    // Récupérer tous les membres de la startup
    const members = await this.prisma.startupMember.findMany({
      where: { startupId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        profileId: true,
        position: true,
        role: true,
        equity: true,
        isFounder: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            linkedinUrl: true,
            avatar: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    // Formater les membres
    const formattedMembers = await Promise.all(
      members.map(async (member) => ({
        id: member.id,
        profileId: member.profile.id,
        name: `${member.profile.firstName} ${member.profile.lastName}`,
        firstName: member.profile.firstName,
        lastName: member.profile.lastName,
        position: member.position,
        role: member.role,
        equity: member.equity,
        isFounder: member.isFounder,
        avatar: member.profile.avatar?.id
          ? await this.fileUrlUtils.getFileUrl(
              member.profile.avatar.id,
              this.storageService,
            )
          : null,
        linkedinUrl: member.profile.linkedinUrl || null,
      })),
    );

    this.logger.info('Startup members retrieved successfully', {
      transactionId,
      startupId,
      count: formattedMembers.length,
    });

    return formattedMembers;
  }
}
