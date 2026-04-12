import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { EducationService } from '../education.service';
import { CreateEducationDto } from '../dto/create-education.dto';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from 'src/common/constants/validation-limits.constants';
import { PostHogService } from 'src/posthog/posthog.service';

type CreateEducationHandlerParams = {
  transactionId: string;
  userId: string;
  data: CreateEducationDto;
};

type CreateEducationHandlerResponse = {
  id: string;
  degree: string;
  school: string;
  domain?: string;
  city: string;
  from: Date;
  to?: Date;
  description?: string;
  urlLinkedin?: string;
  urlAvatar?: string;
  tags: string[];
};

@Injectable()
export class CreateEducationHandler {
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
  }: CreateEducationHandlerParams): Promise<CreateEducationHandlerResponse> {
    const existingEducations = await this.educationService.list({
      transactionId,
      where: { profile: { userId } },
      select: { id: true },
      take: VALIDATION_LIMITS.EDUCATION.MAX_EDUCATIONS_PER_PROFILE,
    });

    if (
      existingEducations.length >=
      VALIDATION_LIMITS.EDUCATION.MAX_EDUCATIONS_PER_PROFILE
    ) {
      throw new BadRequestException(VALIDATION_MESSAGES.MAX_EDUCATIONS_REACHED);
    }

    const education = await this.educationService.create({
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

    this.posthogService.capture(userId, 'education_added', {});

    return {
      id: education.id,
      degree: education.degree,
      school: education.school,
      domain: education.domain,
      city: education.city,
      from: education.from,
      to: education.to,
      description: education.description,
      urlLinkedin: education.urlLinkedin,
      tags: education.tags,
    };
  }
}
