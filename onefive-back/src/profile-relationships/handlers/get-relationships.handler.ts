import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { ProfileRelationshipsService } from '../profile-relationships.service';
import { Log } from '../../common/logger/logger.decorator';
import { GetUserRelationshipsDto } from '../dto/get-user-relationships.dto';

@Injectable()
export class GetRelationshipsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly profileRelationshipsService: ProfileRelationshipsService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    filters,
  }: {
    transactionId: string;
    userId: string;
    filters: GetUserRelationshipsDto;
  }) {
    this.logger.info('Getting user relationships', {
      transactionId,
      userId,
      filters,
    });

    const relationships =
      await this.profileRelationshipsService.getUserRelationships({
        transactionId,
        userId,
      });

    this.logger.info('User relationships retrieved successfully', {
      transactionId,
      userId,
      connectedCount: relationships.connected.length,
      pendingCount: relationships.pending.length,
    });

    return relationships;
  }
}
