import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { UserSettingsService } from '../user-settings.service';
import { UpdatePrivacyDto } from '../dto/update-privacy.dto';

@Injectable()
export class UpdatePrivacyHandler {
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
    dto: UpdatePrivacyDto;
  }) {
    const settings = await this.userSettingsService.updatePrivacy({
      transactionId,
      userId,
      data: dto,
    });

    return {
      privacy: {
        profileVisibility: settings.profileVisibility.toLowerCase(), // PUBLIC -> public
        showEmail: settings.showEmail,
        showPhone: settings.showPhone,
        allowMessages: settings.allowMessages,
        showActivity: settings.showActivity,
        searchVisibility: settings.searchVisibility,
        dataProcessing: settings.dataProcessing,
        analyticsSharing: settings.analyticsSharing,
      },
    };
  }
}
