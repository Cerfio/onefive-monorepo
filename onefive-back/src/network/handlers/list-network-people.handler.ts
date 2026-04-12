import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { NetworkService } from '../network.service';
import { GetNetworkPeopleDto } from '../dto/get-network-people.dto';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class ListNetworkPeopleHandler {
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
    filters: GetNetworkPeopleDto;
  }) {
    this.logger.info('Listing network people', {
      transactionId,
      userId,
      filters,
    });

    const people = await this.networkService.getNetworkPeople({
      transactionId,
      userId,
      filters,
    });

    this.logger.info('Network people retrieved successfully', {
      transactionId,
      userId,
      count: people.length,
    });

    return people;
  }
}
