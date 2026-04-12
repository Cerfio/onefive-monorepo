import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { NetworkService } from '../network.service';
import { GetNetworkStartupsDto } from '../dto/get-network-startups.dto';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class GetStartupsHandler {
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
    filters: GetNetworkStartupsDto;
  }) {
    this.logger.info('Getting network startups', {
      transactionId,
      userId,
      filters,
    });

    const startups = await this.networkService.getNetworkStartups({
      transactionId,
      userId,
      filters,
    });

    this.logger.info('Network startups retrieved successfully', {
      transactionId,
      userId,
      count: startups.length,
    });

    return startups;
  }
}
