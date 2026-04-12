import { Injectable } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { Log } from 'src/common/logger/logger.decorator';
import { UsersService } from 'src/users/users.service';
import { AuthType } from '@prisma/client';
import { SessionsService } from 'src/sessions/sessions.service';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';
import { EmailService } from 'src/email/email.service';
import * as bcrypt from 'bcrypt';
import { PostHogService } from 'src/posthog/posthog.service';

@Injectable()
export class SignupHandler {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly sessionService: SessionsService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly emailService: EmailService,
    private readonly posthogService: PostHogService,
  ) {}

  @Log()
  async execute({
    transactionId,
    email,
    password,
    ip,
    userAgent,
  }: {
    transactionId: string;
    email: string;
    password: string;
    ip?: string;
    userAgent?: string;
  }) {
    const normalizedEmail = email.toLowerCase();

    // Vérifier si l'email existe déjà (anti-enumération : même réponse que signup réussi)
    const existingUser = await this.usersService.findOne({
      transactionId,
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      const ONE_HOUR_MS = 60 * 60 * 1000;
      const canSendSecurityEmail =
        !existingUser.lastSignupAttemptAt ||
        Date.now() - existingUser.lastSignupAttemptAt.getTime() > ONE_HOUR_MS;

      if (canSendSecurityEmail) {
        const signinUrl = process.env.FRONTEND_URL || '';
        const fullSigninUrl = `${signinUrl.replace(/\/$/, '')}/signin`;

        this.emailService
          .sendEmail({
            to: normalizedEmail,
            type: 'signup-existing-account',
            payload: {
              firstName: 'there',
              userEmail: normalizedEmail,
              signinUrl: fullSigninUrl,
            },
          })
          .catch(() => {});

        await this.usersService.update({
          transactionId,
          where: { id: existingUser.id },
          data: { lastSignupAttemptAt: new Date() },
        });
      }

      const session = await this.sessionService.createSession({
        transactionId,
        data: {
          userId: existingUser.id,
          userAgent,
          ipAddress: ip,
          isOtpOnlySession: true,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });

      return {
        sessionId: session.sessionId,
        setCookie: true,
      };
    }

    const saltRounds = process.env.NODE_ENV === 'test' ? 1 : 15;
    const hashedPassword = await bcrypt.hash(
      password.concat(process.env.KEY_AUTHENTICATION),
      saltRounds,
    );
    const user = await this.usersService.create({
      transactionId,
      data: {
        email: normalizedEmail,
        password: hashedPassword,
        authType: AuthType.EMAIL,
        isEmailVerified: process.env.E2E_AUTO_VERIFY_SIGNUP === 'true',
      },
    });

    this.posthogService.capture(user.id, 'user_signed_up', {
      auth_type: 'EMAIL',
    });
    this.posthogService.identify(user.id, { email: normalizedEmail });

    // Note: Referral acceptance is now handled at profile creation time
    // (in create-profile.handler.ts via WaitlistService.processNewProfile)
    // This ensures the referral is linked to the Profile, not the User.

    const session = await this.sessionService.createSession({
      transactionId,
      data: {
        userId: user.id,
        userAgent,
        ipAddress: ip,
      },
    });

    // Envoi automatique du code OTP par email (non-bloquant)
    this.emailVerificationService
      .create({
        transactionId,
        data: { email: user.email, userId: user.id },
      })
      .catch(() => {
        // L'utilisateur peut cliquer "resend" sur la page de confirmation
      });

    return {
      sessionId: session.sessionId,
      setCookie: true,
    };
  }
}
