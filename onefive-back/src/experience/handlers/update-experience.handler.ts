import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { ExperienceService } from '../experience.service';
import { UpdateExperienceDto } from '../dto/update-experience.dto';
import { PostHogService } from 'src/posthog/posthog.service';

type UpdateExperienceHandlerParams = {
  transactionId: string;
  userId: string;
  experienceId: string;
  data: UpdateExperienceDto;
};

type UpdateExperienceHandlerResponse = {
  id: string;
  title: string;
  company: string;
  domain?: string;
  city: string;
  from: Date;
  to?: Date;
  description?: string;
  urlLinkedin?: string;
  tags: string[];
};

@Injectable()
export class UpdateExperienceHandler {
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
    data,
  }: UpdateExperienceHandlerParams): Promise<UpdateExperienceHandlerResponse> {
    const updateData: Prisma.ExperienceUpdateInput = { ...data };
    if (data.from) {
      updateData.from = new Date(data.from);
    }
    if (data.to !== undefined) {
      updateData.to = data.to ? new Date(data.to) : null;
    }

    const experience = await this.experienceService.updateWithOwnershipCheck({
      transactionId,
      userId,
      experienceId,
      data: updateData,
    });

    this.posthogService.capture(userId, 'experience_updated', { experience_id: experienceId });

    return {
      id: experience.id,
      title: experience.title,
      company: experience.company,
      domain: experience.domain,
      city: experience.city,
      from: experience.from,
      to: experience.to,
      description: experience.description,
      urlLinkedin: experience.urlLinkedin,
      tags: experience.tags,
    };
  }
}
