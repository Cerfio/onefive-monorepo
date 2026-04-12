import { Inject, Injectable } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from 'src/common/logger/logger.decorator';
import { UserSettingsService } from '../user-settings.service';
import { UpdatePasswordDto } from '../dto/update-password.dto';
import { UsersService } from 'src/users/users.service';
import { EmailService } from 'src/email/email.service';
import * as bcrypt from 'bcrypt';
import {
  PasswordMismatchException,
  InvalidCurrentPasswordException,
} from '../user-settings.exception';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class UpdatePasswordHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly userSettingsService: UserSettingsService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    userId,
    dto,
  }: {
    transactionId: string;
    userId: string;
    dto: UpdatePasswordDto;
  }) {
    // Vérifier que les mots de passe correspondent
    if (dto.newPassword !== dto.confirmPassword) {
      PasswordMismatchException.throw(this.logger, { transactionId });
    }

    // Récupérer l'utilisateur (avec password pour vérification)
    const user = await this.usersService.getUserByIdWithPassword({
      transactionId,
      userId,
    });

    // Vérifier le mot de passe actuel
    if (!user.password) {
      InvalidCurrentPasswordException.throw(this.logger, { transactionId });
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword.concat(process.env.KEY_AUTHENTICATION),
      user.password,
    );

    if (!isCurrentPasswordValid) {
      InvalidCurrentPasswordException.throw(this.logger, { transactionId });
    }

    // Hasher le nouveau mot de passe
    const saltRounds = process.env.NODE_ENV === 'test' ? 1 : 15;
    const hashedPassword = await bcrypt.hash(
      dto.newPassword.concat(process.env.KEY_AUTHENTICATION),
      saltRounds,
    );

    // Mettre à jour le mot de passe
    await this.usersService.updatePassword({
      transactionId,
      userId,
      password: hashedPassword,
    });

    // Mettre à jour la date de dernière modification
    const settings = await this.userSettingsService.updateLastPasswordChange({
      transactionId,
      userId,
    });

    this.posthogService.capture(userId, 'password_updated', {});

    this.emailService
      .sendEmail({
        to: user.email,
        type: 'password-changed',
        payload: {
          firstName: 'there',
          userEmail: user.email,
        },
      })
      .catch(() => {});

    return {
      lastPasswordChange: settings.lastPasswordChange,
    };
  }
}
