import { Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { EducationService } from '../education.service';
import { PostHogService } from 'src/posthog/posthog.service';

type DeleteEducationHandlerParams = {
  transactionId: string;
  userId: string;
  educationId: string;
};

type DeleteEducationHandlerResponse = {
  success: true;
};

@Injectable()
export class DeleteEducationHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly educationService: EducationService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    educationId,
  }: DeleteEducationHandlerParams): Promise<DeleteEducationHandlerResponse> {
    await this.educationService.deleteWithOwnershipCheck({
      transactionId,
      userId,
      educationId,
    });

    this.posthogService.capture(userId, 'education_deleted', { education_id: educationId });

    return { success: true };
  }
}
