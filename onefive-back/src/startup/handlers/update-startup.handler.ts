import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { UpdateStartupDto } from '../dto/update-startup.dto';
import { StartupUpdateException } from '../startup.exception';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class UpdateStartupHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly startupService: StartupService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    startupId,
    data,
  }: {
    transactionId: string;
    userId: string;
    startupId: string;
    data: UpdateStartupDto;
  }) {
    this.logger.info('Updating startup', {
      transactionId,
      userId,
      startupId,
      fields: Object.keys(data),
    });

    try {
      // Préparer les données pour Prisma
      const updateData: any = {};

      if (data.name !== undefined) updateData.name = data.name;
      if (data.tagline !== undefined) updateData.tagline = data.tagline;
      if (data.description !== undefined)
        updateData.description = data.description;
      if (data.website !== undefined) updateData.website = data.website;
      if (data.linkedin !== undefined) updateData.linkedin = data.linkedin;
      if (data.foundedDate !== undefined)
        updateData.foundedDate = data.foundedDate;
      if (data.countryCode !== undefined)
        updateData.countryCode = data.countryCode;
      if (data.city !== undefined) updateData.city = data.city;
      if (data.categories !== undefined)
        updateData.categories = data.categories;
      if (data.logo !== undefined) updateData.logo = data.logo;
      if (data.coverImage !== undefined)
        updateData.coverImage = data.coverImage;

      const startup = await this.startupService.update({
        transactionId,
        startupId,
        userId,
        data: updateData,
      });

      this.posthogService.capture(userId, 'startup_updated', {
        startup_id: startupId,
        fields_updated: Object.keys(data),
      });

      return {
        id: startup.id,
        name: startup.name,
        tagline: startup.tagline,
        description: startup.description,
        website: startup.website,
        linkedin: startup.linkedin,
        foundedDate: startup.foundedDate
          ? startup.foundedDate.toISOString()
          : null,
        categories: startup.categories,
        countryCode: startup.countryCode,
        city: startup.city,
        logo: startup.logo,
        coverImage: startup.coverImage,
        updatedAt: startup.updatedAt.toISOString(),
      };
    } catch (error: unknown) {
      if (error instanceof Error && error.name?.includes('Exception')) {
        throw error; // Relancer l'exception custom
      }
      StartupUpdateException.throw(this.logger, {
        transactionId,
        startupId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}
