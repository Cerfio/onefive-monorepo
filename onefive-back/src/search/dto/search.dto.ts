import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { SanitizeText } from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class SearchQueryDto {
  @IsString()
  @MinLength(VALIDATION_LIMITS.SEARCH.QUERY_MIN, { message: 'Search query must be at least 2 characters' })
  @SanitizeText()
  q: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(VALIDATION_LIMITS.SEARCH.LIMIT_MIN)
  @Max(VALIDATION_LIMITS.SEARCH.LIMIT_MAX)
  limit?: number = 20;
}
