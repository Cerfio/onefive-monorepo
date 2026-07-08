import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { ProfileService } from '../profile.service';
import { StreakService } from 'src/streak/streak.service';
import { ProfileRelationshipsService } from 'src/profile-relationships/profile-relationships.service';
import { StorageService } from 'src/storage/storage.service';
import { FileUrlUtils } from 'src/common/utils';

type MeProfileHandlerParams = {
  transactionId: string;
  userId: string;
};

type MeProfileHandlerResponse = {
  needsOnboarding?: true;
  id: string;
  firstName: string;
  lastName: string;
  highlight?: string;
  bio?: string;
  avatar?: string;
  coverImage?: string;
  city: string;
  countryCode: string;
  createdAt: Date;
  ecosystemRoles: string[];
  skills: string[];
  intentions: string[];
  interests: string[];
  stats: {
    posts: number;
    followers: number;
    following: number;
    connections: number;
    streak: number;
  };
  experiences: Array<{
    id: string;
    title: string;
    company: string;
    domain?: string | null;
    startDate: Date;
    endDate?: Date | null;
  }>;
  educations: Array<{
    id: string;
    degree: string;
    school: string;
    domain?: string | null;
    startDate: Date;
    endDate?: Date | null;
  }>;
  socials: Array<{
    id: string;
    title: string;
    url: string;
  }>;
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    date?: string;
  }>;
};

@Injectable()
export class MeProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileService: ProfileService,
    private readonly streakService: StreakService,
    private readonly profileRelationshipsService: ProfileRelationshipsService,
    private readonly storageService: StorageService,
  ) {}

  private fileUrlUtils = new FileUrlUtils(this.logger);

  @Log()
  async execute({
    transactionId,
    userId,
  }: MeProfileHandlerParams): Promise<MeProfileHandlerResponse> {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        highlight: true,
        bio: true,
        city: true,
        countryCode: true,
        // Relations File pour les images
        avatar: {
          select: {
            id: true,
            size: true,
            mimeType: true,
            createdAt: true,
          },
        },
        cover: {
          select: {
            id: true,
            size: true,
            mimeType: true,
            createdAt: true,
          },
        },
        ecosystemRoles: true,
        skills: true,
        intentions: true,
        tagFollowing: {
          select: {
            name: true,
          },
        },
        createdAt: true,
        experiences: {
          orderBy: { from: 'desc' },
          select: {
            id: true,
            title: true,
            company: true,
            domain: true,
            logoUrl: true,
            from: true,
            to: true,
          },
        },
        educations: {
          orderBy: { from: 'desc' },
          select: {
            id: true,
            degree: true,
            school: true,
            domain: true,
            logoUrl: true,
            from: true,
            to: true,
          },
        },
        socials: {
          select: {
            id: true,
            title: true,
            url: true,
          },
        },
        achievements: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            title: true,
            description: true,
            date: true,
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

    if (!profile) {
      return {
        needsOnboarding: true,
      } as MeProfileHandlerResponse;
    }

    const streak = await this.streakService.getCurrentStreak({
      transactionId,
      userId,
    });

    const relationships =
      await this.profileRelationshipsService.getUserRelationships({
        transactionId,
        userId,
      });

    const experiences =
      profile.experiences?.map((exp) => ({
        id: exp.id,
        title: exp.title,
        company: exp.company,
        domain: exp.domain,
        logoUrl: exp.logoUrl,
        startDate: exp.from,
        endDate: exp.to,
      })) ?? [];

    const educations =
      profile.educations?.map((edu) => ({
        id: edu.id,
        degree: edu.degree,
        school: edu.school,
        domain: edu.domain,
        logoUrl: edu.logoUrl,
        startDate: edu.from,
        endDate: edu.to,
      })) ?? [];

    // Debug des relations File
    this.logger.info('🔍 DEBUG - Profile avatar/cover relations', {
      transactionId,
      userId,
      hasAvatar: !!profile.avatar,
      avatarId: profile.avatar?.id,
      hasCover: !!profile.cover,
      coverId: profile.cover?.id,
      avatarIdField: profile.avatarId,
      coverIdField: profile.coverId,
    });

    return {
      id: profile.id,
      firstName: profile.firstName,
      lastName: profile.lastName,
      highlight: profile.highlight ?? undefined,
      bio: profile.bio ?? undefined,
      avatar: profile.avatar?.id
        ? await this.fileUrlUtils.getFileUrl(
            profile.avatar.id,
            this.storageService,
          )
        : undefined,
      coverImage: profile.cover?.id
        ? await this.fileUrlUtils.getFileUrl(
            profile.cover.id,
            this.storageService,
          )
        : undefined,
      city: profile.city,
      countryCode: profile.countryCode,
      createdAt: profile.createdAt,
      ecosystemRoles: profile.ecosystemRoles ?? [],
      skills: profile.skills ?? [],
      intentions: profile.intentions ?? [],
      interests: profile.tagFollowing?.map((tag) => tag.name) ?? [],
      stats: {
        posts: profile._count?.posts ?? 0,
        followers: profile._count?.followedBy ?? 0,
        following: profile._count?.following ?? 0,
        connections: relationships?.connected.length ?? 0,
        streak,
      },
      experiences,
      educations,
      socials: profile.socials ?? [],
      achievements: profile.achievements ?? [],
    };
  }
}
