import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsEmail,
  MaxLength,
} from 'class-validator';
import { StartupMemberRoleType } from '@prisma/client';
import {
  SanitizeText,
  SanitizeHtml,
} from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class InviteMemberDto {
  @IsOptional()
  @IsString()
  profileId?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.FIRST_NAME_MAX)
  @SanitizeText()
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.LAST_NAME_MAX)
  @SanitizeText()
  lastName?: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.POSITION_MAX)
  @SanitizeText()
  position: string;

  @IsOptional()
  @IsEnum(StartupMemberRoleType)
  role: StartupMemberRoleType = StartupMemberRoleType.MEMBER;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.MESSAGE_MAX)
  @SanitizeHtml()
  message?: string;
}
