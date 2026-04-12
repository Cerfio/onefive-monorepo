import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { EducationService } from '../education.service';
import { BatchUpdateEducationsDto } from '../dto/batch-update-educations.dto';
import { PostHogService } from 'src/posthog/posthog.service';

type BatchUpdateEducationsHandlerParams = {
  transactionId: string;
  userId: string;
  data: BatchUpdateEducationsDto;
};

type BatchUpdateEducationsHandlerResponse = {
  created: number;
  updated: number;
  deleted: number;
  createdEducations: Array<{ index: number; id: string }>;
};

@Injectable()
export class BatchUpdateEducationsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly educationService: EducationService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    data,
  }: BatchUpdateEducationsHandlerParams): Promise<BatchUpdateEducationsHandlerResponse> {
    const educationsForService = data.educations.map((edu) => ({
      id: edu.id,
      data: {
        degree: edu.data.degree,
        school: edu.data.school,
        domain: edu.data.domain,
        city: edu.data.city,
        from: new Date(edu.data.from),
        to: edu.data.to ? new Date(edu.data.to) : null,
        description: edu.data.description,
        urlLinkedin: edu.data.urlLinkedin,
        tags: edu.data.tags,
      },
    }));

    const result = await this.educationService.batchUpdate({
      transactionId,
      userId,
      educations: educationsForService,
      deleteIds: data.deleteIds,
    });

    this.posthogService.capture(userId, 'educations_batch_updated', {
      created: result.created,
      updated: result.updated,
      deleted: result.deleted,
    });

    return result;
  }
}
