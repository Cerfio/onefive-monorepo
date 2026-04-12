import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { UserSettingsService } from '../user-settings.service';
import { UpdateNotificationsDto } from '../dto/update-notifications.dto';

@Injectable()
export class UpdateNotificationsHandler {
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
    dto: UpdateNotificationsDto;
  }) {
    // Mapper les champs du DTO vers Prisma
    const updateData: any = {};

    if (dto.email !== undefined) updateData.emailNotifications = dto.email;
    if (dto.push !== undefined) updateData.pushNotifications = dto.push;
    if (dto.marketing !== undefined)
      updateData.marketingNotifications = dto.marketing;
    if (dto.connections !== undefined)
      updateData.connectionsNotifications = dto.connections;
    if (dto.mentions !== undefined)
      updateData.mentionsNotifications = dto.mentions;
    if (dto.discussions !== undefined)
      updateData.discussionsNotifications = dto.discussions;
    if (dto.frequency !== undefined)
      updateData.notificationFrequency = dto.frequency;
    if (dto.quietHours !== undefined) updateData.quietHours = dto.quietHours;
    if (dto.weekendNotif !== undefined)
      updateData.weekendNotifications = dto.weekendNotif;

    const settings = await this.userSettingsService.updateNotifications({
      transactionId,
      userId,
      data: updateData,
    });

    return {
      notifications: {
        email: settings.emailNotifications,
        push: settings.pushNotifications,
        marketing: settings.marketingNotifications,
        connections: settings.connectionsNotifications,
        mentions: settings.mentionsNotifications,
        discussions: settings.discussionsNotifications,
        frequency: settings.notificationFrequency.toLowerCase(), // IMMEDIATE -> immediate
        quietHours: settings.quietHours,
        weekendNotif: settings.weekendNotifications,
      },
    };
  }
}
