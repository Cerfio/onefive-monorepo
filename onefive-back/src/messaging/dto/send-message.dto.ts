import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MaxLength,
} from 'class-validator';
import { SanitizeHtml } from '../../common/decorators/sanitize.decorator';
import {
  VALIDATION_LIMITS,
  VALIDATION_MESSAGES,
} from '../../common/constants/validation-limits.constants';

export enum MessageType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  FILE = 'FILE',
  AUDIO = 'AUDIO',
  VIDEO = 'VIDEO',
}

export class SendMessageDto {
  @IsNotEmpty()
  @IsString()
  conversationId: string;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.MESSAGING.MESSAGE_CONTENT_MAX, {
    message: VALIDATION_MESSAGES.MESSAGE_TOO_LONG,
  })
  @SanitizeHtml()
  content?: string;

  @IsOptional()
  @IsEnum(MessageType)
  type?: MessageType;

  @IsOptional()
  @IsString()
  replyToId?: string;

  @IsOptional()
  @IsString()
  attachmentId?: string;
}
