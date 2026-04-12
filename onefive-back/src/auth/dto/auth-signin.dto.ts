import { IsEmail, IsString, MinLength } from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class AuthSigninDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(VALIDATION_LIMITS.AUTH.PASSWORD_NON_EMPTY_MIN, {
    message: 'Le mot de passe ne peut pas être vide',
  })
  password: string;
}
