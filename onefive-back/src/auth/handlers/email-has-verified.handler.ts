import { Injectable } from '@nestjs/common';
import { EmailVerificationService } from '../../email-verification/email-verification.service';

@Injectable()
export class EmailHasVerifiedHandler {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async execute({
    transactionId,
    userId,
  }: {
    transactionId: string;
    userId: string;
  }) {
    const result =
      await this.emailVerificationService.checkEmailVerificationStatus({
        transactionId,
        userId,
      });

    return {
      email: result.email,
      isVerified: result.isVerified,
    };
  }
}
