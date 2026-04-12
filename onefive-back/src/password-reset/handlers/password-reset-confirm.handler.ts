import { Injectable } from '@nestjs/common';
import { PasswordResetService } from '../password-reset.service';
import { Log } from 'src/common/logger/logger.decorator';

@Injectable()
export class PasswordResetConfirmHandler {
  constructor(private readonly passwordResetService: PasswordResetService) {}

  @Log()
  async execute({
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
    return this.passwordResetService.resetPassword({
      transactionId,
      token,
      password,
      confirmPassword,
    });
  }
}
