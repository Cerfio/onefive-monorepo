import { IsString, IsOptional, MaxLength } from 'class-validator';
import { SanitizeHtml } from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS, VALIDATION_MESSAGES } from '../../common/constants/validation-limits.constants';

export class CreateRepostDto {
  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.POST.CONTENT_MAX, {
    message: VALIDATION_MESSAGES.CONTENT_TOO_LONG,
  })
  @SanitizeHtml()
  content?: string;
}
