import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { ProfileService } from '../profile.service';
import { LogService } from 'logstash-winston-3';
import { StreakService } from '../../streak/streak.service';
import { FileUrlUtils } from '../../common/utils';
import { StorageService } from '../../storage/storage.service';

type SelfProfileHandlerResponse =
  | {
      needsOnboarding: true;
    }
  | {
      id: string;
      userId: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      highlight?: string;
      createdAt: Date;
      streak: number;
      count: {
        followedBy: number;
        following: number;
        posts: number;
      };
    };

@Injectable()
export class SelfProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileService: ProfileService,
    private readonly streakService: StreakService,
    private readonly storageService: StorageService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<SelfProfileHandlerResponse> {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        highlight: true,
        createdAt: true,
        waitlistStatus: true,
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
        _count: {
          select: {
            followedBy: true,
            following: true,
            posts: true,
          },
        },
      },
    });

    if (!profile) {
      return {
        needsOnboarding: true,
      };
    }

    // Récupérer la streak actuelle
    const streak = await this.streakService.getCurrentStreak({
      transactionId,
      userId,
    });

    // Debug des relations File
    this.logger.info('🔍 DEBUG - SelfProfile avatar/cover relations', {
      transactionId,
      userId,
      hasAvatar: !!profile.avatar,
      avatarId: profile.avatar?.id,
      hasCover: !!profile.cover,
      coverId: profile.cover?.id,
      profileAvatarId: (profile as any).avatarId,
      profileCoverId: (profile as any).coverId,
    });

    // Calculer l'URL de l'avatar
    const finalAvatarUrl = profile.avatar?.id
      ? await this.fileUrlUtils.getFileUrl(
          profile.avatar.id,
          this.storageService,
        )
      : undefined;

    this.logger.info('🎯 DEBUG - SelfProfile final avatar URL', {
      transactionId,
      userId,
      finalAvatarUrl,
      hasNewAvatar: !!profile.avatar?.id,
    });

    return {
      id: profile.id,
      userId,
      firstName: profile.firstName,
      lastName: profile.lastName,
      avatar: finalAvatarUrl,
      highlight: (profile as { highlight?: string }).highlight ?? undefined,
      createdAt: profile.createdAt,
      streak,
      count: {
        followedBy:
          (profile as { _count?: { followedBy?: number } })._count
            ?.followedBy ?? 0,
        following:
          (profile as { _count?: { following?: number } })._count?.following ??
          0,
        posts: (profile as { _count?: { posts?: number } })._count?.posts ?? 0,
      },
    };
  }
}
