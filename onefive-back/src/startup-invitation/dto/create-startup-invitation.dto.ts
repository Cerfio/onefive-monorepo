import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  Max,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class CreateStartupInvitationDto {
  @IsOptional()
  @IsString()
  profileId?: string; // Pour utilisateur existant

  @ValidateIf((o) => !o.profileId)
  @IsOptional()
  @IsString()
  email?: string; // Pour nouvel utilisateur

  @ValidateIf((o) => !o.profileId && o.email)
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FIRST_NAME_MAX)
  firstName?: string;

  @ValidateIf((o) => !o.profileId && o.email)
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.LAST_NAME_MAX)
  lastName?: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.POSITION_MAX)
  position: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  equity: number;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.INVITATION_MESSAGE_MAX)
  message?: string;
}
