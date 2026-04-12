import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from '../email/email.service';
import { Log } from '../common/logger/logger.decorator';
import { LogService } from 'logstash-winston-3';
import * as crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import {
  PasswordResetCreateException,
  PasswordResetNotFoundException,
  PasswordResetTooManyRequestsException,
  PasswordResetTooManyAttemptsException,
  AuthenticationPasswordResetBadCodeBadRequestException,
  AuthenticationPasswordResetCodeExpiredBadRequestException,
  AuthenticationPasswordResetInvalidTokenBadRequestException,
  AuthenticationPasswordResetPasswordsDoNotMatchBadRequestException,
} from './password-reset.exception';

@Injectable()
export class PasswordResetService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
    @Inject('Logger') private readonly logger: LogService,
  ) {}

  /**
   * Generates a random alphanumeric code of the given length.
   */
  private generateCode(length: number): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  }

  /**
   * Step 1: Request password reset — generates a code + token, sends email.
   */
  @Log()
  async requestReset({
    transactionId,
    email,
  }: {
    transactionId: string;
    email: string;
  }) {
    try {
      // Find user by email — we do NOT reveal whether the email exists
      const user = await this.prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (!user) {
        // Silent success to prevent email enumeration
        return {
          success: true,
          message: 'If this email exists, a reset code has been sent.',
        };
      }

      // Only EMAIL auth type users can reset their password
      if (user.authType !== 'EMAIL') {
        return {
          success: true,
          message: 'If this email exists, a reset code has been sent.',
        };
      }

      const resetCode = this.generateCode(4);
      const resetToken = crypto.randomUUID();

      // Transaction to prevent race condition: two simultaneous requests
      // could generate different codes, causing email code ≠ DB code
      await this.prisma.$transaction(async (tx) => {
        // Check cooldown: prevent spamming reset requests (60s minimum between requests)
        const existing = await tx.passwordReset.findUnique({
          where: { userId: user.id },
        });

        if (existing && Date.now() - existing.updatedAt.getTime() < 60_000) {
          PasswordResetTooManyRequestsException.throw(this.logger, {
            transactionId,
            userId: user.id,
            message: 'Please wait before requesting another reset code',
          });
        }

        // Upsert: create or update existing reset request (atomic within transaction)
        // Reset attempts to 0 when generating a new code (fresh start)
        await tx.passwordReset.upsert({
          where: { userId: user.id },
          create: {
            userId: user.id,
            resetCode,
            resetToken,
            codeExpiresAt: new Date(Date.now() + 20 * 60 * 1000), // 20 minutes
            isCodeVerified: false,
            attempts: 0,
          },
          update: {
            resetCode,
            resetToken,
            codeExpiresAt: new Date(Date.now() + 20 * 60 * 1000),
            isCodeVerified: false,
            attempts: 0, // Reset attempts counter on new code
          },
        });
      });

      // Send email with the code AND a link containing the token
      const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password/verify-link?token=${resetToken}`;

      await this.emailService.sendEmail({
        to: user.email,
        type: 'reset-password',
        payload: {
          code: resetCode,
          resetLink,
        },
      });

      return {
        success: true,
        message: 'If this email exists, a reset code has been sent.',
      };
    } catch (error) {
      if (
        error instanceof PasswordResetCreateException ||
        error instanceof PasswordResetTooManyRequestsException
      ) {
        throw error;
      }
      PasswordResetCreateException.throw(this.logger, { transactionId, error });
    }
  }

  /**
   * Step 2: Verify the OTP code + token combination.
   */
  @Log()
  async verifyCode({
    transactionId,
    code,
    token,
  }: {
    transactionId: string;
    code: string;
    token: string;
  }) {
    try {
      const passwordReset = await this.prisma.passwordReset.findUnique({
        where: { resetToken: token },
      });

      if (!passwordReset) {
        AuthenticationPasswordResetInvalidTokenBadRequestException.throw(
          this.logger,
          {
            transactionId,
            token,
          },
        );
      }

      if (passwordReset.codeExpiresAt < new Date()) {
        AuthenticationPasswordResetCodeExpiredBadRequestException.throw(
          this.logger,
          {
            transactionId,
            userId: passwordReset.userId,
          },
        );
      }

      // Brute-force protection: max 5 attempts per code
      if (passwordReset.attempts >= 5) {
        PasswordResetTooManyAttemptsException.throw(this.logger, {
          transactionId,
          userId: passwordReset.userId,
          message: 'Too many attempts. Please request a new reset code.',
        });
      }

      if (passwordReset.resetCode !== code.toUpperCase()) {
        // Increment attempts counter on wrong code
        await this.prisma.passwordReset.update({
          where: { id: passwordReset.id },
          data: { attempts: { increment: 1 } },
        });

        AuthenticationPasswordResetBadCodeBadRequestException.throw(
          this.logger,
          {
            transactionId,
            userId: passwordReset.userId,
          },
        );
      }

      // Mark code as verified — the user can now set a new password
      await this.prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { isCodeVerified: true, attempts: 0 },
      });

      return { success: true, message: 'Code verified successfully' };
    } catch (error) {
      if (
        error instanceof
          AuthenticationPasswordResetInvalidTokenBadRequestException ||
        error instanceof
          AuthenticationPasswordResetCodeExpiredBadRequestException ||
        error instanceof
          AuthenticationPasswordResetBadCodeBadRequestException ||
        error instanceof PasswordResetTooManyAttemptsException
      ) {
        throw error;
      }
      PasswordResetNotFoundException.throw(this.logger, {
        transactionId,
        error,
      });
    }
  }

  /**
   * Step 3: Reset the password after code verification.
   */
  @Log()
  async resetPassword({
    transactionId,
    token,
    password,
    confirmPassword,
  }: {
    transactionId: string;
    token: string;
    password: string;
    confirmPassword: string;
  }) {
    try {
      if (password !== confirmPassword) {
        AuthenticationPasswordResetPasswordsDoNotMatchBadRequestException.throw(
          this.logger,
          {
            transactionId,
          },
        );
      }

      const passwordReset = await this.prisma.passwordReset.findUnique({
        where: { resetToken: token },
      });

      if (!passwordReset) {
        AuthenticationPasswordResetInvalidTokenBadRequestException.throw(
          this.logger,
          {
            transactionId,
            token,
          },
        );
      }

      if (!passwordReset.isCodeVerified) {
        AuthenticationPasswordResetBadCodeBadRequestException.throw(
          this.logger,
          {
            transactionId,
            userId: passwordReset.userId,
            reason: 'Code not verified yet',
          },
        );
      }

      if (passwordReset.codeExpiresAt < new Date()) {
        AuthenticationPasswordResetCodeExpiredBadRequestException.throw(
          this.logger,
          {
            transactionId,
            userId: passwordReset.userId,
          },
        );
      }

      // Hash the new password using the same scheme as signup
      const saltRounds = process.env.NODE_ENV === 'test' ? 1 : 15;
      const hashedPassword = await bcrypt.hash(
        password.concat(process.env.KEY_AUTHENTICATION),
        saltRounds,
      );

      // Update the user's password
      const updatedUser = await this.prisma.user.update({
        where: { id: passwordReset.userId },
        data: { password: hashedPassword },
        select: {
          email: true,
          profile: { select: { firstName: true } },
        },
      });

      // Delete the password reset record
      await this.prisma.passwordReset.delete({
        where: { id: passwordReset.id },
      });

      // Invalidate all existing sessions for security
      await this.prisma.session.updateMany({
        where: { userId: passwordReset.userId },
        data: { isRevoked: true },
      });

      this.emailService
        .sendEmail({
          to: updatedUser.email,
          type: 'password-changed',
          payload: {
            firstName: updatedUser.profile?.firstName ?? 'there',
            userEmail: updatedUser.email,
          },
        })
        .catch(() => {});

      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      if (
        error instanceof
          AuthenticationPasswordResetPasswordsDoNotMatchBadRequestException ||
        error instanceof
          AuthenticationPasswordResetInvalidTokenBadRequestException ||
        error instanceof
          AuthenticationPasswordResetBadCodeBadRequestException ||
        error instanceof
          AuthenticationPasswordResetCodeExpiredBadRequestException
      ) {
        throw error;
      }
      PasswordResetCreateException.throw(this.logger, { transactionId, error });
    }
  }
}
