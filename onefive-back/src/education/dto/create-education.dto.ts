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

export class CreateEducationDto {
  @IsString()
  @Length(VALIDATION_LIMITS.EDUCATION.DEGREE_MIN, VALIDATION_LIMITS.EDUCATION.DEGREE_MAX, {
    message: VALIDATION_MESSAGES.DEGREE_REQUIRED,
  })
  @SanitizeText()
  degree: string;

  @IsString()
  @Length(VALIDATION_LIMITS.EDUCATION.SCHOOL_MIN, VALIDATION_LIMITS.EDUCATION.SCHOOL_MAX, {
    message: VALIDATION_MESSAGES.SCHOOL_REQUIRED,
  })
  @SanitizeText()
  school: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.DOMAIN_MAX)
  @SanitizeText()
  domain?: string;

  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.CITY_MAX)
  @SanitizeText()
  city: string;

  @IsDateString()
  from: string;

  @IsOptional()
  @IsDateString()
  to?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.DESCRIPTION_MAX, {
    message: VALIDATION_MESSAGES.DESCRIPTION_TOO_LONG,
  })
  @SanitizeHtml()
  description?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.EDUCATION.URL_LINKEDIN_MAX)
  urlLinkedin?: string;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(VALIDATION_LIMITS.EDUCATION.TAGS_MAX_COUNT)
  @IsString({ each: true })
  @MaxLength(VALIDATION_LIMITS.EDUCATION.TAG_MAX, { each: true })
  @SanitizeArray()
  tags?: string[];
}
