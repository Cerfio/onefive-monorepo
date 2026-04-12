import {
  IsEmail,
  IsString,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../../common/constants/validation-limits.constants';

export class AuthSignupDto {
  @IsEmail({}, { message: VALIDATION_MESSAGES.EMAIL_INVALID })
  email: string;

  @IsString({ message: 'Le mot de passe doit être une chaîne de caractères' })
  @MinLength(VALIDATION_LIMITS.AUTH.PASSWORD_MIN, {
    message: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT,
  })
  @MaxLength(VALIDATION_LIMITS.AUTH.PASSWORD_MAX, {
    message: VALIDATION_MESSAGES.PASSWORD_TOO_LONG,
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: VALIDATION_MESSAGES.PASSWORD_WEAK,
  })
  password: string;
}
