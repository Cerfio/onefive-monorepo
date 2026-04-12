import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  Length,
  MaxLength,
  ArrayMaxSize,
  IsUrl,
  Min,
  Max,
  IsEmail,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import {
  SanitizeText,
  SanitizeHtml,
  SanitizeArray,
} from '../../common/decorators/sanitize.decorator';
import {
  sanitizeText,
  sanitizeRichText,
} from '../../common/utils/sanitize.utils';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../../common/constants/validation-limits.constants';

export class StartupInvitationDto {
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

  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.POSITION_MAX)
  @SanitizeText()
  position: string;

  @IsNumber()
  @Min(VALIDATION_LIMITS.STARTUP.EQUITY_MIN)
  @Max(VALIDATION_LIMITS.STARTUP.EQUITY_MAX)
  equity: number;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.MESSAGE_MAX)
  @SanitizeHtml()
  message?: string;
}

export class CreateStartupDto {
  @IsString()
  @Length(VALIDATION_LIMITS.STARTUP.NAME_MIN, VALIDATION_LIMITS.STARTUP.NAME_MAX, {
    message: VALIDATION_MESSAGES.NAME_REQUIRED,
  })
  @SanitizeText()
  name: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.TAGLINE_MAX, {
    message: VALIDATION_MESSAGES.TAGLINE_REQUIRED,
  })
  @SanitizeText()
  tagline: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX, {
    message: VALIDATION_MESSAGES.DESCRIPTION_REQUIRED,
  })
  @SanitizeHtml()
  description: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.WEBSITE_MAX)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.LINKEDIN_MAX)
  linkedin?: string;

  @IsDateString()
  foundedDate: string;

  @IsString()
  @Length(VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH, VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH)
  countryCode: string;

  @IsString()
  @Length(VALIDATION_LIMITS.STARTUP.CITY_MIN, VALIDATION_LIMITS.STARTUP.CITY_MAX)
  @SanitizeText()
  city: string;

  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT, {
    message: VALIDATION_MESSAGES.CATEGORIES_TOO_MANY,
  })
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.STARTUP.CATEGORY_MAX, { each: true })
  @SanitizeArray()
  categories: string[];

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.LOGO_MAX)
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.COVER_IMAGE_MAX)
  coverImage?: string;

  // Invitations à envoyer pendant la création
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.STARTUP.INVITATIONS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.INVITATIONS_TOO_MANY,
  })
  @ValidateNested({ each: true })
  @Type(() => StartupInvitationDto)
  invitations?: StartupInvitationDto[];
}
