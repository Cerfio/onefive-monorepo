import { Injectable } from '@nestjs/common';
import { EmailVerificationService } from '../../email-verification/email-verification.service';

@Injectable()
export class EmailConfirmHandler {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  async execute({
    transactionId,
    userId,
    code,
  }: {
    transactionId: string;
    userId: string;
    code: string;
  }) {
    const result = await this.emailVerificationService.confirmEmailVerification(
      {
        transactionId,
        userId,
        code,
      },
    );

    return result;
  }
}
