import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { UserSettingsService } from '../user-settings.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class GetUserSettingsHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly userSettingsService: UserSettingsService,
    private readonly usersService: UsersService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    // Récupérer les informations utilisateur
    const user = await this.usersService.getUserById({
      transactionId,
      userId,
    });

    // Récupérer les settings ou créer par défaut
    let settings = await this.userSettingsService.getUserSettings({
      transactionId,
      userId,
    });

    if (!settings) {
      settings = await this.userSettingsService.createDefaultSettings({
        transactionId,
        userId,
      });
    }

    // Compter les sessions actives
    const activeSessions = await this.usersService.countActiveSessions({
      transactionId,
      userId,
    });

    return {
      userId: user.id,
      email: user.email,
      phone: user.phoneNumber,
      joinedAt: user.createdAt,
      lastLogin: user.updatedAt, // À améliorer avec vraie session
      accountType: 'Pro', // Tous les utilisateurs ont accès Pro par défaut
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
      preferences: {
        theme: settings.theme.toLowerCase(), // SYSTEM -> system
        language: settings.language,
        timezone: settings.timezone,
        dateFormat: settings.dateFormat.toLowerCase().replace(/_/g, '/'), // DD_MM_YYYY -> dd/mm/yyyy
      },
      security: {
        twoFactorEnabled: settings.twoFactorEnabled,
        lastPasswordChange: settings.lastPasswordChange,
        activeSessions,
      },
    };
  }
}
