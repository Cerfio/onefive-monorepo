import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { ExperienceService } from '../experience.service';
import { CreateExperienceDto } from '../dto/create-experience.dto';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from 'src/common/constants/validation-limits.constants';
import { PostHogService } from 'src/posthog/posthog.service';

type CreateExperienceHandlerParams = {
  transactionId: string;
  userId: string;
  data: CreateExperienceDto;
};

type CreateExperienceHandlerResponse = {
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
export class CreateExperienceHandler {
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
  }: CreateExperienceHandlerParams): Promise<CreateExperienceHandlerResponse> {
    const existingExperiences = await this.experienceService.list({
      transactionId,
      where: { profile: { userId } },
      select: { id: true },
      take: VALIDATION_LIMITS.EXPERIENCE.MAX_EXPERIENCES_PER_PROFILE,
    });

    if (
      existingExperiences.length >=
      VALIDATION_LIMITS.EXPERIENCE.MAX_EXPERIENCES_PER_PROFILE
    ) {
      throw new BadRequestException(VALIDATION_MESSAGES.MAX_EXPERIENCES_REACHED);
    }

    const experience = await this.experienceService.create({
      transactionId,
      data: {
        ...data,
        from: new Date(data.from),
        to: data.to ? new Date(data.to) : null,
        profile: {
          connect: { userId },
        },
      },
    });

    this.posthogService.capture(userId, 'experience_added', {});

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
