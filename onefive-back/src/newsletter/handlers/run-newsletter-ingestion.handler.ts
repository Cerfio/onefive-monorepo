import { Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import type { RunNewsletterIngestionDto } from '../dto/run-newsletter-ingestion.dto';
import { NewsletterIngestionService } from '../newsletter-ingestion.service';

@Injectable()
export class RunNewsletterIngestionHandler {
  constructor(private readonly ingestionService: NewsletterIngestionService) {}

  @Log()
  execute(dto: RunNewsletterIngestionDto) {
    if (dto.sourceId) {
      return this.ingestionService.ingestBySourceId(dto.sourceId);
    }
    return this.ingestionService.ingestAllActiveFeeds();
  }
}
