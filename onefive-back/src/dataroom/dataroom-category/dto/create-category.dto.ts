import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';
import { SanitizeText } from '../../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../../../common/constants/validation-limits.constants';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(VALIDATION_LIMITS.DATAROOM.CATEGORY_NAME_MAX, {
    message: VALIDATION_MESSAGES.CATEGORY_NAME_TOO_LONG,
  })
  @SanitizeText()
  name: string;

  @IsOptional()
  @IsString()
  transactionId?: string;
}

export class CreateCategoryResponseDto {
  data: {
    id: string;
  };
}
