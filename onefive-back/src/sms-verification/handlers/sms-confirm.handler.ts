import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { SmsVerificationService } from '../sms-verification.service';
import { UsersService } from '../../users/users.service';
import { AuthenticationNotFoundException } from '../../auth/auth.exception';
import {
  SmsVerificationNotFoundException,
  SmsVerificationCodeExpiredException,
  SmsVerificationIncorrectCodeException,
  SmsVerificationPhoneNumberAlreadyUsedException,
} from '../sms-verification.exception';

@Injectable()
export class SmsConfirmHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly smsVerificationService: SmsVerificationService,
    private readonly usersService: UsersService,
  ) {}

  @Log()
  async execute({
    transactionId,
    code,
    userId,
  }: {
    transactionId: string;
    code: string;
    userId: string;
  }) {
    // Vérifier que l'utilisateur existe
    const user = await this.usersService.get({
      transactionId,
      where: { id: userId },
    });

    if (!user) {
      AuthenticationNotFoundException.throw(this.logger, {
        transactionId,
        userId,
        timestamp: new Date().toISOString(),
      });
    }

    // Si le numéro est déjà vérifié, retourner succès (évite 409, permet de continuer l'onboarding)
    if (user.phoneNumber) {
      return {
        success: true,
        alreadyVerified: true,
        message: 'Phone number already verified',
        phoneNumber: user.phoneNumber,
      };
    }

    // Récupérer la vérification la plus récente pour cet utilisateur
    const verifications = await this.smsVerificationService.findMany({
      transactionId,
      where: { userId },
    });

    const verification =
      verifications && verifications.length > 0 ? verifications[0] : null;

    if (!verification) {
      SmsVerificationNotFoundException.throw(this.logger, {
        transactionId,
        userId,
        code,
        timestamp: new Date().toISOString(),
      });
    }

    if (verification.codeExpiresAt < new Date()) {
      SmsVerificationCodeExpiredException.throw(this.logger, {
        transactionId,
        userId,
        code,
        expiredAt: verification.codeExpiresAt,
        timestamp: new Date().toISOString(),
      });
    }

    if (verification.smsCode !== code) {
      SmsVerificationIncorrectCodeException.throw(this.logger, {
        transactionId,
        userId,
        providedCode: code,
        expectedCode: verification.smsCode,
        timestamp: new Date().toISOString(),
      });
    }

    // Vérifier si le numéro de téléphone est déjà utilisé par un autre utilisateur
    const existingUserWithPhone = await this.usersService.findOne({
      transactionId,
      where: { phoneNumber: verification.phoneNumber },
    });

    if (existingUserWithPhone && existingUserWithPhone.id !== userId) {
      SmsVerificationPhoneNumberAlreadyUsedException.throw(this.logger, {
        transactionId,
        userId,
        phoneNumber: verification.phoneNumber,
        existingUserId: existingUserWithPhone.id,
        timestamp: new Date().toISOString(),
      });
    }

    // Mettre à jour l'utilisateur avec le numéro de téléphone
    await this.usersService.update({
      transactionId,
      where: { id: userId },
      data: {
        phoneNumber: verification.phoneNumber,
      },
    });

    return {
      success: true,
      message: 'Numéro de téléphone vérifié avec succès',
      phoneNumber: verification.phoneNumber,
    };
  }
}
