import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class GetCitySuggestionsDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(VALIDATION_LIMITS.SEARCH.QUERY_MIN)
  query: string;

  @IsString()
  @IsNotEmpty()
  countryCode: string;
}
