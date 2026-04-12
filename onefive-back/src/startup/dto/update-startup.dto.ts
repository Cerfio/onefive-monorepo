import {
  IsString,
  IsOptional,
  IsArray,
  IsDateString,
  Length,
  MaxLength,
  ArrayMaxSize,
} from 'class-validator';
import {
  SanitizeText,
  SanitizeHtml,
  SanitizeArray,
} from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class UpdateStartupDto {
  @IsOptional()
  @IsString()
  @Length(VALIDATION_LIMITS.STARTUP.NAME_MIN, VALIDATION_LIMITS.STARTUP.NAME_MAX)
  @SanitizeText()
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.TAGLINE_MAX)
  @SanitizeText()
  tagline?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.DESCRIPTION_MAX)
  @SanitizeHtml()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.WEBSITE_MAX)
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.LINKEDIN_MAX)
  linkedin?: string;

  @IsOptional()
  @IsDateString()
  foundedDate?: string;

  @IsOptional()
  @IsString()
  @Length(VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH, VALIDATION_LIMITS.STARTUP.COUNTRY_CODE_LENGTH)
  countryCode?: string;

  @IsOptional()
  @IsString()
  @Length(VALIDATION_LIMITS.STARTUP.CITY_MIN, VALIDATION_LIMITS.STARTUP.CITY_MAX)
  @SanitizeText()
  city?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.STARTUP.CATEGORIES_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.STARTUP.CATEGORY_MAX, { each: true })
  @SanitizeArray()
  categories?: string[];

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.LOGO_MAX)
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.STARTUP.COVER_IMAGE_MAX)
  coverImage?: string;
}
