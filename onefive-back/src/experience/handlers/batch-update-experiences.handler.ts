import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { ExperienceService } from '../experience.service';
import { BatchUpdateExperiencesDto } from '../dto/batch-update-experiences.dto';
import { PostHogService } from 'src/posthog/posthog.service';

type BatchUpdateExperiencesHandlerParams = {
  transactionId: string;
  userId: string;
  data: BatchUpdateExperiencesDto;
};

type BatchUpdateExperiencesHandlerResponse = {
  created: number;
  updated: number;
  deleted: number;
  createdExperiences: Array<{ index: number; id: string }>;
};

@Injectable()
export class BatchUpdateExperiencesHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly experienceService: ExperienceService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    data,
  }: BatchUpdateExperiencesHandlerParams): Promise<BatchUpdateExperiencesHandlerResponse> {
    const experiencesForService = data.experiences.map((exp) => ({
      id: exp.id,
      data: {
        title: exp.data.title,
        company: exp.data.company,
        domain: exp.data.domain,
        city: exp.data.city,
        from: new Date(exp.data.from),
        to: exp.data.to ? new Date(exp.data.to) : null,
        description: exp.data.description,
        urlLinkedin: exp.data.urlLinkedin,
        tags: exp.data.tags,
      },
    }));

    const result = await this.experienceService.batchUpdate({
      transactionId,
      userId,
      experiences: experiencesForService,
      deleteIds: data.deleteIds,
    });

    this.posthogService.capture(userId, 'experiences_batch_updated', {
      created: result.created,
      updated: result.updated,
      deleted: result.deleted,
    });

    return result;
  }
}
