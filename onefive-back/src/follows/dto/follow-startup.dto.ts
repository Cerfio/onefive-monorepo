import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class FollowStartupDto {
  @IsString()
  @IsNotEmpty()
  @Length(
    VALIDATION_LIMITS.IDENTIFIERS.STARTUP_ID_MIN,
    VALIDATION_LIMITS.IDENTIFIERS.STARTUP_ID_MAX,
    {
      message: 'Startup ID must be between 1 and 100 characters',
    },
  )
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Startup ID can only contain letters, numbers, hyphens, and underscores',
  })
  startupId: string;
}
