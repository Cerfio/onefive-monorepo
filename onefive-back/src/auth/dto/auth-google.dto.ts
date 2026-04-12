import { IsString, MinLength } from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class AuthGoogleDto {
  @IsString()
  code: string;

  @IsString()
  @MinLength(VALIDATION_LIMITS.AUTH.STATE_MIN)
  state: string;
}
