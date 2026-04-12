import { Injectable } from '@nestjs/common';
import { PasswordResetService } from '../password-reset.service';
import { Log } from 'src/common/logger/logger.decorator';

@Injectable()
export class PasswordResetVerifyHandler {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Log()
  async execute({
    transactionId,
    code,
    token,
  }: {
    transactionId: string;
    code: string;
    token: string;
  }) {
    return this.passwordResetService.verifyCode({
      transactionId,
      code,
      token,
    });
  }
}
