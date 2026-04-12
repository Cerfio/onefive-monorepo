import { Injectable } from '@nestjs/common';
import { PasswordResetService } from '../password-reset.service';
import { Log } from 'src/common/logger/logger.decorator';

@Injectable()
export class PasswordResetRequestHandler {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Log()
  async execute({
    transactionId,
    email,
  }: {
    transactionId: string;
    email: string;
  }) {
    return this.passwordResetService.requestReset({
      transactionId,
      email,
    });
  }
}
