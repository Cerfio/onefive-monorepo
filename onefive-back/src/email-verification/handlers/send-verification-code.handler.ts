import { Injectable } from '@nestjs/common';
import { EmailVerificationService } from '../email-verification.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class SendVerificationCodeHandler {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Log()
  async execute({
    transactionId,
    email,
    userId,
  }: {
    transactionId: string;
    email: string;
    userId: string;
  }) {
    const emailVerification = await this.emailVerificationService.create({
      transactionId,
      data: {
        email,
        userId,
      },
    });

    return {
      success: true,
      message: 'Verification code sent successfully',
      emailVerificationId: emailVerification.id,
    };
  }
}
