import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LogService } from 'logstash-winston-3';
import { Log } from '../common/logger/logger.decorator';
import {
  FollowsCreateException,
  FollowsDeleteException,
  FollowsValidationException,
  FollowsNotFoundException,
  FollowsAlreadyExistsException,
} from './follows.exception';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  @Log()
  async followProfile({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    try {
      // Vérifier que l'utilisateur a un profil
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!requesterProfile) {
        FollowsNotFoundException.throw(this.logger, { transactionId, userId });
      }

      const requesterId = requesterProfile.id;

      // Vérifier que le profil à suivre existe
      const targetProfile = await this.prisma.profile.findUnique({
        where: { id: profileId },
        select: { id: true },
      });

      if (!targetProfile) {
        FollowsNotFoundException.throw(this.logger, {
          transactionId,
          profileId,
        });
      }

      // Empêcher de se suivre soi-même
      if (requesterId === profileId) {
        FollowsValidationException.throw(this.logger, {
          transactionId,
          userId,
          profileId,
        });
      }

      // Vérifier si le follow existe déjà
      const existingFollow = await this.prisma.profileFollow.findUnique({
        where: {
          followingId_followedById: {
            followingId: profileId,
            followedById: requesterId,
          },
        },
      });

      if (existingFollow) {
        FollowsAlreadyExistsException.throw(this.logger, {
          transactionId,
          userId,
          profileId,
        });
      }

      // Créer le follow
      const follow = await this.prisma.profileFollow.create({
        data: {
          followingId: profileId,
          followedById: requesterId,
        },
      });

      return {
        id: `${follow.followingId}-${follow.followedById}`, // Composite key
        followingId: follow.followingId,
        followedById: follow.followedById,
        createdAt: follow.createdAt,
      };
    } catch (error) {
      // Ne pas re-throw si c'est déjà une exception custom
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }
      FollowsCreateException.throw(this.logger, {
        transactionId,
        userId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async unfollowProfile({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    try {
      // Vérifier que l'utilisateur a un profil
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!requesterProfile) {
        FollowsNotFoundException.throw(this.logger, { transactionId, userId });
      }

      const requesterId = requesterProfile.id;

      // Vérifier que le follow existe avant de le supprimer
      const existingFollow = await this.prisma.profileFollow.findUnique({
        where: {
          followingId_followedById: {
            followingId: profileId,
            followedById: requesterId,
          },
        },
      });

      if (!existingFollow) {
        FollowsValidationException.throw(this.logger, {
          transactionId,
          userId,
          profileId,
        });
      }

      // Supprimer le follow
      const follow = await this.prisma.profileFollow.delete({
        where: {
          followingId_followedById: {
            followingId: profileId,
            followedById: requesterId,
          },
        },
      });

      return {
        id: `${follow.followingId}-${follow.followedById}`,
        followingId: follow.followingId,
        followedById: follow.followedById,
      };
    } catch (error) {
      // Ne pas re-throw si c'est déjà une exception custom
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }
      FollowsDeleteException.throw(this.logger, {
        transactionId,
        userId,
        profileId,
        error,
      });
    }
  }

  @Log()
  async followStartup({
    transactionId,
    userId,
    startupId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
  }) {
    try {
      // Vérifier que l'utilisateur a un profil
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!requesterProfile) {
        FollowsNotFoundException.throw(this.logger, { transactionId, userId });
      }

      const requesterId = requesterProfile.id;

      // Vérifier que la startup existe
      const startup = await this.prisma.startup.findUnique({
        where: { id: startupId },
        select: { id: true },
      });

      if (!startup) {
        FollowsNotFoundException.throw(this.logger, {
          transactionId,
          startupId,
        });
      }

      // Vérifier si le follow existe déjà
      const existingFollow = await this.prisma.startupFollow.findUnique({
        where: {
          profileId_startupId: {
            profileId: requesterId,
            startupId: startupId,
          },
        },
      });

      if (existingFollow) {
        FollowsAlreadyExistsException.throw(this.logger, {
          transactionId,
          userId,
          startupId,
        });
      }

      // Créer le follow
      const follow = await this.prisma.startupFollow.create({
        data: {
          profileId: requesterId,
          startupId: startupId,
        },
      });

      return {
        id: `${follow.profileId}-${follow.startupId}`, // Composite key
        profileId: follow.profileId,
        startupId: follow.startupId,
        createdAt: follow.createdAt,
      };
    } catch (error) {
      // Ne pas re-throw si c'est déjà une exception custom
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error;
      }
      FollowsCreateException.throw(this.logger, {
        transactionId,
        userId,
        startupId,
        error,
      });
    }
  }

  @Log()
  async unfollowStartup({
    transactionId,
    userId,
    startupId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
  }) {
    try {
      // Vérifier que l'utilisateur a un profil
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!requesterProfile) {
        FollowsNotFoundException.throw(this.logger, { transactionId, userId });
      }

      const requesterId = requesterProfile.id;

      // Supprimer le follow
      const follow = await this.prisma.startupFollow.delete({
        where: {
          profileId_startupId: {
            profileId: requesterId,
            startupId: startupId,
          },
        },
      });

      return {
        id: `${follow.profileId}-${follow.startupId}`,
        profileId: follow.profileId,
        startupId: follow.startupId,
      };
    } catch (error) {
      FollowsDeleteException.throw(this.logger, {
        transactionId,
        userId,
        startupId,
        error,
      });
    }
  }

  @Log()
  async isFollowingProfile({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    try {
      this.logger.info('Checking if user follows profile', {
        transactionId,
        userId,
        profileId,
      });

      // Vérifier que l'utilisateur a un profil
      const requesterProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!requesterProfile) {
        this.logger.warn('Requester profile not found', {
          transactionId,
          userId,
        });
        return false;
      }

      const requesterId = requesterProfile.id;

      // Vérifier si le profil à vérifier existe
      const targetProfile = await this.prisma.profile.findUnique({
        where: { id: profileId },
        select: { id: true },
      });

      if (!targetProfile) {
        this.logger.warn('Target profile not found', {
          transactionId,
          profileId,
        });
        return false;
      }

      // Vérifier si le follow existe
      const existingFollow = await this.prisma.profileFollow.findUnique({
        where: {
          followingId_followedById: {
            followingId: profileId,
            followedById: requesterId,
          },
        },
      });

      const isFollowing = !!existingFollow;

      this.logger.info('Follow status checked', {
        transactionId,
        userId,
        profileId,
        isFollowing,
        existingFollow: !!existingFollow,
      });

      return isFollowing;
    } catch (error) {
      this.logger.error('Failed to check follow status', {
        transactionId,
        userId,
        profileId,
        error: error.message,
      });
      return false;
    }
  }

  // Listing follows removed; use enriched payloads from network endpoints

  /**
   * Batch check: returns a Set of profileIds that followerId follows.
   * 1 query instead of N.
   */
  async areFollowingBatch(
    followerId: string,
    targetIds: string[],
  ): Promise<Set<string>> {
    if (targetIds.length === 0) return new Set();
    const follows = await this.prisma.profileFollow.findMany({
      where: {
        followedById: followerId,
        followingId: { in: targetIds },
      },
      select: { followingId: true },
    });
    return new Set(follows.map((f) => f.followingId));
  }

  /**
   * Toggle startup follow: follow if not following, unfollow if following.
   * Canonical implementation — other modules should delegate here.
   */
  @Log()
  async toggleStartupFollow({
    transactionId,
    userId,
    startupId,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
  }): Promise<{ following: boolean }> {
    // Get user's profile
    const userProfile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!userProfile) {
      FollowsNotFoundException.throw(this.logger, { transactionId, userId });
    }

    // Check if startup exists
    const startup = await this.prisma.startup.findUnique({
      where: { id: startupId },
      select: { id: true },
    });

    if (!startup) {
      FollowsNotFoundException.throw(this.logger, {
        transactionId,
        startupId,
      });
    }

    // Check if follow relationship exists
    const existingFollow = await this.prisma.startupFollow.findUnique({
      where: {
        profileId_startupId: {
          profileId: userProfile.id,
          startupId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await this.prisma.startupFollow.delete({
        where: {
          profileId_startupId: {
            profileId: userProfile.id,
            startupId,
          },
        },
      });
      return { following: false };
    } else {
      // Follow
      await this.prisma.startupFollow.create({
        data: {
          profileId: userProfile.id,
          startupId,
        },
      });
      return { following: true };
    }
  }
}
