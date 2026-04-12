import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  MaxLength,
  Length,
  IsUrl,
  ArrayMaxSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  SanitizeText,
  SanitizeHtml,
  SanitizeArray,
} from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../../common/constants/validation-limits.constants';
import { ProfileRole } from '../profile-role.config';

class SocialLinkDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.PROFILE.SOCIAL_TITLE_MAX)
  @SanitizeText()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsUrl()
  url: string;
}

export class UpdateProfileDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.PROFILE.FIRST_NAME_MAX, {
    message: VALIDATION_MESSAGES.FIRST_NAME_TOO_LONG,
  })
  @SanitizeText()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.PROFILE.LAST_NAME_MAX, {
    message: VALIDATION_MESSAGES.LAST_NAME_TOO_LONG,
  })
  @SanitizeText()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.PROFILE.TITLE_MAX, {
    message: VALIDATION_MESSAGES.TITLE_TOO_LONG,
  })
  @SanitizeText()
  title: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.PROFILE.BIO_MAX, {
    message: VALIDATION_MESSAGES.BIO_TOO_LONG,
  })
  @SanitizeHtml()
  bio: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SocialLinkDto)
  socials?: SocialLinkDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.PROFILE.SKILLS_ITEM_MAX, { each: true })
  @ArrayMaxSize(VALIDATION_LIMITS.PROFILE.SKILLS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.SKILLS_TOO_MANY,
  })
  @SanitizeArray()
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.PROFILE.INTERESTS_ITEM_MAX, { each: true })
  @ArrayMaxSize(VALIDATION_LIMITS.PROFILE.INTERESTS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.INTERESTS_TOO_MANY,
  })
  @SanitizeArray()
  interests?: string[];

  @IsOptional()
  @IsString()
  @Length(VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH, VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH)
  countryCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.CITY_MAX)
  @SanitizeText()
  city?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(2, { message: 'Maximum 2 rôles dans l\'écosystème' })
  @IsEnum(ProfileRole, { each: true })
  ecosystemRoles?: string[];
}

export class UpdateSkillsInterestsDto {
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.PROFILE.SKILLS_ITEM_MAX, { each: true })
  @ArrayMaxSize(VALIDATION_LIMITS.PROFILE.SKILLS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.SKILLS_TOO_MANY,
  })
  @SanitizeArray()
  skills?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.PROFILE.INTERESTS_ITEM_MAX, { each: true })
  @ArrayMaxSize(VALIDATION_LIMITS.PROFILE.INTERESTS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.INTERESTS_TOO_MANY,
  })
  @SanitizeArray()
  interests?: string[];
}
