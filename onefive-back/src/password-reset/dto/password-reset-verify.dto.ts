import { IsString, Length } from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class PasswordResetVerifyDto {
  @IsString({ message: 'Le code doit être une chaîne de caractères' })
  @Length(VALIDATION_LIMITS.AUTH.RESET_CODE_LENGTH, VALIDATION_LIMITS.AUTH.RESET_CODE_LENGTH, { message: 'Le code doit contenir exactement 4 caractères' })
  code: string;

  @IsString({ message: 'Le token est requis' })
  token: string;
}
