import {
  IsOptional,
  IsInt,
  Min,
  Max,
  IsString,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class FeedQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(VALIDATION_LIMITS.PAGINATION.SKIP_MIN)
  skip?: number = 0;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(VALIDATION_LIMITS.PAGINATION.TAKE_MIN)
  @Max(VALIDATION_LIMITS.POST.FEED_LIMIT_MAX)
  limit?: number = 5;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.SEARCH.QUERY_MAX)
  tags?: string;
}
