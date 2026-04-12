import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { WaitlistService } from '../waitlist/waitlist.service';
import { Log } from '../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import { Prisma } from '@prisma/client';
import { randomInt } from 'crypto';
import {
  EmailVerificationCreateException,
  EmailVerificationGetException,
  EmailVerificationBadCodeException,
  EmailVerificationCodeExpiredException,
  EmailVerificationCooldownException,
} from './email-verification.exception';

const COOLDOWN_SECONDS = 60;

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    private readonly waitlistService: WaitlistService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  private getVerificationUrl(code: string): string {
    const frontendUrl = process.env.FRONTEND_URL || '';
    return `${frontendUrl.replace(/\/$/, '')}/auth/confirm/email?code=${code}`;
  }

  @Log()
  private async generateCode(length: number) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(randomInt(characters.length));
    }
    return code;
  }

  @Log()
  async create({
    transactionId,
    data,
  }: {
    transactionId: string;
    data: {
      email: string;
      userId: string;
    };
  }) {
    try {
      const code = await this.generateCode(4);
      const emailVerification = await this.prisma.emailVerification.upsert({
        where: { userId: data.userId },
        create: {
          userId: data.userId,
          emailCode: code,
          codeExpiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
        },
        update: {
          emailCode: code,
          codeExpiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
        },
      });

      // Envoyer l'email directement via le service email
      await this.emailService.sendEmail({
        to: data.email,
        type: 'verification',
        payload: {
          code,
          verificationUrl: this.getVerificationUrl(code),
        },
      });

      return emailVerification;
    } catch (error) {
      EmailVerificationCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async get({
    transactionId,
    where,
  }: {
    transactionId: string;
    where: Prisma.EmailVerificationWhereUniqueInput;
  }) {
    try {
      const emailVerification = await this.prisma.emailVerification.findUnique({
        where,
      });
      return emailVerification;
    } catch (error) {
      EmailVerificationGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async verifyCode({
    transactionId,
    email,
    code,
  }: {
    transactionId: string;
    email: string;
    code: string;
  }) {
    try {
      // Trouver l'utilisateur par email d'abord
      const user = await this.prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        EmailVerificationGetException.throw(this.logger, {
          transactionId,
          email,
        });
      }

      // Vérifier d'abord si un code existe pour cet utilisateur
      const existingVerification =
        await this.prisma.emailVerification.findFirst({
          where: {
            userId: user.id,
            emailCode: code,
          },
        });

      if (!existingVerification) {
        // Le code n'existe pas ou est incorrect
        EmailVerificationBadCodeException.throw(this.logger, {
          transactionId,
          userId: user.id,
          code,
        });
      }

      // Vérifier si le code a expiré
      if (existingVerification.codeExpiresAt < new Date()) {
        EmailVerificationCodeExpiredException.throw(this.logger, {
          transactionId,
          userId: user.id,
          code,
        });
      }

      // Marquer l'email comme vérifié
      await this.prisma.user.update({
        where: { id: existingVerification.userId },
        data: { isEmailVerified: true },
      });

      // Accept pending referrals now that email is verified
      try {
        await this.waitlistService.acceptPendingReferralOnEmailVerification(
          existingVerification.userId,
        );
      } catch (error) {
        this.logger.error(
          'Failed to accept pending referral on email verification',
          {
            transactionId,
            userId: existingVerification.userId,
            error: (error as Error).message,
          },
        );
        // Don't fail email verification if referral processing fails
      }

      // Supprimer le code de vérification
      await this.prisma.emailVerification.delete({
        where: { id: existingVerification.id },
      });

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      // Si c'est déjà une de nos custom exceptions, on la relance
      if (
        error instanceof EmailVerificationBadCodeException ||
        error instanceof EmailVerificationCodeExpiredException ||
        error instanceof EmailVerificationGetException
      ) {
        throw error;
      }
      // Sinon, on throw une exception générique
      EmailVerificationGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async confirmEmailVerification({
    transactionId,
    userId,
    code,
  }: {
    transactionId: string;
    userId: string;
    code: string;
  }) {
    try {
      // Vérifier d'abord si un code existe pour cet utilisateur
      const existingVerification =
        await this.prisma.emailVerification.findFirst({
          where: {
            userId,
            emailCode: code,
          },
        });

      if (!existingVerification) {
        // Le code n'existe pas ou est incorrect
        EmailVerificationBadCodeException.throw(this.logger, {
          transactionId,
          userId,
          code,
        });
      }

      // Vérifier si le code a expiré
      if (existingVerification.codeExpiresAt < new Date()) {
        EmailVerificationCodeExpiredException.throw(this.logger, {
          transactionId,
          userId,
          code,
        });
      }

      // Marquer l'email comme vérifié
      await this.prisma.user.update({
        where: { id: userId },
        data: { isEmailVerified: true },
      });

      // Accept pending referrals now that email is verified
      try {
        await this.waitlistService.acceptPendingReferralOnEmailVerification(
          userId,
        );
      } catch (error) {
        this.logger.error(
          'Failed to accept pending referral on email verification',
          {
            transactionId,
            userId,
            error: (error as Error).message,
          },
        );
        // Don't fail email verification if referral processing fails
      }

      // Supprimer le code de vérification
      await this.prisma.emailVerification.delete({
        where: { id: existingVerification.id },
      });

      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      // Si c'est déjà une de nos custom exceptions, on la relance
      if (
        error instanceof EmailVerificationBadCodeException ||
        error instanceof EmailVerificationCodeExpiredException
      ) {
        throw error;
      }
      // Sinon, on throw une exception générique
      EmailVerificationGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async checkEmailVerificationStatus({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, isEmailVerified: true },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return {
        email: user.email,
        isVerified: user.isEmailVerified,
      };
    } catch (error) {
      EmailVerificationGetException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  @Log()
  async requestEmailVerification({
    transactionId,
    userId,
    isOtpOnlySession = false,
  }: {
    transactionId: string;
    userId: string;
    isOtpOnlySession?: boolean;
  }) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          email: true,
          isEmailVerified: true,
          lastSignupAttemptAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      // Scénario 2 (signup avec email existant, session OTP-only) : resend = 200 sans rien envoyer
      // Ne s'applique PAS si l'utilisateur a signin (session normale) → il peut demander un OTP
      const ONE_HOUR_MS = 60 * 60 * 1000;
      if (
        isOtpOnlySession &&
        user.lastSignupAttemptAt &&
        Date.now() - user.lastSignupAttemptAt.getTime() < ONE_HOUR_MS
      ) {
        return { success: true, message: 'Verification email sent' };
      }

      // Email déjà vérifié : ne pas envoyer d'OTP (rediriger vers signin)
      if (user.isEmailVerified) {
        console.log('User already has a verified email');
        return { success: true, message: 'Verification email sent' };
      }

      // Vérifier le cooldown (60s entre chaque demande)
      const existingVerification =
        await this.prisma.emailVerification.findUnique({
          where: { userId },
          select: { updatedAt: true },
        });

      if (existingVerification) {
        const secondsSinceLastRequest =
          (Date.now() - existingVerification.updatedAt.getTime()) / 1000;
        if (secondsSinceLastRequest < COOLDOWN_SECONDS) {
          EmailVerificationCooldownException.throw(this.logger, {
            transactionId,
            userId,
            retryAfter: Math.ceil(COOLDOWN_SECONDS - secondsSinceLastRequest),
          });
        }
      }

      // Créer un nouveau code de vérification
      const code = await this.generateCode(4);
      await this.prisma.emailVerification.upsert({
        where: { userId },
        create: {
          userId,
          emailCode: code,
          codeExpiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
        },
        update: {
          emailCode: code,
          codeExpiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
        },
      });

      // Envoyer l'email
      await this.emailService.sendEmail({
        to: user.email,
        type: 'verification',
        payload: {
          code,
          verificationUrl: this.getVerificationUrl(code),
        },
      });

      return { success: true, message: 'Verification email sent' };
    } catch (error) {
      EmailVerificationCreateException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }
}
