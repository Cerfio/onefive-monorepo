import { Inject, Injectable } from '@nestjs/common';
import { PostReactionService } from '../post-reaction.service';
import { Log } from '../../common/logger/logger.decorator';
import { ListPostReactionsDto } from '../dto/list-post-reactions.dto';
import { Prisma } from '@prisma/client';
import { StreakService } from '../../streak/streak.service';
import { FollowsService } from '../../follows/follows.service';
import { StorageService } from '../../storage/storage.service';
import { FileUrlUtils } from '../../common/utils';
import { LogService } from 'logstash-winston-3';

type PostReactionWithProfile = Prisma.PostReactionGetPayload<{
  include: {
    profile: {
      select: {
        id: true;
        firstName: true;
        lastName: true;
        bio: true;
        highlight: true;
        countryCode: true;
        ecosystemRoles: true;
        avatar: { select: { id: true } };
        _count: {
          select: {
            followedBy: true;
            following: true;
            posts: true;
          };
        };
      };
    };
  };
}>;

@Injectable()
export class ListPostReactionsHandler {
  private fileUrlUtils: FileUrlUtils;

  constructor(
    private readonly postReactionService: PostReactionService,
    private readonly streakService: StreakService,
    private readonly followsService: FollowsService,
    private readonly storageService: StorageService,
    @Inject('Logger') private readonly logger: LogService,
  ) {
    this.fileUrlUtils = new FileUrlUtils(this.logger);
  }

  @Log()
  async execute({
    transactionId,
    postId,
    listPostReactionsDto,
    currentProfileId,
  }: {
    transactionId: string;
    postId: string;
    listPostReactionsDto: ListPostReactionsDto;
    currentProfileId?: string;
  }) {
    const reactions = await this.postReactionService.list({
      transactionId,
      where: { postId },
      skip: listPostReactionsDto.skip,
      take: listPostReactionsDto.take,
      orderBy: { [listPostReactionsDto.orderBy]: listPostReactionsDto.order },
      select: {
        id: true,
        reaction: true,
        profileId: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            bio: true,
            highlight: true,
            countryCode: true,
            ecosystemRoles: true,
            avatar: {
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
        },
      },
    });

    // Récupérer les profileIds uniques
    const uniqueProfileIds = [
      ...new Set(reactions.map((r: any) => r.profileId)),
    ];

    // Récupérer les streaks pour tous les profils
    const streakPromises = uniqueProfileIds.map(async (profileId) => {
      try {
        const streak = await this.streakService.getCurrentStreak({
          transactionId,
          userId: profileId,
        });
        return { profileId, streak };
      } catch {
        return { profileId, streak: 0 };
      }
    });
    const streaks = await Promise.all(streakPromises);
    const streakById = new Map(streaks.map((s) => [s.profileId, s.streak]));

    // Vérifier isFollowing pour chaque profil
    const isFollowingMap = new Map<string, boolean>();
    if (currentProfileId) {
      await Promise.all(
        uniqueProfileIds.map(async (targetProfileId) => {
          if (targetProfileId === currentProfileId) {
            isFollowingMap.set(targetProfileId, false);
          } else {
            try {
              const isFollowing = await this.followsService.isFollowingProfile({
                transactionId,
                userId: currentProfileId,
                profileId: targetProfileId,
              });
              isFollowingMap.set(targetProfileId, isFollowing);
            } catch {
              isFollowingMap.set(targetProfileId, false);
            }
          }
        }),
      );
    }

    // Pré-calculer les URLs d'avatar pour tous les profils
    const avatarUrlMap = new Map<string, string | undefined>();
    await Promise.all(
      reactions.map(async (reaction: any) => {
        if (reaction.profile?.avatar?.id) {
          try {
            const url = await this.fileUrlUtils.getFileUrl(
              reaction.profile.avatar.id,
              this.storageService,
            );
            avatarUrlMap.set(reaction.profile.id, url);
          } catch {
            // Ignorer les erreurs d'avatar
          }
        }
      }),
    );

    return reactions.map((reaction: any) => ({
      id: reaction.id,
      reaction: reaction.reaction,
      profileId: reaction.profileId,
      createdAt: reaction.createdAt,
      updatedAt: reaction.updatedAt,
      profile: {
        id: reaction.profile?.id,
        name: `${reaction.profile?.firstName || ''} ${reaction.profile?.lastName || ''}`.trim(),
        firstName: reaction.profile?.firstName,
        lastName: reaction.profile?.lastName,
        bio: reaction.profile?.bio,
        highlight: reaction.profile?.highlight,
        countryCode: reaction.profile?.countryCode,
        ecosystemRoles: reaction.profile?.ecosystemRoles || [],
        avatar: avatarUrlMap.get(reaction.profile?.id),
        streak: streakById.get(reaction.profileId) || 0,
        isFollowing: isFollowingMap.get(reaction.profileId) || false,
        followers: reaction.profile?._count?.followedBy || 0,
        following: reaction.profile?._count?.following || 0,
        posts: reaction.profile?._count?.posts || 0,
      },
    }));
  }
}
