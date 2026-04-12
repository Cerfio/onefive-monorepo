import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileFollowService } from '../profile-follow.service';
import { ProfileService } from '../../profile/profile.service';

@Injectable()
export class IsFollowingProfileHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileFollowService: ProfileFollowService,
    private readonly profileService: ProfileService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    profileId,
  }: {
    transactionId: string;
    userId: string;
    profileId: string;
  }) {
    const profile = await this.profileService.get({
      transactionId,
      where: { userId },
      select: { id: true },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    const isFollowing = await this.profileFollowService.isFollowing(
      profile.id,
      profileId,
    );
    return { isFollowing };
  }
}
