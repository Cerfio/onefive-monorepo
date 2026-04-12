import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { SanitizeHtml } from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export class UpdateMessageDto {
  @IsNotEmpty()
  @IsString()
  messageId: string;

  @IsNotEmpty()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.MESSAGING.MESSAGE_CONTENT_MAX)
  @SanitizeHtml()
  content: string;
}
