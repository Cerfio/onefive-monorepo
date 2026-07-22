import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { StartupNotFoundException } from '../startup.exception';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { FileUrlUtils } from '../../common/utils';

@Injectable()
export class GetStartupHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

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
    this.logger.info('Getting startup', {
      transactionId,
      userId,
      startupId,
    });

    // Récupérer le profileId depuis le userId
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    const profileId = profile?.id;

    // Récupérer la startup avec toutes les informations nécessaires
    const startup = (await this.startupService.get({
      transactionId,
      where: { id: startupId },
      select: {
        id: true,
        name: true,
        tagline: true,
        description: true,
        logo: true,
        coverImage: true,
        website: true,
        linkedin: true,
        foundedDate: true,
        categories: true,
        technologies: true,
        achievements: true,
        countryCode: true,
        city: true,
        createdAt: true,
        members: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            position: true,
            role: true,
            equity: true,
            isFounder: true,
            profile: {
              select: {
                id: true,
                userId: true,
                firstName: true,
                lastName: true,
                avatar: {
                  select: {
                    id: true,
                  },
                },
              },
            },
          },
        },
        _count: {
          select: {
            followedBy: true,
            views: true,
          },
        },
      },
    })) as any;

    if (!startup) {
      StartupNotFoundException.throw(this.logger, {
        transactionId,
        startupId,
      });
    }

    // Vérifier si l'utilisateur est membre et son rôle
    let isMember = false;
    let userRole: string | undefined;
    let canEdit = false;

    let currentProfileId: string | undefined;

    if (profileId) {
      const member = startup.members.find((m) => m.profile.userId === userId);
      if (member) {
        isMember = true;
        userRole = member.role;
        canEdit = member.role === 'SUPER_ADMIN' || member.role === 'ADMIN';
        currentProfileId = member.profile.id;
      }
    }

    // L'utilisateur courant suit-il cette startup ? (état initial du bouton "Suivre")
    let isFollowing = false;
    if (profileId) {
      const follow = await this.prisma.startupFollow.findUnique({
        where: { profileId_startupId: { profileId, startupId } },
        select: { profileId: true },
      });
      isFollowing = !!follow;
    }

    const founders = await Promise.all(
      startup.members
        .filter((m) => m.isFounder)
        .map(async (member) => ({
          id: member.profile.id,
          memberId: member.id,
          name: `${member.profile.firstName} ${member.profile.lastName}`,
          avatar: member.profile.avatar?.id
            ? await this.fileUrlUtils.getFileUrl(
                member.profile.avatar.id,
                this.storageService,
              )
            : null,
          position: member.position,
          capitalStock: member.equity > 0 ? member.equity : null,
          ...(isMember ? { role: member.role } : {}),
        })),
    );

    const teamMembers = await Promise.all(
      startup.members
        .filter((m) => !m.isFounder)
        .map(async (member) => ({
          id: member.profile.id,
          memberId: member.id,
          name: `${member.profile.firstName} ${member.profile.lastName}`,
          avatar: member.profile.avatar?.id
            ? await this.fileUrlUtils.getFileUrl(
                member.profile.avatar.id,
                this.storageService,
              )
            : null,
          position: member.position,
          ...(isMember ? { role: member.role } : {}),
        })),
    );

    // Nombre de posts de la startup = posts publiés par ses membres (Post n'a
    // pas de startupId ; on agrège via les profils membres).
    const memberProfileIds = startup.members.map((m) => m.profile.id);
    const postsCount =
      memberProfileIds.length > 0
        ? await this.prisma.post.count({
            where: { profileId: { in: memberProfileIds }, isHidden: false },
          })
        : 0;

    // Construire la réponse
    const result: any = {
      id: startup.id,
      name: startup.name,
      tagline: startup.tagline || null,
      description: startup.description || null,
      logo: startup.logo || null,
      coverImage: startup.coverImage || null,
      website: startup.website || null,
      linkedin: startup.linkedin || null,
      foundedDate: startup.foundedDate
        ? startup.foundedDate.toISOString()
        : null,
      categories: startup.categories || [],
      technologies: startup.technologies || [],
      achievements: Array.isArray(startup.achievements)
        ? startup.achievements
        : [],
      countryCode: startup.countryCode,
      city: startup.city,
      location: `${startup.city}, ${startup.countryCode}`,
      createdAt: startup.createdAt.toISOString(),
      founders,
      teamMembers,
      stats: {
        followers: startup._count.followedBy,
        members: startup.members.length,
        posts: postsCount,
      },
      isMember,
      canEdit,
      isFollowing,
    };

    // Ajouter les données supplémentaires pour les membres/admins
    if (isMember) {
      result.role = userRole;
      result.currentProfileId = currentProfileId;
      if (canEdit) {
        result.stats.views = startup._count.views;
      }
    }

    this.logger.info('Startup retrieved successfully', {
      transactionId,
      startupId,
      isMember,
      canEdit,
    });

    return result;
  }
}
