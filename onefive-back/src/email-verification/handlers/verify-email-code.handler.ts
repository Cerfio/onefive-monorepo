import { Injectable } from '@nestjs/common';
import { EmailVerificationService } from '../email-verification.service';
import { Log } from '../../common/logger/logger.decorator';

@Injectable()
export class VerifyEmailCodeHandler {
  constructor(
    private readonly emailVerificationService: EmailVerificationService,
  ) {}

  @Log()
  async execute({
    transactionId,
    email,
    code,
  }: {
    transactionId: string;
    email: string;
    code: string;
  }) {
    const result = await this.emailVerificationService.verifyCode({
      transactionId,
      email,
      code,
    });

    return result;
  }
}
