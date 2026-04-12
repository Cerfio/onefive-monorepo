import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { PrismaService } from 'src/prisma/prisma.service';
import { FileUrlUtils } from '../common/utils';
import { StorageService } from '../storage/storage.service';
import {
  ProfileSuggestionGetException,
  ProfileSuggestionCreateException,
  ProfileSuggestionNotFoundException,
} from './profile-suggestion.exception';
import { ProfileSuggestionResponseDto } from './dto/get-profile-suggestion.dto';

@Injectable()
export class ProfileSuggestionService {
  constructor(
    private prisma: PrismaService,
    @Inject('Logger') private readonly logger: LogService,
    private readonly storageService: StorageService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async get({
    transactionId,
    userId,
    limit = 10,
    skip = 0,
  }: {
    transactionId: string;
    userId: string;
    limit?: number;
    skip?: number;
  }): Promise<ProfileSuggestionResponseDto[]> {
    try {
      // Get user's profile (may not exist during onboarding)
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      // Build where clause: exclude current user's profiles
      // If user has a profile, also exclude profiles they already follow
      const whereClause = userProfile
        ? {
            AND: [
              { userId: { not: userId } },
              {
                followedBy: {
                  none: {
                    followingId: userProfile.id,
                  },
                },
              },
            ],
          }
        : { userId: { not: userId } };

      const profiles = await this.prisma.profile.findMany({
        where: whereClause,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          countryCode: true,
          avatar: {
            select: {
              id: true,
            },
          },
          bio: true,
          highlight: true,
          ecosystemRoles: true,
          skills: true,
          _count: {
            select: {
              followedBy: true,
            },
          },
        },
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }],
      });

      // Process profiles with avatars in parallel
      const profilesWithAvatars = await Promise.all(
        profiles.map(async (profile) => ({
          id: profile.id,
          firstName: profile.firstName,
          lastName: profile.lastName,
          countryCode: profile.countryCode,
          avatar: profile.avatar?.id
            ? await this.fileUrlUtils.getFileUrl(
                profile.avatar.id,
                this.storageService,
              )
            : undefined,
          bio: profile.bio || undefined,
          highlight: profile.highlight || undefined,
          followersCount: profile._count.followedBy,
          isFollowed: false, // We already filtered out followed profiles
          roles: profile.ecosystemRoles || [], // Ensure it's always an array
          skills: profile.skills || [], // Ensure it's always an array
        })),
      );

      return profilesWithAvatars;
    } catch (error) {
      ProfileSuggestionGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async toggleFollow({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }): Promise<{ following: boolean }> {
    try {
      // Get user's profile
      const userProfile = await this.prisma.profile.findUnique({
        where: { userId },
        select: { id: true },
      });

      if (!userProfile) {
        ProfileSuggestionNotFoundException.throw(this.logger, {
          transactionId,
        });
      }

      // Check if target profile exists
      const targetProfile = await this.prisma.profile.findUnique({
        where: { id: profileId },
        select: { id: true },
      });

      if (!targetProfile) {
        ProfileSuggestionNotFoundException.throw(this.logger, {
          transactionId,
        });
      }

      // Can't follow yourself
      if (userProfile.id === profileId) {
        return { following: false };
      }

      // Check if follow relationship exists
      const existingFollow = await this.prisma.profileFollow.findUnique({
        where: {
          followingId_followedById: {
            followingId: userProfile.id,
            followedById: profileId,
          },
        },
      });

      if (existingFollow) {
        // Unfollow
        await this.prisma.profileFollow.delete({
          where: {
            followingId_followedById: {
              followingId: userProfile.id,
              followedById: profileId,
            },
          },
        });
        return { following: false };
      } else {
        // Follow
        await this.prisma.profileFollow.create({
          data: {
            followingId: userProfile.id,
            followedById: profileId,
          },
        });
        return { following: true };
      }
    } catch (error) {
      ProfileSuggestionCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
