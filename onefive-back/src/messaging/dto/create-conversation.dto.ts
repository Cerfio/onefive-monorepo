import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  MaxLength,
} from 'class-validator';
import {
  SanitizeText,
  SanitizeHtml,
} from '../../common/decorators/sanitize.decorator';
import { VALIDATION_LIMITS } from '../../common/constants/validation-limits.constants';

export enum ConversationType {
  DIRECT = 'DIRECT',
  GROUP = 'GROUP',
}

export class CreateConversationDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  participantIds: string[];

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.MESSAGING.CONVERSATION_NAME_MAX)
  @SanitizeText()
  name?: string;

  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @IsOptional()
  @IsString()
  @MaxLength(VALIDATION_LIMITS.MESSAGING.INITIAL_MESSAGE_MAX)
  @SanitizeHtml()
  initialMessage?: string;
}
