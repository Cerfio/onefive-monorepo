import { Injectable } from '@nestjs/common';
import { EmailService } from '../email.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class EmailVerificationExample {
  constructor(private readonly emailService: EmailService) {}

  @Log()
  async sendVerificationCode({
    transactionId,
    email,
    code,
  }: {
    transactionId: string;
    email: string;
    code: string;
  }) {
    const result = await this.emailService.sendEmail({
      to: email,
      type: 'verification',
      payload: {
        code,
      },
    });

    return {
      success: result.success,
      emailId: result.success,
      message: 'Verification code sent successfully',
    };
  }

  @Log()
  async sendPasswordReset({
    transactionId,
    email,
    resetLink,
  }: {
    transactionId: string;
    email: string;
    resetLink: string;
  }) {
    const result = await this.emailService.sendEmail({
      to: email,
      type: 'reset-password',
      payload: {
        resetLink,
      },
    });

    return {
      success: result.success,
      emailId: result.success,
      message: 'Password reset email sent successfully',
    };
  }
}
