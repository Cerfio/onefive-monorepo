import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ProfileFollowService } from '../profile-follow.service';

@Injectable()
export class ListFollowersHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileFollowService: ProfileFollowService,
  ) {}

  @Log()
  async execute({
    transactionId,
    profileId,
  }: {
    transactionId: string;
    profileId: string;
  }) {
    const followers = await this.profileFollowService.getFollowers(profileId);
    return followers;
  }
}
