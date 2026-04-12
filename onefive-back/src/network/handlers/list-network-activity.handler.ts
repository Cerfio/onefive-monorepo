import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { NetworkService } from '../network.service';
import { GetNetworkActivityDto } from '../dto/get-network-activity.dto';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class ListNetworkActivityHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly networkService: NetworkService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    filters,
  }: {
    transactionId: string;
    userId: string;
    filters: GetNetworkActivityDto;
  }) {
    this.logger.info('Listing network activity', {
      transactionId,
      userId,
      filters,
    });

    const activity = await this.networkService.getNetworkActivity({
      transactionId,
      userId,
      filters,
    });

    this.logger.info('Network activity retrieved successfully', {
      transactionId,
      userId,
      count: activity.length,
    });

    return activity;
  }
}
