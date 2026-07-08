import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { LogService } from 'logstash-winston-3';
import { StartupService } from '../startup.service';
import { Log } from '../../common/logger/logger.decorator';
import { UpdateStartupDto } from '../dto/update-startup.dto';
import { StartupUpdateException } from '../startup.exception';
import { PostHogService } from 'src/posthog/posthog.service';

type AchievementInput = {
  id?: string;
  title?: string;
  description?: string;
  date?: string;
};

/**
 * Normalise la liste d'achievements avant persistance (champ Json) : ne garde
 * que les entrées avec un titre, borne les longueurs, et assigne un id stable
 * (les ids temporaires du client `temp-*` sont remplacés).
 */
function normalizeAchievements(input: AchievementInput[]) {
  return input
    .filter((a) => a && typeof a.title === 'string' && a.title.trim().length > 0)
    .slice(0, 50)
    .map((a) => ({
      id:
        typeof a.id === 'string' && a.id && !a.id.startsWith('temp-')
          ? a.id
          : randomUUID(),
      title: String(a.title).trim().slice(0, 150),
      description:
        typeof a.description === 'string'
          ? a.description.trim().slice(0, 1000)
          : '',
      date:
        typeof a.date === 'string' && a.date.trim()
          ? a.date.trim().slice(0, 50)
          : null,
    }));
}

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
      if (data.technologies !== undefined)
        updateData.technologies = data.technologies;
      if (data.achievements !== undefined)
        updateData.achievements = normalizeAchievements(data.achievements);
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
        technologies: startup.technologies,
        achievements: startup.achievements,
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
