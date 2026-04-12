import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class FollowProfileDto {
  @IsString()
  @IsNotEmpty()
  @Length(
    VALIDATION_LIMITS.IDENTIFIERS.PROFILE_ID_MIN,
    VALIDATION_LIMITS.IDENTIFIERS.PROFILE_ID_MAX,
    {
      message: 'Profile ID must be between 1 and 100 characters',
    },
  )
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message:
      'Profile ID can only contain letters, numbers, hyphens, and underscores',
  })
  profileId: string;
}
