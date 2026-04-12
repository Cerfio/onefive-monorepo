import {
  IsEnum,
  IsOptional,
  IsString,
  IsArray,
  MaxLength,
  MinLength,
  ArrayMaxSize,
  ArrayMinSize,
} from 'class-validator';
import { DiscussionType } from '@prisma/client';
import {
  SanitizeText,
  SanitizeHtml,
  SanitizeArray,
} from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../../common/constants/validation-limits.constants';

export class CreateDiscussionBodyDto {
  @IsString()
  @MaxLength(VALIDATION_LIMITS.DISCUSSION.QUESTION_MAX, {
    message: VALIDATION_MESSAGES.QUESTION_TOO_LONG,
  })
  @MinLength(VALIDATION_LIMITS.DISCUSSION.QUESTION_MIN, {
    message: VALIDATION_MESSAGES.QUESTION_TOO_SHORT,
  })
  @SanitizeText()
  question: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.DISCUSSION.CONTENT_MAX, {
    message: VALIDATION_MESSAGES.CONTENT_TOO_LONG_DISCUSSION,
  })
  @SanitizeHtml()
  content?: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.DISCUSSION.CONTEXT_MAX)
  @SanitizeText()
  context?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.OPTIONS_TOO_MANY,
  })
  @ArrayMinSize(VALIDATION_LIMITS.DISCUSSION.OPTIONS_MIN_COUNT, {
    message: VALIDATION_MESSAGES.OPTIONS_TOO_FEW,
  })
  @SanitizeArray()
  options?: string[];

  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(VALIDATION_LIMITS.DISCUSSION.TAGS_MAX_COUNT, {
    message: VALIDATION_MESSAGES.TAGS_TOO_MANY_DISCUSSION,
  })
  @ArrayMinSize(VALIDATION_LIMITS.DISCUSSION.TAGS_MIN_COUNT, {
    message: VALIDATION_MESSAGES.TAGS_TOO_FEW,
  })
  @SanitizeArray()
  tags: string[];

  @IsEnum(DiscussionType)
  type: DiscussionType;
}
