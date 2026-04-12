import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../storage/storage.service';
import { FileUrlUtils } from '../../common/utils';
import { Log } from '../../common/logger/logger.decorator';

export type MyReferrerResult =
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
    }
  | null;

@Injectable()
export class GetMyReferrerHandler {
  private fileUrlUtils = new FileUrlUtils(this.logger);

  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }): Promise<MyReferrerResult> {
    this.logger.info('Getting my referrer', { transactionId, userId });

    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        referrerId: true,
        referrer: {
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
        },
      },
    });

    if (!profile || !profile.referrerId || !profile.referrer) {
      this.logger.info('No referrer found', {
        transactionId,
        profileId: profile?.id,
      });
      return null;
    }

    const referrer = profile.referrer;

    if (referrer.isAmbassador) {
      this.logger.info('Referrer is ambassador', {
        transactionId,
        referrerId: referrer.id,
      });
      const ambassadorAvatarUrl = referrer.avatar?.id
        ? await this.fileUrlUtils.getFileUrl(
            referrer.avatar.id,
            this.storageService,
          )
        : null;
      return {
        type: 'AMBASSADOR',
        data: {
          name: `${referrer.firstName} ${referrer.lastName}`,
          title: referrer.ambassadorTitle,
          bio: referrer.bio,
          interviewUrl: referrer.ambassadorInterviewUrl,
          avatarUrl: ambassadorAvatarUrl,
        },
      };
    }

    this.logger.info('Referrer is user profile', {
      transactionId,
      referrerId: referrer.id,
    });
    const userAvatarUrl = referrer.avatar?.id
      ? await this.fileUrlUtils.getFileUrl(
          referrer.avatar.id,
          this.storageService,
        )
      : null;
    return {
      type: 'USER',
      data: {
        firstName: referrer.firstName,
        lastName: referrer.lastName,
        avatarUrl: userAvatarUrl,
        bio: referrer.bio,
      },
    };
  }
}
