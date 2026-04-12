import { Injectable, Inject } from '@nestjs/common';
import { LogService } from 'logstash-winston-3';
import { Log } from '../../common/logger/logger.decorator';
import { SmsVerificationService } from '../sms-verification.service';
import { UsersService } from '../../users/users.service';
import { AuthenticationNotFoundException } from '../../auth/auth.exception';
import { SmsVerificationCooldownException } from '../sms-verification.exception';
import { TwilioService } from 'src/twilio/twilio.service';
import { randomInt } from 'crypto';

const COOLDOWN_SECONDS = 60;

@Injectable()
export class SmsRequestHandler {
  constructor(
    @Inject('Logger') private readonly logger: LogService,
    private readonly smsVerificationService: SmsVerificationService,
    private readonly usersService: UsersService,
    private readonly twilioService: TwilioService,
  ) {}

  @Log()
  async execute({
    transactionId,
    phoneNumber,
    userId,
  }: {
    transactionId: string;
    phoneNumber: string;
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

    // Vérifier le cooldown (60s entre chaque demande)
    const existingVerification = await this.smsVerificationService.get({
      transactionId,
      where: { userId },
    });

    if (existingVerification) {
      const secondsSinceLastRequest =
        (Date.now() - existingVerification.updatedAt.getTime()) / 1000;
      if (secondsSinceLastRequest < COOLDOWN_SECONDS) {
        SmsVerificationCooldownException.throw(this.logger, {
          transactionId,
          userId,
          retryAfter: Math.ceil(COOLDOWN_SECONDS - secondsSinceLastRequest),
        });
      }
    }

    // Générer un code de vérification (cryptographiquement sécurisé)
    const smsCode = randomInt(100000, 1000000).toString();
    const codeExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Créer ou mettre à jour la vérification SMS (upsert = atomic, no race condition)
    const smsVerification = await this.smsVerificationService.upsert({
      transactionId,
      data: {
        phoneNumber,
        userId,
        smsCode,
        codeExpiresAt,
      },
    });

    // Formater le code avec un tiret (123-456)
    const formattedCode = `${smsCode.slice(0, 3)}-${smsCode.slice(3)}`;

    // Envoyer le SMS
    await this.twilioService.sendSms({
      transactionId,
      to: phoneNumber,
      body: `Votre code de vérification OneFive est : ${formattedCode}`,
    });

    return {
      success: true,
      message: 'Code de vérification envoyé par SMS',
      smsVerificationId: smsVerification.id,
    };
  }
}
