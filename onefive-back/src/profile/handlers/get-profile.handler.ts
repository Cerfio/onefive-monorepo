import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { ProfileService } from '../profile.service';
import { StreakService } from '../../streak/streak.service';
import { LogService } from 'logstash-winston-3';
import { FileUrlUtils } from '../../common/utils';
import { StorageService } from '../../storage/storage.service';
import { ProfileRelationshipsService } from '../../profile-relationships/profile-relationships.service';
import { FollowsService } from '../../follows/follows.service';
import { NotificationHelperService } from '../../notification/notification-helper.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class GetProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileService: ProfileService,
    private readonly streakService: StreakService,
    private readonly storageService: StorageService,
    private readonly profileRelationshipsService: ProfileRelationshipsService,
    private readonly followsService: FollowsService,
    private readonly notificationHelperService: NotificationHelperService,
    private readonly prisma: PrismaService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async execute({
    transactionId,
    userId: _userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    const where =
      profileId === 'current_user' ? { userId: _userId } : { id: profileId };

    const profile = await this.profileService.get({
      transactionId,
      where,
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
        cover: {
          select: {
            id: true,
          },
        },
        bio: true,
        skills: true,
        intentions: true,
        city: true,
        countryCode: true,
        ecosystemRoles: true,
        genderSalutationPreferenceType: true,
        createdAt: true,
        experiences: true,
        educations: true,
        achievements: true,
        socials: true,
        tagFollowing: {
          select: {
            name: true,
          },
        },
        _count: {
          select: {
            posts: true,
            followedBy: true,
            following: true,
          },
        },
      },
    });
    if (!profile) return null;

    const streak = await this.streakService.getCurrentStreak({
      transactionId,
      userId: profile.userId,
    });

    const relationships =
      await this.profileRelationshipsService.getUserRelationships({
        transactionId,
        userId: profile.userId,
      });

    // Vérifier si l'utilisateur connecté suit ce profil
    this.logger.info('Checking follow status', {
      transactionId,
      userId: _userId,
      profileId,
      profileUserId: profile.userId,
    });

    const isFollowing = await this.followsService.isFollowingProfile({
      transactionId,
      userId: _userId,
      profileId: profile.id,
    });

    this.logger.info('Follow status result', {
      transactionId,
      userId: _userId,
      profileId,
      isFollowing,
    });

    // Envoyer une notification de vue de profil et enregistrer la vue (en arrière-plan, sans bloquer la réponse)
    if (_userId && profile.userId !== _userId) {
      // Récupérer le profil du viewer pour avoir son nom
      this.profileService
        .get({
          transactionId,
          where: { userId: _userId },
          select: { id: true, firstName: true, lastName: true },
        })
        .then(async (viewerProfile) => {
          if (viewerProfile) {
            // Vérifier si une vue existe déjà récemment (dernières 24h) pour éviter les doublons
            try {
              const recentView = await this.prisma.profileView.findFirst({
                where: {
                  viewerId: viewerProfile.id,
                  viewedById: profile.id,
                  createdAt: {
                    gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 heures
                  },
                },
              });

              if (!recentView) {
                // Créer une nouvelle vue de profil
                await this.prisma.profileView.create({
                  data: {
                    viewerId: viewerProfile.id,
                    viewedById: profile.id,
                  },
                });
              }
            } catch (error) {
              this.logger.error('Failed to create profile view', {
                transactionId,
                error,
              });
            }

            // Envoyer la notification
            const viewerName = `${viewerProfile.firstName} ${viewerProfile.lastName}`;
            this.notificationHelperService
              .notifyProfileView({
                viewedProfileId: profile.id,
                viewerProfileId: viewerProfile.id,
                viewerName,
              })
              .catch((error) => {
                this.logger.error(
                  'Failed to create profile view notification',
                  {
                    transactionId,
                    error,
                  },
                );
              });
          }
        })
        .catch((error) => {
          this.logger.error('Failed to get viewer profile for notification', {
            transactionId,
            error,
          });
        });
    }

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: profile.avatar?.id
        ? await this.fileUrlUtils.getFileUrl(
            profile.avatar.id,
            this.storageService,
          )
        : undefined,
      bio: profile.bio ?? undefined,
      skills: profile.skills ?? [],
      city: profile.city,
      countryCode: profile.countryCode,
      createdAt: profile.createdAt,
      ecosystemRoles: profile.ecosystemRoles ?? [],
      intentions: profile.intentions ?? [],
      genderSalutationPreferenceType: profile.genderSalutationPreferenceType,
      stats: {
        posts: profile._count?.posts ?? 0,
        followers: profile._count?.followedBy ?? 0,
        following: profile._count?.following ?? 0,
        connections: relationships?.connected.length ?? 0,
        streak,
      },
      isFollowing,
      experiences: profile.experiences ?? [],
      educations: profile.educations ?? [],
      socials: profile.socials ?? [],
      achievements: profile.achievements ?? [],
      highlight: undefined,
      coverImage: profile.cover?.id
        ? await this.fileUrlUtils.getFileUrl(
            profile.cover.id,
            this.storageService,
          )
        : undefined,
      interests: profile.tagFollowing?.map((t) => t.name) ?? [],
    };
  }
}
