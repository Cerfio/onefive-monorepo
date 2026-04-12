import { Injectable } from '@nestjs/common';
import { EmailVerificationService } from '../../email-verification/email-verification.service';

@Injectable()
export class EmailRequestHandler {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async execute({
    transactionId,
    userId,
    isOtpOnlySession = false,
  }: {
    transactionId: string;
    userId: string;
    isOtpOnlySession?: boolean;
  }) {
    const result = await this.emailVerificationService.requestEmailVerification(
      {
        transactionId,
        userId,
        isOtpOnlySession,
      },
    );

    return result;
  }
}
