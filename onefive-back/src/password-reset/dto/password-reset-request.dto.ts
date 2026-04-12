import { IsEmail } from 'class-validator';

export class PasswordResetRequestDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;
}
