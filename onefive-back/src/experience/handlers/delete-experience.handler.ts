import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { ExperienceService } from '../experience.service';
import { PostHogService } from 'src/posthog/posthog.service';

type DeleteExperienceHandlerParams = {
  transactionId: string;
  userId: string;
  experienceId: string;
};

type DeleteExperienceHandlerResponse = {
  success: true;
};

@Injectable()
export class DeleteExperienceHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly experienceService: ExperienceService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    experienceId,
  }: DeleteExperienceHandlerParams): Promise<DeleteExperienceHandlerResponse> {
    await this.experienceService.deleteWithOwnershipCheck({
      transactionId,
      userId,
      experienceId,
    });

    this.posthogService.capture(userId, 'experience_deleted', { experience_id: experienceId });

    return { success: true };
  }
}
