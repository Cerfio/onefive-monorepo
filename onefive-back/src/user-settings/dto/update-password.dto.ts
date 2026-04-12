import { IsString, MinLength, MaxLength, Matches } from 'class-validator';
import {
  VALIDATION_LIMITS,
  VALIDATION_MESSAGES,
} from '../../common/constants/validation-limits.constants';

export class UpdatePasswordDto {
  @IsString()
  @MinLength(VALIDATION_LIMITS.AUTH.PASSWORD_MIN)
  currentPassword: string;

  @IsString()
  @MinLength(VALIDATION_LIMITS.AUTH.PASSWORD_MIN, {
    message: VALIDATION_MESSAGES.PASSWORD_TOO_SHORT,
  })
  @MaxLength(VALIDATION_LIMITS.AUTH.PASSWORD_MAX, {
    message: VALIDATION_MESSAGES.PASSWORD_TOO_LONG,
  })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: VALIDATION_MESSAGES.PASSWORD_WEAK,
  })
  newPassword: string;

  @IsString()
  @MinLength(VALIDATION_LIMITS.AUTH.PASSWORD_MIN)
  confirmPassword: string;
}
