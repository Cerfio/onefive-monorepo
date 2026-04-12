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
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../../common/constants/validation-limits.constants';

export class CreateExperienceDto {
  @IsString()
  @Length(VALIDATION_LIMITS.EXPERIENCE.TITLE_MIN, VALIDATION_LIMITS.EXPERIENCE.TITLE_MAX, {
    message: VALIDATION_MESSAGES.TITLE_REQUIRED_EXP,
  })
  @SanitizeText()
  title: string;

  @IsString()
  @Length(VALIDATION_LIMITS.EXPERIENCE.COMPANY_MIN, VALIDATION_LIMITS.EXPERIENCE.COMPANY_MAX, {
    message: VALIDATION_MESSAGES.COMPANY_REQUIRED,
  })
  @SanitizeText()
  company: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.DOMAIN_MAX)
  @SanitizeText()
  domain?: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.CITY_MAX)
  @SanitizeText()
  city: string;

  @IsDateString()
  from: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.DESCRIPTION_MAX, {
    message: VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG,
  })
  @SanitizeHtml()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.URL_LINKEDIN_MAX)
  urlLinkedin?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.EXPERIENCE.TAGS_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.EXPERIENCE.TAG_MAX, { each: true })
  @SanitizeArray()
  tags?: string[];
}
