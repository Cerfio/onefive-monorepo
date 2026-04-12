import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { ApifyService } from '../apify.service';
import { LinkedInCompany } from '../schemas/linkedin-company.schema';

@Injectable()
export class PreviewCompanySyncHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly apifyService: ApifyService,
  ) {}

  @Log()
  async execute({
    transactionId,
    linkedinUrl,
  }: {
    transactionId: string;
    linkedinUrl: string;
  }): Promise<Partial<LinkedInCompany>> {
    // 1. Scrape LinkedIn company
    const companyData = await this.apifyService.scrapeLinkedInCompany({
      transactionId,
      linkedinUrl,
    });

    // 2. Return the data directly (frontend will handle mapping)
    return companyData;
  }
}
