import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { DataroomService } from '../services/dataroom.service';
import { MemberService } from '../services/member.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  CreateDataroomDto,
  CreateDataroomResponseDto,
} from '../dto/create-dataroom.dto';
import {
  GetDataroomDto,
  GetDataroomResponseDto,
} from '../dto/get-dataroom.dto';
import {
  DeleteDataroomDto,
  DeleteDataroomResponseDto,
} from '../dto/delete-dataroom.dto';
import {
  ListDataroomDto,
  ListDataroomResponseDto,
} from '../dto/list-dataroom.dto';
import { AccessAction, GroupType } from '@prisma/client';
import { DataroomNotFoundException } from '../exceptions/dataroom.exception';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class DataroomHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly dataroomService: DataroomService,
    private readonly memberService: MemberService,
    private readonly prisma: PrismaService,
    private readonly posthogService: PostHogService,
  ) {}

  async create(input: CreateDataroomDto): Promise<CreateDataroomResponseDto> {
    const result = await this.prisma.$transaction(async (tx) => {
      const dataroom = await tx.dataroom.create({
        data: {
          startupId: input.startupId,
          createdBy: input.createdBy,
          groups: {
            create: [
              {
                name: 'Founder',
                type: GroupType.DEFAULT,
                createdBy: input.createdBy,
                canManageGroups: true,
                canManageUsers: true,
                canUpload: true,
                canShare: true,
                hasAllAccess: true,
              },
              {
                name: 'Investor',
                type: GroupType.DEFAULT,
                createdBy: input.createdBy,
                canManageGroups: false,
                canManageUsers: false,
                canUpload: false,
                canShare: false,
                hasAllAccess: false,
              },
              {
                name: 'Team',
                type: GroupType.DEFAULT,
                createdBy: input.createdBy,
                canManageGroups: false,
                canManageUsers: false,
                canUpload: false,
                canShare: false,
                hasAllAccess: false,
              },
              {
                name: 'Mentor',
                type: GroupType.DEFAULT,
                createdBy: input.createdBy,
                canManageGroups: false,
                canManageUsers: false,
                canUpload: false,
                canShare: false,
                hasAllAccess: false,
              },
              {
                name: 'Guest',
                type: GroupType.DEFAULT,
                createdBy: input.createdBy,
                canManageGroups: false,
                canManageUsers: false,
                canUpload: false,
                canShare: false,
                hasAllAccess: false,
              },
            ],
          },
          categories: {
            create: [
              {
                name: 'Company',
                createdBy: input.createdBy,
              },
              {
                name: 'Financials',
                createdBy: input.createdBy,
              },
              {
                name: 'Legal',
                createdBy: input.createdBy,
              },
              {
                name: 'Product',
                createdBy: input.createdBy,
              },
              {
                name: 'Market',
                createdBy: input.createdBy,
              },
              {
                name: 'Team',
                createdBy: input.createdBy,
              },
              {
                name: 'Pitch Deck',
                createdBy: input.createdBy,
              },
              {
                name: 'Investor Relations',
                createdBy: input.createdBy,
              },
              {
                name: 'Fundraising',
                createdBy: input.createdBy,
              },
              {
                name: 'Miscellaneous',
                createdBy: input.createdBy,
              },
            ],
          },
        },
        include: {
          groups: true,
        },
      });

      await tx.member.create({
        data: {
          profileId: input.createdBy,
          dataroom: {
            connect: {
              id: dataroom.id,
            },
          },
          group: {
            connect: {
              id: dataroom.groups.find((group) => group.name === 'Founder').id,
            },
          },
        },
      });

      return {
        data: {
          id: dataroom.id,
        },
      };
    });

    this.posthogService.capture(input.createdBy, 'dataroom_created', {
      dataroom_id: result.data.id,
      startup_id: input.startupId,
    });

    return result;
  }

  async get(input: GetDataroomDto): Promise<GetDataroomResponseDto> {
    const dataroom = await this.dataroomService.get({
      transactionId: input.transactionId,
      where: {
        id: input.dataroomId,
      },
      select: {
        startupId: true,
        startup: {
          select: {
            name: true,
            logo: true,
          },
        },
        accessLogs: {
          where: {
            action: AccessAction.VIEW,
          },
          select: {
            profileId: true,
          },
        },
        groups: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                members: true,
              },
            },
            invitations: {
              select: {
                id: true,
                status: true,
                createdAt: true,
                existingUserInvitation: {
                  select: {
                    profileId: true,
                  },
                },
                newUserInvitation: {
                  select: {
                    email: true,
                    firstname: true,
                    lastname: true,
                  },
                },
              },
            },
          },
        },
        categories: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                files: true,
              },
            },
          },
        },
        files: {
          select: {
            createdAt: true,
            category: {
              select: {
                name: true,
              },
            },
            name: true,
            size: true,
            id: true,
            storageId: true,
            mimetype: true,
            uploadedBy: true,
            _count: {
              select: {
                accessLogs: {
                  where: {
                    action: AccessAction.VIEW,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            files: true,
            accessLogs: true,
          },
        },
      },
    });

    if (!dataroom) {
      DataroomNotFoundException.throw(this.logger, {
        transactionId: input.transactionId,
      });
    }

    // Enrichir avec les statistiques de tracking réelles
    const enrichedDataroom = await this.dataroomService.enrichWithTrackingStats(
      input.dataroomId,
      input.profileId,
      dataroom,
    );

    // Debug logs
    this.logger.info('Dataroom enriched with tracking stats', {
      transactionId: input.transactionId,
      dataroomId: input.dataroomId,
      totalViews: enrichedDataroom.totalViews,
      uniqueViewers: enrichedDataroom.uniqueViewers,
      avgSessionDuration: enrichedDataroom.avgSessionDuration,
    });

    const fileCount = dataroom._count.files;
    const activityTimeline = dataroom.files.sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );

    this.logger.debug('Average session duration', {
      transactionId: input.transactionId,
      avgSessionDuration: enrichedDataroom.avgSessionDuration,
    });
    return {
      data: {
        startupId: dataroom.startupId,
        name: dataroom.startup?.name,
        logo: dataroom.startup?.logo,
        // Utiliser totalViews comme viewCount pour compatibilité
        viewCount:
          Number(enrichedDataroom.totalViews) || dataroom._count.accessLogs,
        documentCount: fileCount,
        lastActivity:
          activityTimeline.length > 0
            ? activityTimeline[0].createdAt.toISOString()
            : null,
        // Nouvelles statistiques de tracking (garanties)
        totalViews:
          Number(enrichedDataroom.totalViews) || dataroom._count.accessLogs,
        uniqueViewers: Number(enrichedDataroom.uniqueViewers) || 0,
        avgSessionDuration: Number(enrichedDataroom.avgSessionDuration) || 0,
        categories: dataroom.categories.map((category) => ({
          name: category.name,
          fileCount: category._count.files,
          id: category.id,
        })),
        groups: dataroom.groups.map((group) => ({
          id: group.id,
          name: group.name,
          memberCount: group._count.members,
          invitations:
            (
              group as unknown as {
                invitations: Array<{
                  id: string;
                  status: string;
                  createdAt: Date;
                  existingUserInvitation?: { profileId: string };
                  newUserInvitation?: {
                    email: string;
                    firstname: string;
                    lastname: string;
                  };
                }>;
              }
            ).invitations?.map((invitation) => ({
              id: invitation.id,
              email: invitation.newUserInvitation?.email || '',
              name: invitation.newUserInvitation
                ? `${invitation.newUserInvitation.firstname} ${invitation.newUserInvitation.lastname}`
                : invitation.existingUserInvitation?.profileId || '',
              status: invitation.status,
              invitedAt: invitation.createdAt.toISOString(),
            })) || [],
        })),
        files: dataroom.files.map((file) => ({
          storageId: file.storageId,
          category: file.category.name,
          viewCount: file._count.accessLogs,
          size: file.size,
          name: file.name,
          id: file.id,
          mimetype: file.mimetype,
          uploadedBy: file.uploadedBy,
          createdAt: file.createdAt.toISOString(),
        })),
      },
    };
  }

  async delete(
    input: DeleteDataroomDto & { profileId?: string },
  ): Promise<DeleteDataroomResponseDto> {
    await this.dataroomService.delete({
      transactionId: input.transactionId,
      dataroomId: input.dataroomId,
    });

    if (input.profileId) {
      this.posthogService.capture(input.profileId, 'dataroom_deleted', {
        dataroom_id: input.dataroomId,
      });
    }

    return {
      data: {
        success: true,
      },
    };
  }

  async list(input: ListDataroomDto): Promise<ListDataroomResponseDto> {
    const skip = input.skip ?? 0;
    const take = input.take ?? 20;
    const orderBy =
      input.orderBy === 'createdAt_asc'
        ? { createdAt: 'asc' as const }
        : { createdAt: 'desc' as const };

    const datarooms = await this.dataroomService.list({
      transactionId: input.transactionId,
      profileId: input.profileId,
      skip,
      take,
      orderBy,
    });

    const total = await this.dataroomService.count({
      transactionId: input.transactionId,
      profileId: input.profileId,
    });

    const items = datarooms.map((dataroom) => ({
      id: dataroom.id,
      startupId: dataroom.startupId,
      name: dataroom.startup?.name,
      logo: dataroom.startup?.logo,
      documentCount: dataroom._count.files,
      memberCount: dataroom._count.members,
      viewCount: dataroom._count.accessLogs,
      lastActivity:
        dataroom.files.length > 0
          ? dataroom.files[0].createdAt.toISOString()
          : dataroom.createdAt.toISOString(),
      isOwner: dataroom.groups.length > 0,
      notificationCount: 0,
      createdAt: dataroom.createdAt.toISOString(),
      updatedAt: dataroom.updatedAt.toISOString(),
    }));

    const page = Math.floor(skip / take) + 1;
    const hasMore = skip + take < total;

    return {
      data: {
        items,
        total,
        page,
        pageSize: take,
        hasMore,
      },
    };
  }
}
