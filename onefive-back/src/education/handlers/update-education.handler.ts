import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Log } from 'src/common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { EducationService } from '../education.service';
import { UpdateEducationDto } from '../dto/update-education.dto';
import { PostHogService } from 'src/posthog/posthog.service';

type UpdateEducationHandlerParams = {
  transactionId: string;
  userId: string;
  educationId: string;
  data: UpdateEducationDto;
};

type UpdateEducationHandlerResponse = {
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
export class UpdateEducationHandler {
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
    data,
  }: UpdateEducationHandlerParams): Promise<UpdateEducationHandlerResponse> {
    const updateData: Prisma.EducationUpdateInput = { ...data };
    if (data.from) {
      updateData.from = new Date(data.from);
    }
    if (data.to !== undefined) {
      updateData.to = data.to ? new Date(data.to) : null;
    }

    const education = await this.educationService.updateWithOwnershipCheck({
      transactionId,
      userId,
      educationId,
      data: updateData,
    });

    this.posthogService.capture(userId, 'education_updated', {
      education_id: educationId,
    });

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
