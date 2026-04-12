import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { UserSettingsService } from '../user-settings.service';
import { UpdatePreferencesDto } from '../dto/update-preferences.dto';

@Injectable()
export class UpdatePreferencesHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly userSettingsService: UserSettingsService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    dto,
  }: {
    transactionId: string;
    userId: string;
    dto: UpdatePreferencesDto;
  }) {
    const settings = await this.userSettingsService.updatePreferences({
      transactionId,
      userId,
      data: dto,
    });

    return {
      preferences: {
        theme: settings.theme.toLowerCase(), // SYSTEM -> system
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat.toLowerCase().replace(/_/g, '/'), // DD_MM_YYYY -> dd/mm/yyyy
      },
    };
  }
}
