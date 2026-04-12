import { Body, Controller, Get, Put, Req } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { UserSettingsResponseDto } from './dto/user-settings-response.dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';
import { FastifyRequestUserId } from 'src/types/fastify-request-user-id';
import { GetUserSettingsHandler } from './handlers/get-user-settings.handler';
import { UpdateNotificationsHandler } from './handlers/update-notifications.handler';
import { UpdatePrivacyHandler } from './handlers/update-privacy.handler';
import { UpdatePreferencesHandler } from './handlers/update-preferences.handler';
import { UpdatePasswordHandler } from './handlers/update-password.handler';
import { UpdateNotificationsDto } from './dto/update-notifications.dto';
import { UpdatePrivacyDto } from './dto/update-privacy.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { AllowOnboardingNotComplete } from '../common/decorators/allow-onboarding-not-complete.decorator';
import { AllowWaitlistNotActive } from '../common/decorators/allow-waitlist-not-active.decorator';

@Controller('user-settings')
export class UserSettingsController {
  constructor(
    private readonly getUserSettingsHandler: GetUserSettingsHandler,
    private readonly updateNotificationsHandler: UpdateNotificationsHandler,
    private readonly updatePrivacyHandler: UpdatePrivacyHandler,
    private readonly updatePreferencesHandler: UpdatePreferencesHandler,
    private readonly updatePasswordHandler: UpdatePasswordHandler,
  ) {}

  @AllowOnboardingNotComplete()
  @AllowWaitlistNotActive()
  @Get()
  async getSettings(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
  ): Promise<ApiResponseDto<UserSettingsResponseDto>> {
    const data = await this.getUserSettingsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
    });
    return { success: true, data };
  }

  @AllowOnboardingNotComplete()
  @AllowWaitlistNotActive()
  @Put('/notifications')
  async updateNotifications(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: UpdateNotificationsDto,
  ): Promise<ApiResponseDto<UserSettingsResponseDto>> {
    const data = await this.updateNotificationsHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      dto: body,
    });
    return { success: true, data };
  }

  @AllowOnboardingNotComplete()
  @AllowWaitlistNotActive()
  @Put('/privacy')
  async updatePrivacy(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: UpdatePrivacyDto,
  ): Promise<ApiResponseDto<UserSettingsResponseDto>> {
    const data = await this.updatePrivacyHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      dto: body,
    });
    return { success: true, data };
  }

  @AllowOnboardingNotComplete()
  @AllowWaitlistNotActive()
  @Put('/preferences')
  async updatePreferences(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: UpdatePreferencesDto,
  ): Promise<ApiResponseDto<UserSettingsResponseDto>> {
    const data = await this.updatePreferencesHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      dto: body,
    });
    return { success: true, data };
  }

  @Put('/password')
  async updatePassword(
    @Req() req: FastifyRequest & FastifyRequestUserId & { id: string },
    @Body() body: UpdatePasswordDto,
  ): Promise<ApiResponseDto<UserSettingsResponseDto>> {
    const data = await this.updatePasswordHandler.execute({
      transactionId: req.id,
      userId: req.userId,
      dto: body,
    });
    return { success: true, data };
  }
}
