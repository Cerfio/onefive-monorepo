import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { FileUrlUtils } from '../../common/utils';
import { Log } from '../../common/logger/logger.decorator';

export type ReferrerByCodeResult =
  | {
      type: 'AMBASSADOR';
      data: {
        name: string;
        title: string | null;
        bio: string | null;
        interviewUrl: string | null;
        avatarUrl: string | null;
      };
    }
  | {
      type: 'USER';
      data: {
        firstName: string;
        lastName: string;
        avatarUrl: string | null;
        bio: string | null;
      };
    };

@Injectable()
export class GetReferrerByCodeHandler {
  private fileUrlUtils = new FileUrlUtils(this.logger);

  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  @Log()
  async execute({
    transactionId,
    referralCode,
  }: {
    transactionId: string;
    referralCode: string;
  }): Promise<ReferrerByCodeResult> {
    this.logger.info('Getting referrer by referral code', {
      transactionId,
      referralCode,
    });

    const profile = await this.prisma.profile.findUnique({
      where: { referralCode },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: { select: { id: true } },
        isAmbassador: true,
        ambassadorTitle: true,
        ambassadorInterviewUrl: true,
      },
    });

    if (!profile) {
      throw new NotFoundException('Referrer not found');
    }

    if (profile.isAmbassador) {
      this.logger.info('Referrer is ambassador', {
        transactionId,
        profileId: profile.id,
      });
      const ambassadorAvatarUrl = profile.avatar?.id
        ? await this.fileUrlUtils.getFileUrl(
            profile.avatar.id,
            this.storageService,
          )
        : null;
      return {
        type: 'AMBASSADOR',
        data: {
          name: `${profile.firstName} ${profile.lastName}`,
          title: profile.ambassadorTitle,
          bio: profile.bio,
          interviewUrl: profile.ambassadorInterviewUrl,
          avatarUrl: ambassadorAvatarUrl,
        },
      };
    }

    this.logger.info('Referrer is user profile', {
      transactionId,
      profileId: profile.id,
    });
    const userAvatarUrl = profile.avatar?.id
      ? await this.fileUrlUtils.getFileUrl(
          profile.avatar.id,
          this.storageService,
        )
      : null;
    return {
      type: 'USER',
      data: {
        firstName: profile.firstName,
        lastName: profile.lastName,
        avatarUrl: userAvatarUrl,
        bio: profile.bio,
      },
    };
  }
}
